import { z } from "zod";

/**
 * Zod validation schema for high-level Create Payload.
 * customer_id and job_number are optional because the server
 * will resolve/generate them (customer lookup + next_job_number RPC).
 */
export const BookingCreateSchema = z.object({
  job_number: z.string().optional(), // Server generates via next_job_number() RPC
  customer_id: z.string().optional(), // Server resolves via phone lookup
  oa_channel: z.string().min(1, "OA Channel is required"),
  status: z.literal("confirmed"),
  slot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  slot_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format"),
  area: z.string().min(1, "Area is required"),
  area_key: z.string().min(1, "Area Key is required"),
  created_by_line_id: z.string().nullable(),
  idempotency_key: z.string().min(1, "Idempotency key is missing"),
  customer_name: z.string().nullable(),
  phone: z.string().regex(/^\d{9,10}$/, "Phone must be 9-10 digits").nullable(),
  address_full: z.string().nullable(),
  job_type: z.string().nullable(),
  machine_count: z.number().nullable(),
});
