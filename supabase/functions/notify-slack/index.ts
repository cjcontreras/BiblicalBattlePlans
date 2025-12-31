// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL')

serve(async (req) => {
  try {
    // Validate webhook URL is configured
    if (!SLACK_WEBHOOK_URL) {
      console.error('SLACK_WEBHOOK_URL is not configured')
      return new Response(
        JSON.stringify({ error: 'Slack webhook URL not configured' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse the request body
    const body = await req.json()
    const { record, type, table, old_record } = body
    
    // Validate required fields
    if (!record || !record.email) {
      console.error('Invalid request body:', body)
      return new Response(
        JSON.stringify({ error: 'Invalid request: missing record or email' }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    // Construct the message payload for Slack
    const message = {
      text: `🚀 New User Signed Up!`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*New User:* ${record.email}\n*User ID:* ${record.id}\n*Created:* ${new Date(record.created_at || Date.now()).toLocaleString()}`
          }
        }
      ]
    }

    // Send the request to Slack
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    // Check if Slack request was successful
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Slack webhook failed:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send Slack notification',
          status: response.status,
          details: errorText
        }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Successfully notified Slack for user:', record.email)
    return new Response(
      JSON.stringify({ success: true, user: record.email }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in notify-slack function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        stack: error.stack
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})