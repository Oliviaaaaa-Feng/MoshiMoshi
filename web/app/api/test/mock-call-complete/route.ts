import { NextRequest, NextResponse } from 'next/server'

// POST /api/test/mock-call-complete
// Test endpoint to simulate ElevenLabs webhook
// Usage: POST with { reservation_id: "xxx", success: true/false }
export async function POST(request: NextRequest) {
  try {
    const { reservation_id, success = true } = await request.json()

    if (!reservation_id) {
      return NextResponse.json(
        { error: 'Missing reservation_id' },
        { status: 400 }
      )
    }

    // Construct mock webhook payload
    const mockWebhook = {
      type: "post_call_transcription",
      conversation_id: `mock_call_${Date.now()}`,
      data: {
        analysis: {
          call_successful: "success",
          data_collection_results: {
            reservation_status: success ? 'confirmed' : 'rejected', 
            alternative_times: success ? "" : "Tomorrow at 6 PM", 
            rejection_reason: success ? "" : "No tables available",
            restaurant_notes: success ? "Outdoor seating." : ""
          }
        },
        conversation_initiation_client_data: {
          dynamic_variables: {
            reservation_id: reservation_id
          }
        }
      }
    }

    // Call the actual webhook endpoint
    const baseUrl = request.nextUrl.origin
    const webhookResponse = await fetch(`${baseUrl}/api/webhook/call-completed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockWebhook)
    })

    if (!webhookResponse.ok) {
        throw new Error(`Webhook endpoint returned ${webhookResponse.status}`)
    }

    const result = await webhookResponse.json()

    return NextResponse.json({
      message: 'Mock webhook sent successfully',
      sent_payload: mockWebhook,
      receiver_response: result
    })

  } catch (error) {
    console.error('Error in mock endpoint:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
