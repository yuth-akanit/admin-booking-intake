"use client";

import React, { useState, useEffect } from 'react';
import { ThailandAddressTypeahead, ThailandAddressValue } from 'react-thailand-address-typeahead';

// We need to inject styles for the dropdown manually since the lib might use standard elements
// but we want tailwind styling

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export const ThaiAddressInput: React.FC<Props> = ({ value, onChange }) => {
  const [addressDetail, setAddressDetail] = useState('');
  const [thaiValue, setThaiValue] = useState(ThailandAddressValue.empty());
  
  // Ref to track the last value handled to prevent loops
  const lastValueHandled = React.useRef(value);

  useEffect(() => {
    // Only proceed if value actually changed from what we last handled
    if (value === lastValueHandled.current) return;
    lastValueHandled.current = value;

    if (!value) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setAddressDetail('');
      setThaiValue(ThailandAddressValue.empty());
    } else if (!addressDetail && thaiValue.subdistrict === '') {
      setAddressDetail(value);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [value, addressDetail, thaiValue.subdistrict]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // When anything changes, update the parent value
  // We debounce or just update directly
  useEffect(() => {
    if (!addressDetail && thaiValue.subdistrict === '') return;
    
    // Combine detail + auto complete parts
    const parts = [addressDetail.trim()];
    
    if (thaiValue.subdistrict) parts.push(`ต.${thaiValue.subdistrict}`);
    if (thaiValue.district) parts.push(`อ.${thaiValue.district}`);
    if (thaiValue.province) parts.push(`จ.${thaiValue.province}`);
    if (thaiValue.postalCode) parts.push(`${thaiValue.postalCode}`);
    
    const combined = parts.filter(Boolean).join(' ');
    
    // Quick equality check to prevent loops
    if (combined !== value && combined.trim().length > 0) {
      onChange(combined);
    }
  }, [addressDetail, thaiValue, value, onChange]);

  return (
    <div className="space-y-4">
      <div>
         <label className="block text-sm font-bold text-gray-700">รายละเอียดที่อยู่ (บ้านเลขที่, หมู่, ซอย, ถนน)</label>
         <textarea 
            className="mt-1 block w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-white"
            rows={2}
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            placeholder="เช่น 92/65 ซอย 38..."
         />
      </div>

      <div className="relative z-10 p-4 bg-orange-50 border border-orange-200/50 rounded-xl shadow-inner">
        <p className="text-xs font-semibold mb-2 text-slate-500">ระบบค้นหาที่อยู่อัตโนมัติ (พิมพ์แค่ส่วนใดส่วนหนึ่ง แล้วเลือกจากเมนู)</p>
        
        {!isClient ? (
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wider">
            Sourcing Address Components...
          </div>
        ) : (
          <ThailandAddressTypeahead
            value={thaiValue}
            onValueChange={(val) => setThaiValue(val)}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-orange-900 mb-1">ตำบล / แขวง</label>
                <ThailandAddressTypeahead.SubdistrictInput 
                  className="w-full rounded-lg border border-orange-200 bg-white p-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none" 
                  placeholder="ตำบล..." 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-orange-900 mb-1">อำเภอ / เขต</label>
                <ThailandAddressTypeahead.DistrictInput 
                  className="w-full rounded-lg border border-orange-200 bg-white p-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none" 
                  placeholder="อำเภอ..." 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-orange-900 mb-1">จังหวัด</label>
                <ThailandAddressTypeahead.ProvinceInput 
                  className="w-full rounded-lg border border-orange-200 bg-white p-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none" 
                  placeholder="จังหวัด..." 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-orange-900 mb-1">รหัสไปรษณีย์</label>
                <ThailandAddressTypeahead.PostalCodeInput 
                  className="w-full rounded-lg border border-orange-200 bg-white p-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none" 
                  placeholder="รหัสไปรษณีย์..." 
                />
              </div>
            </div>
            
            <div className="absolute w-full mt-1 shadow-lg border rounded-md bg-white max-h-48 overflow-y-auto">
               <ThailandAddressTypeahead.Suggestion 
                 containerProps={{ className: "w-full" }}
                 optionItemProps={{ className: "p-2 hover:bg-blue-50 cursor-pointer text-sm border-b" }}
               />
            </div>
          </ThailandAddressTypeahead>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700">ที่อยู่เต็มที่จะบันทึก (Full Address)</label>
        <textarea 
          className="mt-1 block w-full rounded-xl border border-gray-200 p-3 bg-gray-50 text-gray-600 text-sm"
          rows={2}
          value={value}
          onChange={(e) => {
             // allow manual override in case auto complete failed
             onChange(e.target.value);
             // if user manually clears it all
             if (!e.target.value) {
                setAddressDetail('');
                setThaiValue(ThailandAddressValue.empty());
             }
          }}
        />
      </div>
    </div>
  );
};
