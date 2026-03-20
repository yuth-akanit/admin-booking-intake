'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useIntakeStore } from '../../store/intake-store';
import { BookingForm } from '../../components/intake/BookingForm';
import { PasteExtractor } from '../../components/intake/PasteExtractor';

export default function IntakePage() {
  const router = useRouter();
  const { draft, resetDraft } = useIntakeStore();

  const handlePreview = () => {
    // Validate admin-input fields (customer_id & job_number are auto-generated)
    const missing: string[] = [];
    if (!draft.customer_name) missing.push('ชื่อลูกค้า');
    if (!draft.phone) missing.push('เบอร์โทรศัพท์');
    if (!draft.slot_date) missing.push('วันที่นัดหมาย');
    if (!draft.slot_time) missing.push('เวลานัดหมาย');
    if (!draft.area_key) missing.push('พื้นที่ให้บริการ (Area)');

    if (missing.length > 0) {
       alert(`ระบุข้อมูลไม่ครบ กรุณาเช็คช่อง: ${missing.join(', ')}`);
       return;
    }
    router.push('/preview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10">
      <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">
              ระบบรับงานแอดมิน <span className="text-xl font-normal text-gray-500">(Booking Intake)</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">กรอกข้อมูลลูกค้าและงานแอร์เพื่อส่งเข้าฐานข้อมูลส่วนกลาง</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => router.push('/drafts')}
              className="px-4 py-2 flex-1 md:flex-none border border-blue-200 text-blue-700 rounded-xl text-sm bg-blue-50/50 hover:bg-blue-100 font-bold shadow-sm transition-all"
            >
              ดราฟต์ที่บันทึกไว้
            </button>
            <button 
              onClick={resetDraft}
              className="px-4 py-2 flex-1 md:flex-none border border-red-200 text-red-600 rounded-xl text-sm bg-red-50 hover:bg-red-100 font-bold shadow-sm transition-all"
            >
              ล้างแบบฟอร์ม
            </button>
          </div>
        </header>

        <section className="bg-white shadow-2xl shadow-blue-900/5 rounded-3xl border border-blue-100/50 p-6 md:p-10 space-y-10">
          <PasteExtractor />
          <BookingForm />
          
          <div className="pt-8 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handlePreview}
              className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all"
            >
              ตรวจสอบข้อมูลก่อนส่ง (Proceed to Preview) &rarr;
            </button>
          </div>
        </section>

      <footer className="text-center py-10 opacity-30 text-xs uppercase tracking-widest pointer-events-none">
        Internal Admin System • Locked Architecture Node
      </footer>
    </div>
    </div>
  );
}
