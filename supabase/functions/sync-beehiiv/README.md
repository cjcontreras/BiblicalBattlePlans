# Sync Beehiiv Edge Function

This Edge Function automatically adds new users to your Beehiiv email list when they sign up for Biblical Battle Plans.

## How It Works

1. A new user signs up and a row is inserted into the `profiles` table
2. A database webhook fires and calls this Edge Function
3. The function sends the user's email to the Beehiiv API
4. The user is added to your Beehiiv publication's subscriber list

## Required Environment Variables

Set these in your Supabase Dashboard under Project Settings > Edge Functions:

| Variable | Description |
|----------|-------------|
| `BEEHIIV_API_KEY` | Your Beehiiv API key (from Beehiiv Dashboard > Settings > API) |
| `BEEHIIV_PUBLICATION_ID` | Your publication ID (found in your Beehiiv URL or API settings) |

## Setting Up the Database Webhook

1. Go to your Supabase Dashboard
2. Navigate to **Database > Webhooks**
3. Click **Create a new webhook**
4. Configure:
   - **Name:** `sync-beehiiv-on-signup`
   - **Table:** `profiles`
   - **Events:** `INSERT`
   - **Type:** `Supabase Edge Functions`
   - **Edge Function:** `sync-beehiiv`

## Deploying the Function

```bash
# Deploy to Supabase
supabase functions deploy sync-beehiiv

# Set the environment variables
supabase secrets set BEEHIIV_API_KEY=your_api_key_here
supabase secrets set BEEHIIV_PUBLICATION_ID=your_publication_id_here
```

## Testing

You can test the function locally:

```bash
supabase functions serve sync-beehiiv --env-file ./supabase/.env.local
```

Then send a test request:

```bash
curl -X POST http://localhost:54321/functions/v1/sync-beehiiv \
  -H "Content-Type: application/json" \
  -d '{"type": "INSERT", "table": "profiles", "record": {"email": "test@example.com", "id": "test-123"}}'
```

## Beehiiv API Reference

- [Beehiiv API Docs](https://developers.beehiiv.com/)
- [Create Subscription Endpoint](https://developers.beehiiv.com/api-reference/subscriptions/create)

## Features

- Automatically reactivates previously unsubscribed users
- Sends welcome email to new subscribers
- Tracks UTM parameters for analytics
- Handles duplicate subscribers gracefully (won't error if already subscribed)
- Passes username as a custom field (if available)
