import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BookingCreateSchema } from '../../../../lib/validation';
import { BookingCreatePayload } from '../../../../types/booking';

/**
 * SERVER SIDE GATEWAY TO SUPABASE
 * Flow:
 *   1. Validate payload
 *   2. Lookup or create customer by phone
 *   3. Generate sequential job_number via DB RPC
 *   4. Pre-flight idempotency check
 *   5. Insert to public.bookings
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingCreatePayload;

    // 1. STRICT SERVER-SIDE VALIDATION
    const parseResult = BookingCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          status: 'validation_error',
          message: 'Payload did not match expected contract',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 2. INITIALIZE SUPABASE ADMIN
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
    );

    // 3. IDEMPOTENCY PRE-FLIGHT (CHECK BEFORE INSERT)
    const { data: existing, error: existingError } = await supabase
      .from('bookings')
      .select('job_number, idempotency_key')
      .eq('idempotency_key', parseResult.data.idempotency_key)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        {
          status: 'unknown_commit_state',
          message: `Pre-flight check failed: ${existingError.message}`,
        },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          status: 'success',
          message: 'Booking already processed (idempotent)',
          job_number: existing.job_number,
        },
        { status: 200 }
      );
    }

    // 4. LOOKUP OR CREATE CUSTOMER BY PHONE
    const phone = parseResult.data.phone;
    let resolvedCustomerId: string | null = null;

    if (phone) {
      // Strip leading zero for phone_digits lookup (Thai format)
      const phoneDigits = phone.replace(/^0/, '');

      // Try phone_digits first (the canonical field)
      const { data: customerByDigits } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_digits', phoneDigits)
        .maybeSingle();

      if (customerByDigits) {
        resolvedCustomerId = customerByDigits.id;
      } else {
        // Fallback: try phone field with original format
        const { data: customerByPhone } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', phone)
          .maybeSingle();

        if (customerByPhone) {
          resolvedCustomerId = customerByPhone.id;
        }
      }
    }

    // If customer not found, create a new one
    if (!resolvedCustomerId) {
      const newCustomer = {
        phone: phone || null,
        phone_digits: phone ? phone.replace(/^0/, '') : null,
        name: parseResult.data.customer_name || null,
        full_name: parseResult.data.customer_name || null,
        address_text: parseResult.data.address_full || null,
        source: 'walkin', // admin-created
      };

      const { data: created, error: createError } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select('id')
        .single();

      if (createError || !created) {
        console.error('Failed to create customer:', createError);
        return NextResponse.json(
          {
            status: 'unknown_commit_state',
            message: `Failed to create customer: ${createError?.message || 'unknown'}`,
          },
          { status: 500 }
        );
      }

      resolvedCustomerId = created.id;
    }

    // 5. GENERATE JOB NUMBER VIA DB RPC (sequential, atomic)
    const { data: jobNoResult, error: jobNoError } = await supabase
      .rpc('next_job_number');

    if (jobNoError || !jobNoResult) {
      console.error('Failed to generate job number:', jobNoError);
      return NextResponse.json(
        {
          status: 'unknown_commit_state',
          message: `Failed to generate job number: ${jobNoError?.message || 'unknown'}`,
        },
        { status: 500 }
      );
    }

    const serverJobNumber = jobNoResult as string;

    // 6. ATTEMPT INSERT TO public.bookings
    const bookingPayload = {
      ...parseResult.data,
      customer_id: resolvedCustomerId,
      job_number: serverJobNumber,
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingPayload])
      .select('job_number')
      .single();

    if (error) {
      // 2-STEP RECOVERY: Check if conflict is indeed the idempotency key
      const isUniqueViolation = error.code === '23505';

      if (isUniqueViolation) {
        const { data: replayed, error: replayError } = await supabase
          .from('bookings')
          .select('job_number')
          .eq('idempotency_key', parseResult.data.idempotency_key)
          .maybeSingle();

        if (!replayError && replayed) {
          return NextResponse.json(
            {
              status: 'success',
              message: 'Booking successfully recovered (idempotent)',
              job_number: replayed.job_number,
            },
            { status: 200 }
          );
        }
      }

      console.error("Supabase Write Error:", error);
      return NextResponse.json(
        {
          status: 'unknown_commit_state',
          message: error.message,
        },
        { status: 500 }
      );
    }

    // 7. RETURN SUCCESS
    return NextResponse.json(
      {
        status: 'success',
        job_number: data?.job_number ?? serverJobNumber,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("API Route Internal Error:", err);
    return NextResponse.json(
      {
        status: 'unknown_commit_state',
        message: `Internal Server Error: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 }
    );
  }
}
