💡 What
Offloaded synchronous Supabase `.execute()` database queries to a background thread using `asyncio.to_thread(lambda: ...)` in `applications.py`.

🎯 Why
Because `supabase-py` executes its `.execute()` calls synchronously, keeping them directly inside FastAPI `async def` endpoints blocks the main event loop. This significantly degraded concurrent performance and response times under load.

📊 Impact
Prevents event loop blocking, which allows FastAPI to serve other requests concurrently while waiting for the database response. Reduces latency bottlenecks in the applications router endpoints.

🔬 Measurement
Load test the endpoints with multiple concurrent requests to observe an improvement in overall server throughput, or check CPU thread utilization ensuring the main async loop is not blocked during Supabase DB operations.
