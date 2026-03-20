import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Booking Intake",
  description: "Internal adapter for HVAC operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
