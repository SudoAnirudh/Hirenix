import unittest
from unittest.mock import patch
from unittest.mock import MagicMock

# Mock required dependencies to bypass ModuleNotFoundError in constrained test env
mock_httpx = MagicMock()
mock_config = MagicMock()
mock_groq_client = MagicMock()
mock_models = MagicMock()

class TestGitHubAnalyzerSecurity(unittest.IsolatedAsyncioTestCase):

    @patch.dict('sys.modules', {
        'httpx': mock_httpx,
        'config': mock_config,
        'services.groq_client': mock_groq_client,
        'models.github': mock_models,
        'utils.scoring_weights': MagicMock(),
    })
    def setUp(self):
        # We must import inside the test environment where mocks are active
        from backend.services.github_analyzer import analyze_github_profile
        self.analyze_github_profile = analyze_github_profile

    async def test_analyze_github_profile_valid_username(self):
        # Just ensure it doesn't raise ValueError for a valid username
        try:
            # We expect an exception here eventually because the mock doesn't return full valid JSON,
            # but we just want to verify it PASSES the ValueError validation check first.
            await self.analyze_github_profile("valid-user-123")
        except ValueError:
            self.fail("analyze_github_profile raised ValueError unexpectedly for valid username!")
        except Exception:
            pass # Other exceptions are fine, we just care it didn't fail the regex

    async def test_analyze_github_profile_invalid_username_path_traversal(self):
        with self.assertRaisesRegex(ValueError, "Invalid GitHub username provided."):
            await self.analyze_github_profile("../etc/passwd")

    async def test_analyze_github_profile_invalid_username_spaces(self):
        with self.assertRaisesRegex(ValueError, "Invalid GitHub username provided."):
            await self.analyze_github_profile("invalid user")

    async def test_analyze_github_profile_invalid_username_too_long(self):
        long_username = "a" * 40
        with self.assertRaisesRegex(ValueError, "Invalid GitHub username provided."):
            await self.analyze_github_profile(long_username)

    async def test_analyze_github_profile_invalid_username_special_chars(self):
        with self.assertRaisesRegex(ValueError, "Invalid GitHub username provided."):
            await self.analyze_github_profile("user!name")

    async def test_analyze_github_profile_invalid_username_starts_with_hyphen(self):
        with self.assertRaisesRegex(ValueError, "Invalid GitHub username provided."):
            await self.analyze_github_profile("-username")

    async def test_analyze_github_profile_invalid_username_ends_with_hyphen(self):
        with self.assertRaisesRegex(ValueError, "Invalid GitHub username provided."):
            await self.analyze_github_profile("username-")

    async def test_analyze_github_profile_invalid_username_double_hyphen(self):
        with self.assertRaisesRegex(ValueError, "Invalid GitHub username provided."):
            await self.analyze_github_profile("user--name")

if __name__ == '__main__':
    unittest.main()
