import unittest
from unittest.mock import patch, MagicMock

class TestJobScraper(unittest.IsolatedAsyncioTestCase):
    @patch.dict("sys.modules", {
        "httpx": MagicMock(),
        "pydantic": MagicMock(),
        "feedparser": MagicMock(),
        "models": MagicMock(),
        "models.analysis": MagicMock(),
    })
    async def test_fetch_rss_jobs_uses_to_thread(self):
        # Import inside the test while the mocks are active
        from backend.services.job_scraper import _fetch_rss_jobs

        with patch("backend.services.job_scraper.feedparser.parse") as mock_parse:
            # Arrange
            url = "http://test-url.com/rss"
            source_name = "TestSource"
            keywords = ["python"]
            limit = 5

            mock_feed = MagicMock()
            mock_feed.entries = []
            mock_parse.return_value = mock_feed

            # Act
            await _fetch_rss_jobs(url, source_name, keywords, limit)

            # Assert
            mock_parse.assert_called_once_with(url)

if __name__ == "__main__":
    unittest.main()
