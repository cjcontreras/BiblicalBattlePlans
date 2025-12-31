# Slack Notification Edge Function

This edge function sends a Slack notification when a new user signs up.

## Setup Instructions

### 1. Create a Slack Webhook URL

1. Go to https://api.slack.com/apps
2. Create a new app or select an existing one
3. Navigate to "Incoming Webhooks"
4. Activate Incoming Webhooks
5. Click "Add New Webhook to Workspace"
6. Select the channel where you want notifications
7. Copy the Webhook URL (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX`)

### 2. Configure Environment Variables

#### For Production (Supabase Dashboard):
1. Go to your Supabase project dashboard
2. Navigate to Settings > Edge Functions
3. Add a new secret:
   - Name: `SLACK_WEBHOOK_URL`
   - Value: Your Slack webhook URL

#### For Local Development:
1. Create a `.env` file in the `supabase` directory (if it doesn't exist)
2. Add: `SLACK_WEBHOOK_URL=your_webhook_url_here`
3. Or set it directly in your shell:
   ```bash
   export SLACK_WEBHOOK_URL="your_webhook_url_here"
   ```

### 3. Set Up Database Webhook

#### Option A: Supabase Dashboard (Recommended for Production)
1. Go to Database > Webhooks in your Supabase dashboard
2. Click "Create a new webhook"
3. Configure:
   - **Name**: `notify-slack-on-signup`
   - **Table**: `auth.users`
   - **Events**: Check `INSERT`
   - **Type**: Select "Supabase Edge Function"
   - **Edge Function**: Select `notify-slack`
   - **HTTP Headers**: Add `Content-Type: application/json`
4. Click "Create webhook"

#### Option B: Manual HTTP Webhook
If you prefer to use a standard HTTP webhook:
1. Go to Database > Webhooks
2. Create a new webhook with:
   - **Name**: `notify-slack-on-signup`
   - **Table**: `auth.users`
   - **Events**: Check `INSERT`
   - **Type**: Select "HTTP Request"
   - **Method**: `POST`
   - **URL**: `https://[your-project-ref].supabase.co/functions/v1/notify-slack`
   - **HTTP Headers**: 
     - `Content-Type: application/json`
     - `Authorization: Bearer [your-anon-key]` (if verify_jwt is true)

### 4. Test the Function

#### Test Locally:
```bash
# Start Supabase
supabase start

# In another terminal, test the function
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify-slack' \
  --header 'Content-Type: application/json' \
  --data '{"record":{"id":"test-user-id","email":"test@example.com","created_at":"2024-01-01T00:00:00Z"}}'
```

#### Test in Production:
Sign up a new user through your app and check your Slack channel for the notification.

## Function Behavior

The function:
- Validates that `SLACK_WEBHOOK_URL` is configured
- Parses the incoming webhook payload from Supabase
- Validates that the record contains an email
- Sends a formatted message to Slack with:
  - User email
  - User ID
  - Creation timestamp
- Returns appropriate success/error responses
- Logs all operations for debugging

## Troubleshooting

### Function not being called
- Check that the webhook is enabled in Database > Webhooks
- Verify the webhook is configured for the correct table (`auth.users`)
- Check the webhook logs in the Supabase dashboard

### Slack notifications not appearing
- Verify `SLACK_WEBHOOK_URL` is set correctly
- Test the webhook URL directly with curl
- Check the function logs in Supabase dashboard

### JWT verification errors
- If using HTTP webhooks, ensure `verify_jwt = false` in `config.toml`
- Or include the proper Authorization header with your anon/service key

### View Function Logs
```bash
# Local development
supabase functions serve notify-slack --debug

# Or check logs in Supabase Dashboard > Edge Functions > notify-slack > Logs
```

## Security Notes

- Never commit your `SLACK_WEBHOOK_URL` to version control
- Use environment variables or Supabase secrets
- The function is configured with `verify_jwt = false` to work with database webhooks
- If you need JWT verification, use a service role key in the webhook configuration

