import unittest
from unittest.mock import patch, AsyncMock, MagicMock
from services.github_analyzer import SEMANTIC_PREFIX_PATTERN, LAZY_COMMIT_PATTERN, analyze_github_profile
from models.github import GitHubAnalysisResponse, GitHubMetrics, RepoMetric


class TestGitHubAnalyzer(unittest.IsolatedAsyncioTestCase):

    def test_semantic_commit_pattern(self):
        self.assertTrue(bool(SEMANTIC_PREFIX_PATTERN.search("feat: add auth middleware")))
        self.assertTrue(bool(SEMANTIC_PREFIX_PATTERN.search("fix(api): resolve null pointer")))
        self.assertTrue(bool(SEMANTIC_PREFIX_PATTERN.search("docs: update README")))
        self.assertTrue(bool(SEMANTIC_PREFIX_PATTERN.search("chore: bump deps")))
        self.assertFalse(bool(SEMANTIC_PREFIX_PATTERN.search("update files")))
        self.assertFalse(bool(SEMANTIC_PREFIX_PATTERN.search("fixed bug")))

    def test_lazy_commit_pattern(self):
        self.assertTrue(bool(LAZY_COMMIT_PATTERN.search("update")))
        self.assertTrue(bool(LAZY_COMMIT_PATTERN.search("fixed")))
        self.assertTrue(bool(LAZY_COMMIT_PATTERN.search("wip")))
        self.assertTrue(bool(LAZY_COMMIT_PATTERN.search("asdf")))
        self.assertFalse(bool(LAZY_COMMIT_PATTERN.search("feat: implement dashboard")))

    @patch("services.github_analyzer.invoke_groq_llm")
    @patch("httpx.AsyncClient")
    async def test_analyze_github_profile_mock(self, mock_client_cls, mock_groq):
        mock_groq.return_value = {
            "choices": [{"message": {"content": "Forensic test summary."}}]
        }
        mock_client = AsyncMock()
        mock_client_cls.return_value.__aenter__.return_value = mock_client


        # Mock User Info Response
        mock_user_resp = MagicMock()
        mock_user_resp.status_code = 200
        mock_user_resp.json.return_value = {
            "login": "testuser",
            "public_repos": 5,
        }

        # Mock Repositories Response (1 original, 1 fork)
        mock_repos_resp = MagicMock()
        mock_repos_resp.status_code = 200
        mock_repos_resp.json.return_value = [
            {
                "name": "original-flagship",
                "fork": False,
                "stargazers_count": 15,
                "forks_count": 3,
                "size": 4500,
                "language": "Python",
                "created_at": "2024-01-01T00:00:00Z",
                "pushed_at": "2024-08-01T00:00:00Z",
                "description": "Awesome flagship python backend service",
            },
            {
                "name": "forked-repo",
                "fork": True,
                "stargazers_count": 100,
                "forks_count": 50,
                "size": 10000,
                "language": "JavaScript",
                "created_at": "2023-01-01T00:00:00Z",
                "pushed_at": "2023-05-01T00:00:00Z",
                "description": "Forked third party repo",
            },
        ]

        # Mock Events Response
        mock_events_resp = MagicMock()
        mock_events_resp.status_code = 200
        mock_events_resp.json.return_value = []

        # Mock PR Search Response
        mock_prs_resp = MagicMock()
        mock_prs_resp.status_code = 200
        mock_prs_resp.json.return_value = {"items": []}

        # Mock Repo Contents
        mock_contents_resp = MagicMock()
        mock_contents_resp.status_code = 200
        mock_contents_resp.json.return_value = [
            {"name": "tests", "type": "dir"},
            {"name": "requirements.txt", "type": "file"},
        ]

        # Mock Repo Commits
        mock_commits_resp = MagicMock()
        mock_commits_resp.status_code = 200
        mock_commits_resp.json.return_value = [
            {"commit": {"message": "feat: add initial architecture"}},
            {"commit": {"message": "fix: resolve memory leakage"}},
        ]
        mock_commits_resp.headers = {}

        def get_side_effect(url, *args, **kwargs):
            if "/users/testuser/repos" in url:
                return mock_repos_resp
            elif "/users/testuser/events" in url:
                return mock_events_resp
            elif "/search/issues" in url:
                return mock_prs_resp
            elif "/users/testuser" in url:
                return mock_user_resp
            elif "/contents" in url:
                return mock_contents_resp
            elif "/commits" in url:
                return mock_commits_resp
            return MagicMock(status_code=404)

        mock_client.get.side_effect = get_side_effect

        res = await analyze_github_profile("testuser")

        self.assertIsInstance(res, GitHubAnalysisResponse)
        self.assertEqual(res.username, "testuser")
        self.assertEqual(res.metrics.original_repos_count, 1)
        self.assertEqual(res.metrics.total_repos_scanned, 2)
        self.assertGreaterEqual(res.gpi_score, 0.0)
        self.assertLessEqual(res.gpi_score, 100.0)
        self.assertGreaterEqual(res.metrics.code_quality_score, 0.0)
        self.assertGreaterEqual(res.metrics.git_hygiene_score, 0.0)


if __name__ == "__main__":
    unittest.main()
