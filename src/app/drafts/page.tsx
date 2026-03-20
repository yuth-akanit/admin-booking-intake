'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useIntakeStore } from '../../store/intake-store';

export default function DraftsPage() {
  const router = useRouter();
  const { draft } = useIntakeStore();

  return (
    <div className="max-w-xl mx-auto p-10 space-y-10">
      <header className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 border rounded-full hover:bg-gray-100">&larr;</button>
        <h1 className="text-3xl font-black">Local Drafts</h1>
      </header>

      <section className="space-y-4">
        {draft.job_number ? (
           <div className="bg-white border-2 border-blue-500 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-3 py-1 uppercase rounded-bl-xl">In Progress</div>
              <p className="text-xs font-bold text-gray-400 mb-1">Last Edited</p>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{draft.job_number || 'Unnamed Draft'}</h3>
              
              <div className="flex gap-2">
                <button 
                   onClick={() => router.push('/intake')}
                   className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  Continue Editing
                </button>
              </div>
           </div>
        ) : (
           <div className="p-20 border-4 border-dashed rounded-3xl text-center text-gray-300">
             <p className="font-bold">No active drafts found in browser storage.</p>
           </div>
        )}
      </section>

      <div className="bg-gray-100 p-6 rounded-2xl text-xs text-gray-500 italic">
        Drafts are stored locally in your browser's LocalStorage. They are not shared across devices.
      </div>
    </div>
  );
}
