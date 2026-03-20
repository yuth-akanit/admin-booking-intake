/**
 * 1. AdminBookingDraft: Captured directly from form inputs (mostly strings for UI ease)
 */
export type AdminBookingDraft = {
  customer_id: string;
  customer_name: string;
  phone: string;
  address_full: string;
  oa_channel: string;
  job_number: string;
  slot_date: string;
  slot_time: string;
  area: string;
  area_key: string;
  job_type: string;
  machine_count: string;
  created_by_line_id: string;
  idempotency_key: string;
};

/**
 * 2. BookingCreatePayload: Strictly formatted for the internal API and public.bookings
 * Preserves nullable fields as per the locked contract.
 */
export interface BookingCreatePayload {
  job_number?: string;
  customer_id?: string;
  oa_channel: string;
  status: 'confirmed';
  slot_date: string;
  slot_time: string;
  area: string;
  area_key: string;
  created_by_line_id: string | null;
  idempotency_key: string;
  customer_name: string | null;
  phone: string | null;
  address_full: string | null;
  job_type: string | null;
  machine_count: number | null;
}

/** 3. Submission Result States */
export type SubmissionStatus = 'success' | 'validation_error' | 'unknown_commit_state' | 'idle' | 'loading';

export interface SubmissionResponse {
  status: SubmissionStatus;
  job_number?: string;
  message?: string;
  errors?: Record<string, unknown>;
}
