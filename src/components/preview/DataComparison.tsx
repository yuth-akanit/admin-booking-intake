import React from 'react';
import { AdminBookingDraft, BookingCreatePayload } from '../../types/booking';

interface DataComparisonProps {
  draft: AdminBookingDraft;
  payload: BookingCreatePayload;
}

const ComparisonRow = ({ label, from, to, highlight }: { label: string; from: unknown; to: unknown; highlight?: boolean }) => (
  <div className={`grid grid-cols-3 p-3 text-sm border-b ${highlight ? 'bg-blue-50' : 'bg-white'}`}>
    <span className="font-bold text-gray-500 uppercase">{label}</span>
    <span className="text-gray-400 italic truncate" title={String(from)}>{String(from) || '(empty)'}</span>
    <span className={`font-mono font-bold ${highlight ? 'text-blue-600' : 'text-gray-900'} truncate`} title={String(to)}>
      {String(to) || '(null)'}
    </span>
  </div>
);

/**
 * Visual verification of the data normalization.
 * Highlights transformations (e.g., Thai Area -> spk_key).
 */
export const DataComparison: React.FC<DataComparisonProps> = ({ draft, payload }) => {
  return (
    <div className="rounded-xl border shadow-sm overflow-hidden bg-gray-50 mt-6">
      <div className="bg-gray-800 text-white p-3 flex text-xs font-bold uppercase tracking-widest text-center">
        <span className="w-1/3 text-left">ข้อมูล (Field)</span>
        <span className="w-1/3 text-left">ต้นฉบับ (Draft)</span>
        <span className="w-1/3 text-left">เข้าระบบ (Normalized System)</span>
      </div>
      <div className="flex flex-col">
        <ComparisonRow label="Job Number" from={draft.job_number} to={payload.job_number} />
        <ComparisonRow label="Phone" from={draft.phone} to={payload.phone} highlight />
        <ComparisonRow label="Area Key" from={draft.area} to={payload.area_key} highlight />
        <ComparisonRow label="Machines" from={draft.machine_count} to={payload.machine_count} highlight />
        <ComparisonRow label="Customer ID" from={draft.customer_id} to={payload.customer_id} />
        <ComparisonRow label="Job Type" from={draft.job_type} to={payload.job_type} />
        <ComparisonRow label="Slot" from={`${draft.slot_date} ${draft.slot_time}`} to={`${payload.slot_date} ${payload.slot_time}`} />
        <ComparisonRow label="Idempotency" from={draft.idempotency_key} to={payload.idempotency_key} />
      </div>
    </div>
  );
};
