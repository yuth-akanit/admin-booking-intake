'use client';

import React from 'react';
import { useIntakeStore } from '../../store/intake-store';
import { AREA_LABELS } from '../../constants/areas';
import { ThaiAddressInput } from './ThaiAddressInput';

/**
 * Main form for entering booking data from admin input.
 */
export const BookingForm: React.FC = () => {
  const { draft, updateDraft, syncAreaKey, syncPhone } = useIntakeStore();

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateDraft({ area: e.target.value });
    syncAreaKey(); // Trigger mapping immediately
  };

  const handlePhoneBlur = () => {
    syncPhone(); // Clean phone format on exit
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Info */}
        <div className="space-y-5 bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
          <h3 className="text-lg font-bold text-blue-900 border-b-2 border-blue-100 pb-2 flex items-center gap-2">
            👤 ข้อมูลลูกค้า <span className="text-sm font-normal text-blue-600/70">(Customer Details)</span>
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-400">รหัสลูกค้า (ระบบสร้างให้อัตโนมัติ)</label>
            <input 
              type="text" 
              value={draft.customer_id}
              readOnly
              className="mt-1 block w-full rounded-xl border border-gray-200 p-3 bg-blue-50/50 text-blue-400 font-mono text-xs cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">ชื่อลูกค้า (Name)</label>
            <input 
              type="text" 
              value={draft.customer_name}
              onChange={(e) => updateDraft({ customer_name: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
              placeholder="กรอกชื่อลูกค้า..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium">เบอร์โทรศัพท์ (Phone)</label>
            <input 
              type="text" 
              value={draft.phone}
              onChange={(e) => updateDraft({ phone: e.target.value })}
              onBlur={handlePhoneBlur}
              className="mt-1 block w-full rounded-xl border border-gray-200 p-3 text-blue-700 font-mono text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
              placeholder="093-xxx-xxxx"
            />
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-5 bg-purple-50/30 p-6 rounded-2xl border border-purple-100/50">
          <h3 className="text-lg font-bold text-purple-900 border-b-2 border-purple-100 pb-2 flex items-center gap-2">
            📅 ข้อมูลการจอง <span className="text-sm font-normal text-purple-600/70">(Booking Details)</span>
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-400">หมายเลขงาน (Job Number)</label>
            <input 
              type="text" 
              value={draft.job_number}
              readOnly
              className="mt-1 block w-full rounded-xl border border-purple-200 p-3 bg-purple-50/50 text-purple-700 font-mono text-lg font-bold shadow-inner cursor-not-allowed"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium">วันที่นัดหมาย (Date)</label>
                <input 
                  type="date" 
                  value={draft.slot_date}
                  onChange={(e) => updateDraft({ slot_date: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-white"
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700">เวลานัดหมาย (Time)</label>
                <input 
                  type="time" 
                  step="1"
                  value={draft.slot_time}
                  onChange={(e) => updateDraft({ slot_time: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-white"
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium">พื้นที่ให้บริการ (Area)</label>
            <select 
              value={draft.area}
              onChange={handleAreaChange}
              className="mt-1 block w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-white"
            >
              <option value="">เลือกพื้นที่...</option>
              {AREA_LABELS.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
            <p className="text-xs text-purple-400 mt-2 font-mono bg-purple-100/50 inline-block px-2 py-1 rounded-md">Key: {draft.area_key || '...'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 bg-orange-50/30 p-6 rounded-2xl border border-orange-100/50">
        <h3 className="text-lg font-bold text-orange-900 border-b-2 border-orange-100 pb-2 flex items-center gap-2">
          📍 สถานที่และรายละเอียดงาน <span className="text-sm font-normal text-orange-600/70">(Location & Job Info)</span>
        </h3>
        <ThaiAddressInput 
          value={draft.address_full}
          onChange={(val) => updateDraft({ address_full: val })}
        />
        <div className="flex gap-4">
           <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700">ประเภทงาน (Job Type)</label>
              <select 
                 value={draft.job_type}
                 onChange={(e) => updateDraft({ job_type: e.target.value })}
                 className="mt-1 block w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white"
              >
                 <option value="cleaning">ล้างแอร์ (Cleaning)</option>
                 <option value="repair">ซ่อมแอร์ (Repair)</option>
                 <option value="installation">ติดตั้งแอร์ (Installation)</option>
                 <option value="refrigerant">เติมน้ำยาแอร์ (Refrigerant)</option>
                 <option value="preventive_maintenance">บำรุงรักษา (PM)</option>
                 <option value="factory_cleaning">ล้างแอร์โรงงาน (Factory)</option>
                 <option value="cold_room">ห้องเย็น (Cold Room)</option>
              </select>
           </div>
            <div className="w-32">
              <label className="block text-sm font-bold text-gray-700">จำนวนเครื่อง</label>
              <input 
                type="number" 
                value={draft.machine_count}
                onChange={(e) => updateDraft({ machine_count: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white"
                placeholder="1"
              />
           </div>
        </div>
      </div>
    </div>
  );
};
