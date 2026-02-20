import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import settings
from supabase import create_client, Client

def get_supabase_admin() -> Client:
    """Return a Supabase client with service role (admin) access."""
    url = settings.supabase_url
    key = settings.supabase_service_key
    if not url or not key:
        print("❌ Missing SUPABASE_url or SUPABASE_SERVICE_KEY in .env")
        sys.exit(1)
    return create_client(url, key)

async def set_user_plan(email: str, plan: str):
    print(f"🔍 Looking up user: {email}")
    admin = get_supabase_admin()
    
    # 1. List users to find the ID (Admin API)
    # Note: list_users() might be paginated, for now we just fetch first page
    try:
        users = admin.auth.admin.list_users()
        target_user = next((u for u in users if u.email == email), None)
        
        if not target_user:
            print(f"❌ User not found: {email}")
            return

        print(f"✅ Found user: {target_user.id}")
        
        # 2. Update user metadata
        print(f"📝 Updating plan to '{plan}'...")
        admin.auth.admin.update_user_by_id(
            target_user.id,
            {"user_metadata": {**target_user.user_metadata, "plan": plan}}
        )
        print(f"✨ Success! User {email} is now on '{plan}' plan.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 set_user_plan.py <email> <plan>")
        print("Example: python3 set_user_plan.py user@example.com pro")
        sys.exit(1)
    
    email = sys.argv[1]
    plan = sys.argv[2]
    asyncio.run(set_user_plan(email, plan))
