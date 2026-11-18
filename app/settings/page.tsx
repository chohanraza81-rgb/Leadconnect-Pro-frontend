"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Save,
  CheckCircle2,
  Loader2,
  Globe,
  Bot,
  Wrench,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useApiFetch } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://leadconnect-pro-backend-production-4f7711e5.up.railway.app/api";

const STORAGE_KEY = "lc_admin_password";

export default function SettingsPage() {
  const apiFetch = useApiFetch();

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState("");

  const [serpApiKey, setSerpApiKey] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [scraperApiKey, setScraperApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // On mount: check if admin password already stored in this session
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPassword(stored);
      verifyAndLoad(stored);
    } else {
      setChecking(false);
    }
  }, []);

  const verifyAndLoad = async (pwd: string) => {
    setChecking(true);
    setAuthError("");
    try {
      const res = await apiFetch("/settings", {
        headers: { "X-Admin-Password": pwd },
      });

      if (res.status === 403) {
        sessionStorage.removeItem(STORAGE_KEY);
        setAuthenticated(false);
        setAuthError("Invalid password. Please try again.");
        setChecking(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to load");

      const data = await res.json();
      setSerpApiKey(data.serpApiKey || "");
      setGroqApiKey(data.groqApiKey || "");
      setScraperApiKey(data.scraperApiKey || "");
      sessionStorage.setItem(STORAGE_KEY, pwd);
      setAuthenticated(true);
    } catch {
      setAuthError("Could not connect. Please try again.");
      setAuthenticated(false);
    }
    setChecking(false);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setAuthError("Password required");
      return;
    }
    verifyAndLoad(password);
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await apiFetch("/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": password,
        },
        body: JSON.stringify({ serpApiKey, groqApiKey, scraperApiKey }),
      });

      if (res.status === 403) {
        toast.error("Session expired. Please re-enter admin password.");
        lockOut();
        return;
      }
      if (!res.ok) throw new Error("Save failed");

      setSaved(true);
      toast.success("Settings saved successfully");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  const lockOut = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthenticated(false);
    setPassword("");
    setSerpApiKey("");
    setGroqApiKey("");
    setScraperApiKey("");
    setAuthError("");
  };

  /* ─────────── LOADING STATE ─────────── */
  if (checking) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  /* ─────────── LOCK SCREEN ─────────── */
  if (!authenticated) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto mt-16"
        >
          <div className="rounded-2xl bg-card border border-border p-8 shadow-lg text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50">
              <Lock className="h-8 w-8 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
              <p className="text-sm text-muted-foreground mt-1">
                This page is restricted. Enter the admin password to continue.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-3 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Admin Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError("");
                  }}
                  placeholder="Enter admin password"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-red-600 font-medium">{authError}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Unlock Settings
              </Button>
            </form>

            <p className="text-xs text-muted-foreground">
              Only the site owner can access this page.
            </p>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  /* ─────────── SETTINGS FORM ─────────── */
  const fields = [
    {
      label: "SerpAPI Key",
      value: serpApiKey,
      setter: setSerpApiKey,
      placeholder: "Get from serpapi.com/dashboard",
      icon: Globe,
      hint: "Used by Lead Finder for business search",
    },
    {
      label: "Groq API Key",
      value: groqApiKey,
      setter: setGroqApiKey,
      placeholder: "gsk_... from console.groq.com",
      icon: Bot,
      hint: "Used for AI-powered lead enrichment",
    },
    {
      label: "ScraperAPI Key",
      value: scraperApiKey,
      setter: setScraperApiKey,
      placeholder: "From scraperapi.com/dashboard",
      icon: Wrench,
      hint: "Used for scraping contact details",
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Admin Access
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              API keys are stored securely in MongoDB. They override .env defaults.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={lockOut}
            className="gap-1.5"
          >
            <Lock className="h-3.5 w-3.5" /> Lock
          </Button>
        </div>

        {/* API Keys Form */}
        <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 space-y-6 shadow-sm">
          {fields.map((field) => (
            <div key={field.label} className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-950/50">
                  <field.icon className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                {field.label}
              </label>
              <Input
                type="password"
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.placeholder}
              />
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            </div>
          ))}

          <div className="pt-2 border-t border-border">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 gap-2 text-base shadow-md"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl bg-muted/50 border border-border p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Security note:</span>{" "}
            Your admin password is kept in browser session storage only — it clears
            when you close the tab or click <span className="font-medium">Lock</span>.
            API keys are stored server-side in MongoDB.
          </p>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
