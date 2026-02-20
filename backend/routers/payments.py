import stripe
from fastapi import APIRouter, Request, Header, HTTPException
from config import settings
from dependencies import get_supabase_admin

router = APIRouter()

stripe.api_key = settings.stripe_secret_key

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None)
):
    """Handle Stripe webhooks for subscription updates."""
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=400, detail="Stripe webhook secret not configured")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.stripe_webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # Typically, you pass user_id via client_reference_id
        client_reference_id = session.get("client_reference_id")
        
        if client_reference_id:
            db = get_supabase_admin()
            # Upgrade the user's plan in Supabase Auth user metadata
            # For simplicity, assuming "pro" plan. In reality, determine via line_items
            db.auth.admin.update_user_by_id(
                client_reference_id,
                {"user_metadata": {"plan": "pro"}}
            )
            
            # Also update profiles table if it exists
            db.table("profiles").update({"plan": "pro"}).eq("id", client_reference_id).execute()

    return {"status": "success"}
