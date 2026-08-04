import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
