"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Save, CheckCircle2, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
  const [gmail, setGmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [serpApiKey, setSerpApiKey] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setGmail(data.gmail || "");
          setAppPassword(data.appPassword || "");
          setSerpApiKey(data.serpApiKey || "");
          setGroqApiKey(data.groqApiKey || "");
        }
      });
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    await fetch(`${API}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gmail, appPassword, serpApiKey, groqApiKey }),
    });
    setSaving(false);
    setSaved(true);
    toast({ title: "Settings saved successfully" });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-8"
    >
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
        Settings
      </h1>
      <div className="glass-card p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Your Gmail</label>
          <Input
            value={gmail}
            onChange={e => setGmail(e.target.value)}
            className="bg-white/5 border-white/10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Gmail App Password</label>
          <Input
            type="password"
            value={appPassword}
            onChange={e => setAppPassword(e.target.value)}
            className="bg-white/5 border-white/10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-400">SerpApi Key</label>
          <Input
            value={serpApiKey}
            onChange={e => setSerpApiKey(e.target.value)}
            className="bg-white/5 border-white/10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Groq API Key</label>
          <Input
            value={groqApiKey}
            onChange={e => setGroqApiKey(e.target.value)}
            className="bg-white/5 border-white/10"
          />
        </div>
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="w-full bg-[#6366F1] hover:bg-[#4f46e5] h-12 gap-2"
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
    </motion.div>
  );
      }
