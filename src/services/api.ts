import { BookingCreatePayload, SubmissionResponse } from "../types/booking";

/**
 * Frontend Service: Communicates with internal Next.js API.
 * NO DIRECT SUPABASE CALLS FROM CLIENT.
 */
export async function submitBooking(payload: BookingCreatePayload): Promise<SubmissionResponse> {
  try {
    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: response.status === 400 ? 'validation_error' : 'unknown_commit_state',
        message: errorData.message ?? 'Unknown error',
        errors: errorData.errors,
      };
    }

    return await response.json() as SubmissionResponse;
  } catch (error) {
    console.error("Submission Error", error);
    return {
      status: 'unknown_commit_state',
      message: error instanceof Error ? error.message : "Network failure",
    };
  }
}
