## 2024-06-11 - Synchronous DB Clients in Async Fast API
**Learning:** Found a major latency bottleneck where multiple synchronous Supabase client calls `.execute()` were being made sequentially inside an `async def` FastAPI service (`get_user_readiness_context`). This not only causes N+1 query patterns but blocks the main async event loop.
**Action:** When using synchronous client libraries within an async route, wrap `.execute()` queries in `asyncio.to_thread()` and run independent queries concurrently using `asyncio.gather()`.
