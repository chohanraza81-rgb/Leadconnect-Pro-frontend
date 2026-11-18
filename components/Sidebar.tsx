// components/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Search, MapPin, Zap, Menu, X } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";      // 👈 @clerk/themes → @clerk/ui/themes
import { cn } from "@/lib/utils";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/finder", label: "Lead Finder", icon: Search },
  { href: "/local-insights", label: "Local Insights", icon: MapPin },
];

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Account";

  const displayEmail = user?.primaryEmailAddress?.emailAddress || "";

  return (
    <>
      <Link
        href="/"
        onClick={onLinkClick}
        className="flex items-center gap-2.5 mb-10 px-2 shrink-0"
      >
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-base font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          LeadConnect Pro
        </span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} onClick={onLinkClick}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <link.icon className="h-5 w-5 shrink-0" />
                {link.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 mt-4 border-t border-white/5 space-y-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              theme: dark,                     // 👈 baseTheme → theme
              variables: {
                colorForeground: "#ffffff",
                colorMutedForeground: "#a1a1aa",
                colorBackground: "#18181b",
                colorPrimary: "#4f46e5",
                colorDanger: "#ef4444",
              },
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-indigo-500/30 rounded-full",
                userButtonPopoverCard:
                  "bg-zinc-900 border border-white/10 shadow-xl",
                userButtonPopoverActionButton:
                  "text-zinc-200 hover:text-white hover:bg-white/10",
                userButtonPopoverActionButtonText: "text-zinc-200",
                userButtonPopoverActionButtonIcon: "text-zinc-400",
                userButtonPopoverFooter: "hidden",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            {!isLoaded ? (
              <div className="space-y-1">
                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-2 w-28 bg-white/5 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-white truncate">
                  {displayName}
                </p>
                {displayEmail && (
                  <p className="text-[11px] text-zinc-500 truncate">
                    {displayEmail}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 text-xs text-zinc-500">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          v4.0.1 — All systems live
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-zinc-950 text-white shadow-lg border border-white/10"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-white/5 flex-col p-4 z-50">
        <NavContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-white/5 flex flex-col p-4 z-50"
            >
              <NavContent onLinkClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
