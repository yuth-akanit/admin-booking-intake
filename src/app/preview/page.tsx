'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const PreviewPageContent = dynamic(() => import('../../components/preview/PreviewPageContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

export default function Page() {
  return <PreviewPageContent />;
}
