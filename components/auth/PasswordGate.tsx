"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Zap, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PASSWORD_KEY = "leadconnect_auth";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // Your master password – change this to whatever you want
  const MASTER_PASSWORD = "LeadConnect@2026";

  useEffect(() => {
    // Check if already authenticated in this session
    const stored = sessionStorage.getItem(PASSWORD_KEY);
    if (stored === "true") {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MASTER_PASSWORD) {
      sessionStorage.setItem(PASSWORD_KEY, "true");
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
      // Shake animation trigger
    }
  };

  if (loading) return null;

  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0A0A] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 space-y-6">
            {/* Logo */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-10 w-10 text-[#6366F1]" />
                <span className="text-2xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
                  LeadConnect Pro
                </span>
              </div>
              <p className="text-sm text-gray-400">Enter password to access your tool</p>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  className={`pl-10 pr-12 bg-white/5 border-white/10 text-white h-12 text-lg ${
                    error ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#6366F1]"
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm text-center"
                  >
                    ❌ Incorrect password. Try again.
                  </motion.p>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full bg-[#6366F1] hover:bg-[#4f46e5] h-12 text-base gap-2">
                <Lock className="h-5 w-5" /> Unlock Tool
              </Button>
            </form>

            <p className="text-xs text-gray-600 text-center">
              Protected tool • Single user access only
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Authenticated – show the app
  return <>{children}</>;
            }
