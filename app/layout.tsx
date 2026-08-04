import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layout/AppLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#0A0A0A]">
      <body className="text-white min-h-screen">
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
