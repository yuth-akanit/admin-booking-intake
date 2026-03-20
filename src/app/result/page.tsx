'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const job = searchParams.get('job');
  const message = searchParams.get('message');

  const isSuccess = status === 'success';

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isSuccess ? 'bg-gradient-to-br from-green-50 via-white to-emerald-50' : 'bg-gradient-to-br from-red-50 via-white to-orange-50'}`}>
      <div className={`max-w-md w-full bg-white rounded-3xl shadow-2xl border ${isSuccess ? 'border-green-100 shadow-green-900/5' : 'border-red-100 shadow-red-900/5'} p-10 text-center space-y-8 animate-in zoom-in-95 duration-500 relative overflow-hidden`}>
        {isSuccess ? (
           <div className="space-y-4">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
             <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-5xl shadow-lg shadow-green-500/30">✓</div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-6">บันทึกงานสำเร็จ!</h1>
             <p className="text-gray-500 font-medium">ข้อมูลถูกซิงก์เข้าระบบหลักเรียบร้อยแล้ว</p>
             <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 shadow-inner mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">เลขที่งาน (Job Number)</p>
                <p className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">{job || 'PA-XXXXX'}</p>
             </div>
           </div>
        ) : (
           <div className="space-y-4">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
             <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto text-5xl shadow-lg shadow-red-500/30">!</div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-6">
               {status === 'validation_error' ? 'ข้อมูลไม่ถูกต้อง' : 'เกิดข้อผิดพลาดในระบบ'}
             </h1>
             <p className="text-red-600 font-bold">{message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'}</p>
             {status === 'unknown_commit_state' && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-2xl border border-yellow-200 text-left text-sm text-yellow-800 space-y-2 mt-4 shadow-sm">
                   <p><strong className="text-yellow-900">🚨 สถานะไม่ชัดเจน (Status Unclear):</strong> การเชื่อมต่อล้มเหลวขณะกำลังบันทึกข้อมูล</p>
                   <p>โปรดอย่าเพิ่งกดส่งซ้ำ! ให้ตรวจสอบ Job Number ในระบบ Dispatch Board เพื่อป้องกันการสร้างงานซ้ำขีด</p>
                </div>
             )}
           </div>
        )}

        <div className="pt-8 border-t border-gray-100 space-y-3 relative z-10">
           <button 
             onClick={() => router.push('/intake')}
             className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all hover:-translate-y-1 ${isSuccess ? 'bg-gradient-to-r from-gray-900 to-black text-white hover:shadow-gray-900/30' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
           >
             สร้างรายการใหม่ (Create Another)
           </button>
           {!isSuccess && (
              <button 
                onClick={() => router.back()}
                className="w-full py-4 rounded-2xl font-bold border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 transition-all"
              >
                ย้อนกลับไปแก้ไขดราฟต์
              </button>
           )}
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ResultContent />
    </React.Suspense>
  );
}
