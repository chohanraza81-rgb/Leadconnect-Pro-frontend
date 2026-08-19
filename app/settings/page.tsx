"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Save, CheckCircle2, Loader2, Key, Mail, Globe, Bot, Send, Wrench } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
  const [gmail, setGmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [serpApiKey, setSerpApiKey] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [brevoApiKey, setBrevoApiKey] = useState("");
  const [scraperApiKey, setScraperApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setGmail(data.gmail || "");
          setAppPassword(data.appPassword || "");
          setSerpApiKey(data.serpApiKey || "");
          setGroqApiKey(data.groqApiKey || "");
          setBrevoApiKey(data.brevoApiKey || "");
          setScraperApiKey(data.scraperApiKey || "");
        }
      })
      .catch(() => {});
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`${API}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gmail,
          appPassword,
          serpApiKey,
          groqApiKey,
          brevoApiKey,
          scraperApiKey,
        }),
      });
      setSaved(true);
      toast({ title: "✅ Settings saved successfully!" });
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast({ title: "❌ Failed to save settings", variant: "destructive" });
    }
    setSaving(false);
  };

  const fields = [
    {
      label: "Your Gmail",
      value: gmail,
      setter: setGmail,
      placeholder: "youremail@gmail.com",
      icon: Mail,
      type: "email",
    },
    {
      label: "Gmail App Password",
      value: appPassword,
      setter: setAppPassword,
      placeholder: "16-character app password",
      icon: Key,
      type: "password",
    },
    {
      label: "SerpApi Key",
      value: serpApiKey,
      setter: setSerpApiKey,
      placeholder: "SerpApi key from serpapi.com",
      icon: Globe,
      type: "password",
    },
    {
      label: "Groq API Key",
      value: groqApiKey,
      setter: setGroqApiKey,
      placeholder: "gsk_... from console.groq.com",
      icon: Bot,
      type: "password",
    },
    {
      label: "Brevo API Key",
      value: brevoApiKey,
      setter: setBrevoApiKey,
      placeholder: "xkeysib-... from brevo.com",
      icon: Send,
      type: "password",
    },
    {
      label: "Scraper API Key",
      value: scraperApiKey,
      setter: setScraperApiKey,
      placeholder: "scraperapi key from scraperapi.com",
      icon: Wrench,
      type: "password",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-8"
    >
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
        ⚙️ Settings
      </h1>
      <p className="text-sm text-gray-400 -mt-4">
        Your API keys are stored securely in MongoDB. They override the .env values.
      </p>

      <div className="glass-card p-8 space-y-6">
        {fields.map(field => (
          <div key={field.label} className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <field.icon className="h-4 w-4" />
              {field.label}
            </label>
            <Input
              type={field.type}
              value={field.value}
              onChange={e => field.setter(e.target.value)}
              placeholder={field.placeholder}
              className="bg-white/5 border-white/10 focus-visible:ring-[#6366F1]"
            />
          </div>
        ))}

        <Button
          onClick={saveSettings}
          disabled={saving}
          className="w-full bg-[#6366F1] hover:bg-[#4f46e5] h-12 gap-2 text-base"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save All Settings"}
        </Button>
      </div>
    </motion.div>
  );
}
