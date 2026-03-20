'use client';

import React, { useState, useRef } from 'react';
import { useIntakeStore } from '../../store/intake-store';
import { normalizePhone } from '../../lib/normalization';

/**
 * Raw text paste area for extracting booking fields.
 * Handles Thai-language chat text common in admin workflows.
 * And uses AI Vision API to extract data from uploaded chat screenshots.
 */
export const PasteExtractor: React.FC = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateDraft, syncAreaKey } = useIntakeStore();

  const handleExtract = () => {
    const updates: Record<string, string> = {};

    // ── Job Number ──
    const jobNumberMatch = text.match(/PA-\d{4}-\d{2}-\d{5}/);
    if (jobNumberMatch) updates.job_number = jobNumberMatch[0];

    // ── Phone (handles dashes, spaces, +66 prefix) ──
    const phoneMatch = text.match(/(?:\+66|0)[\d\s-]{8,13}/);
    if (phoneMatch) {
      const raw = phoneMatch[0].replace(/[\s-]/g, '');
      updates.phone = normalizePhone(raw);
    }

    // ── UUID ──
    const uuidMatch = text.match(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    );
    if (uuidMatch) updates.customer_id = uuidMatch[0];

    // ── Machines count: "ล้าง2", "ล้าง 3 เครื่อง", "3台" ──
    const machinesMatch = text.match(/ล้าง\s*(\d+)/);
    if (machinesMatch) {
      updates.machine_count = machinesMatch[1];
      updates.job_type = 'cleaning';
    }
    // Also check for "ซ่อม" (repair)
    const repairMatch = text.match(/ซ่อม\s*(\d*)/);
    if (repairMatch) {
      updates.job_type = 'repair';
      if (repairMatch[1]) updates.machine_count = repairMatch[1];
    }

    // ── Address: first line that looks like a Thai address ──
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      // Address heuristics: contains /, ซอย, หมู่, ถนน, ตำบล, อำเภอ, etc.
      if (/[\d/]+.*(?:ซอย|ซ\.|หมู่|ม\.|ถนน|ถ\.|ตำบล|อำเภอ|แขวง|เขต|จังหวัด|แพลน|บางปลา|วิลล์|คอนโด|หมู่บ้าน)/i.test(line)) {
        updates.address_full = line;
        break;
      }
    }

    // ── Line-based key:value detection ──
    for (const line of lines) {
      if (/^(ชื่อ|Name)\s*[:：]/i.test(line)) {
        updates.customer_name = line.split(/[:：]/)[1].trim();
      }
      if (/^(ที่อยู่|Address)\s*[:：]/i.test(line)) {
        updates.address_full = line.split(/[:：]/).slice(1).join(':').trim();
      }
      if (/^(พื้นที่|Area)\s*[:：]/i.test(line)) {
        updates.area = line.split(/[:：]/)[1].trim();
      }
    }

    updateDraft(updates);
    syncAreaKey();

    // Show what was found
    const keys = Object.keys(updates);
    if (keys.length > 0) {
      alert(`ดึงข้อมูลสำเร็จ ${keys.length} ฟิลด์: ${keys.join(', ')}`);
    } else {
      alert('ไม่พบข้อมูลที่ดึงได้จากข้อความที่วาง (กรอกเองได้เลยครับ)');
    }
    setText('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      
      // Convert to Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });
      reader.readAsDataURL(file);
      const base64Image = await base64Promise;

      // Send to our API
      const res = await fetch('/api/extract/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      if (!res.ok) {
        throw new Error('Failed to extract data from image');
      }

      const aiData = await res.json();
      
      // Extract fields
      const updates: Record<string, string> = {};
      if (aiData.job_number) updates.job_number = aiData.job_number;
      if (aiData.customer_name) updates.customer_name = aiData.customer_name;
      if (aiData.phone) updates.phone = normalizePhone(aiData.phone);
      if (aiData.address_full) updates.address_full = aiData.address_full;
      if (aiData.area) updates.area = aiData.area;
      if (aiData.machine_count) updates.machine_count = String(aiData.machine_count);
      if (aiData.job_type) updates.job_type = aiData.job_type;
      
      updateDraft(updates);
      syncAreaKey();

      const keys = Object.keys(updates);
      if (keys.length > 0) {
        alert(`AI วิเคราะห์รูปสำเร็จ! ดึงมาได้ ${keys.length} ฟิลด์: ${keys.join(', ')}`);
      } else {
        alert('AI ไม่พบข้อมูลในรูปภาพครับ');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-pink-50 p-6 rounded-2xl border-2 border-dashed border-indigo-200 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
      <div className="absolute -bottom-4 left-10 w-24 h-24 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
      
      <div className="flex justify-between items-center mb-3 relative z-10">
        <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
          ⚡ วางข้อความ / อัปรูปสลิป
        </h4>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition-colors font-medium flex items-center gap-1 disabled:opacity-50"
        >
          {isProcessing ? '⏳ กำลังวิเคราะห์ AI...' : '📷 อัปโหลดรูปแชท'}
        </button>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          className="hidden" 
        />
      </div>

      <textarea 
        placeholder="วางข้อความแชทลูกค้า รูป หรือสรุปงานที่นี่..."
        className="w-full h-28 p-4 text-sm rounded-xl border border-indigo-100 bg-white/80 backdrop-blur-sm font-mono focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none relative z-10 shadow-inner text-gray-700"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isProcessing}
      />
      
      <button 
        onClick={handleExtract}
        disabled={!text || isProcessing}
        className="mt-3 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all relative z-10"
      >
        แยกข้อมูลจากข้อความ
      </button>
    </div>
  );
};
