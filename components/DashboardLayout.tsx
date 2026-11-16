// components/DashboardLayout.tsx
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Content shifted right of sidebar on desktop */}
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pt-16 lg:pt-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
