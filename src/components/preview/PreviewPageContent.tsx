'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIntakeStore } from '../../store/intake-store';
import { DataComparison } from '../../components/preview/DataComparison';
import { BookingCreatePayload } from '../../types/booking';
import { submitBooking } from '../../services/api';

export default function PreviewPage() {
  const router = useRouter();
  const { draft, resetDraft } = useIntakeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TRANSFORMATION: AdminBookingDraft -> BookingCreatePayload
  // customer_id and job_number are passed through but the server
  // will override them (customer lookup + next_job_number RPC).
  const payload: BookingCreatePayload = {
    job_number: draft.job_number || undefined,
    customer_id: draft.customer_id || undefined,
    oa_channel: draft.oa_channel,
    status: 'confirmed',
    slot_date: draft.slot_date,
    slot_time: draft.slot_time,
    area: draft.area,
    area_key: draft.area_key,
    idempotency_key: draft.idempotency_key,
    created_by_line_id: draft.created_by_line_id || null,
    customer_name: draft.customer_name || null,
    phone: draft.phone || null,
    address_full: draft.address_full || null,
    job_type: draft.job_type || null,
    machine_count: draft.machine_count ? parseInt(draft.machine_count, 10) : null,
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const result = await submitBooking(payload);
    
    if (result.status === 'success') {
       // Only reset on success to avoid data loss on validation errors
       resetDraft();
       router.push(`/result?status=success&job=${result.job_number}`);
    } else {
       const params = new URLSearchParams({
          status: result.status,
          message: result.message || 'Error occurred',
          errors: JSON.stringify(result.errors || {})
       });
       router.push(`/result?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10">
      <div className="max-w-3xl mx-auto p-6 space-y-10 animate-in slide-in-from-bottom-5 duration-500">
        <header className="space-y-2 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">
            ตัวอย่างก่อนบันทึกงาน <span className="text-2xl font-normal text-gray-500">(Preview)</span>
          </h1>
          <p className="text-gray-500 font-medium">กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนส่งเข้าระบบจัดการกลาง</p>
        </header>

        <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl shadow-blue-900/5 p-6 md:p-10 relative overflow-hidden">
          {isSubmitting && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-blue-600">
               <div className="animate-spin rounded-full h-14 w-14 border-4 border-current border-t-transparent mb-4 shadow-lg"></div>
               <p className="font-extrabold text-lg animate-pulse tracking-wide">กำลังบันทึกและซิงก์ข้อมูลเข้าระบบ...</p>
             </div>
          )}
          
          <DataComparison draft={draft} payload={payload} />
          
          <div className="mt-10 flex flex-col-reverse md:flex-row gap-4">
             <button 
               onClick={() => router.back()}
               className="px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold bg-white hover:bg-gray-50 hover:border-gray-300 flex-1 transition-all"
               disabled={isSubmitting}
             >
               &larr; กลับไปแก้ไขดราฟต์
             </button>
             <button 
               onClick={handleConfirm}
               className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 flex-1 disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
               disabled={isSubmitting}
             >
               ยืนยันและส่งเข้าระบบ (Final Submit)
             </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 p-5 rounded-2xl shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
           <p className="text-sm text-yellow-800 font-medium leading-relaxed pl-2">
             <strong className="text-yellow-900">🚨 คำเตือน:</strong> การกดยืนยันจะบันทึกข้อมูลและส่งไปยังระบบของทีมช่างทันที 
             (ระบบยังไม่มีการระบุตัวช่างให้ในขั้นตอนนี้ หากต้องการระบุช่างต้องทำผ่าน Dispatch Board)
           </p>
        </div>
      </div>
    </div>
  );
}
