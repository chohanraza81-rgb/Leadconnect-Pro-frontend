"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Search, Send, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/finder", label: "Lead Finder", icon: Search },
  { href: "/outreach", label: "Outreach", icon: Send },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black/60 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 z-50">
      <div className="flex items-center gap-2 mb-10">
        <Zap className="h-8 w-8 text-[#6366F1]" />
        <span className="text-xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
          LeadConnect Pro
        </span>
      </div>
      <nav className="flex flex-col gap-2">
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-[#6366F1]/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
              }
