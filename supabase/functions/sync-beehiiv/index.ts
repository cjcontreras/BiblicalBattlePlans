// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BEEHIIV_API_KEY = Deno.env.get('BEEHIIV_API_KEY')
const BEEHIIV_PUBLICATION_ID = Deno.env.get('BEEHIIV_PUBLICATION_ID')

interface BeehiivSubscriptionRequest {
  email: string
  reactivate_existing?: boolean
  send_welcome_email?: boolean
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  referring_site?: string
  custom_fields?: Array<{ name: string; value: string }>
}

serve(async (req) => {
  try {
    // Validate environment variables
    if (!BEEHIIV_API_KEY) {
      console.error('BEEHIIV_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'Beehiiv API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (!BEEHIIV_PUBLICATION_ID) {
      console.error('BEEHIIV_PUBLICATION_ID is not configured')
      return new Response(
        JSON.stringify({ error: 'Beehiiv publication ID not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse the request body (from Supabase webhook)
    const body = await req.json()
    const { record, type, table } = body

    // Only process INSERT events
    if (type !== 'INSERT') {
      console.log(`Ignoring ${type} event on ${table}`)
      return new Response(
        JSON.stringify({ success: true, message: `Ignoring ${type} event` }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

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

    // Construct the Beehiiv subscription request
    const subscriptionData: BeehiivSubscriptionRequest = {
      email: record.email,
      reactivate_existing: true, // Resubscribe if they were previously unsubscribed
      send_welcome_email: true,
      utm_source: 'biblical_battle_plans',
      utm_medium: 'app_signup',
      utm_campaign: 'user_registration',
      referring_site: 'https://biblicalbattleplans.com',
    }

    // Add username as custom field if available
    if (record.username) {
      subscriptionData.custom_fields = [
        { name: 'username', value: record.username },
      ]
    }

    // Send request to Beehiiv API
    const beehiivUrl = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`

    const response = await fetch(beehiivUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify(subscriptionData),
    })

    const responseData = await response.json()

    // Check if Beehiiv request was successful
    if (!response.ok) {
      console.error('Beehiiv API error:', response.status, responseData)

      // Don't fail on duplicate subscriber (409 Conflict)
      if (response.status === 409) {
        console.log('Subscriber already exists:', record.email)
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Subscriber already exists',
            email: record.email
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({
          error: 'Failed to add subscriber to Beehiiv',
          status: response.status,
          details: responseData,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Successfully added subscriber to Beehiiv:', record.email)
    return new Response(
      JSON.stringify({
        success: true,
        email: record.email,
        beehiiv_id: responseData.data?.id
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in sync-beehiiv function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error',
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
