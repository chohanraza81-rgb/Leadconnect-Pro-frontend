"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Send, Phone, Clock, Mail, MessageCircle, Save, Copy, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Sequencer() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [offer, setOffer] = useState("");
  const [sequence, setSequence] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [sendingDay, setSendingDay] = useState<number | null>(null);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/leads`).then(r => r.json()).then(data => {
      setLeads(data);
      setLoadingLeads(false);
    }).catch(() => {
      toast({ title: "Failed to load leads", variant: "destructive" });
      setLoadingLeads(false);
    });
  }, []);

  const selectedLead = leads.find(l => l._id === selectedLeadId);

  const generateSequence = async () => {
    if (!selectedLeadId) { toast({ title: "Select a lead first", variant: "destructive" }); return; }
    if (!offer.trim()) { toast({ title: "Enter your offer", variant: "destructive" }); return; }
    setGenerating(true);
    setSequence([]);
    setActiveCampaignId(null);
    setSaved(false);
    try {
      const res = await fetch(`${API}/outreach/generate-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedLeadId, offer }),
      });
      const data = await res.json();
      if (data.emails && data.emails.length >= 3) {
        setSequence(data.emails);
        toast({ title: "✨ AI sequence generated!" });
      } else if (data.emails && data.emails.length > 0) {
        setSequence(data.emails);
        toast({ title: "Sequence generated (fewer steps)" });
      } else {
        toast({ title: "Failed. Check Groq API key.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error generating sequence", variant: "destructive" });
    }
    setGenerating(false);
  };

  const saveCampaign = async () => {
    if (!campaignName.trim()) { toast({ title: "Enter a campaign name", variant: "destructive" }); return; }
    if (sequence.length === 0) { toast({ title: "Generate a sequence first", variant: "destructive" }); return; }
    try {
      const res = await fetch(`${API}/outreach/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          leads: [selectedLeadId],
          sequence: sequence.map((body, i) => ({
            step: i + 1,
            type: i === 1 ? "whatsapp" : "email",
            subject: `Day ${i + 1} - ${i === 0 ? "Intro" : i === 1 ? "WhatsApp Follow-up" : "Final CTA"}`,
            body,
          })),
        }),
      });
      const camp = await res.json();
      setActiveCampaignId(camp._id);
      setSaved(true);
      toast({ title: "✅ Campaign saved!" });
    } catch {
      toast({ title: "Failed to save campaign", variant: "destructive" });
    }
  };

  const sendDayEmail = async (stepIndex: number) => {
    if (!activeCampaignId) { toast({ title: "Save campaign first!", variant: "destructive" }); return; }
    if (!selectedLead?.email) { toast({ title: "Lead has no email", variant: "destructive" }); return; }
    setSendingDay(stepIndex);
    try {
      const res = await fetch(`${API}/outreach/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: activeCampaignId, stepIndex, toEmail: selectedLead.email }),
      });
      if (res.ok) {
        toast({ title: `📧 Day ${stepIndex + 1} email sent to ${selectedLead.email}!` });
      } else {
        const err = await res.json();
        toast({ title: "Failed to send. Check Gmail settings.", description: err.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error sending email", variant: "destructive" });
    }
    setSendingDay(null);
  };

  const openWhatsApp = async () => {
    if (!activeCampaignId) { toast({ title: "Save campaign first!", variant: "destructive" }); return; }
    if (!selectedLead?.phone) { toast({ title: "Lead has no phone", variant: "destructive" }); return; }
    const msg = encodeURIComponent(sequence[1]?.substring(0, 250) || "Hi, following up!");
    const cleanPhone = selectedLead.phone.replace(/[^0-9+]/g, "");
    // Track click
    try {
      await fetch(`${API}/leads/${selectedLead._id}/whatsapp-click`, { method: "PUT" });
    } catch {}
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
    toast({ title: "💬 WhatsApp opened!" });
  };

  const copyEmailText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "📋 Copied!" });
  };

  const dayIcons = [Mail, MessageCircle, Clock];
  const dayLabels = ["Email Introduction", "WhatsApp Follow-up", "Email Final CTA"];
  const dayColors = ["#6366F1", "#22c55e", "#a855f7"];

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#6366F1]/20 rounded-xl"><Sparkles className="h-6 w-6 text-[#6366F1]" /></div>
        <div>
          <h2 className="text-xl font-semibold">AI Sequencer</h2>
          <p className="text-xs text-gray-400">Generate personalized 3‑step outreach</p>
        </div>
      </div>

      {/* Step 1 */}
      <div className="bg-black/20 rounded-xl p-5 border border-white/5 space-y-4">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6366F1] text-white text-xs">1</span> Select Lead & Offer
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Choose Lead</label>
            {loadingLeads ? <Skeleton className="h-10 w-full bg-white/5" /> : (
              <Select value={selectedLeadId} onValueChange={v => { setSelectedLeadId(v); setSequence([]); setActiveCampaignId(null); setSaved(false); }}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select a lead..." /></SelectTrigger>
                <SelectContent>{leads.map(l => <SelectItem key={l._id} value={l._id}>{l.name} – {l.company}</SelectItem>)}</SelectContent>
              </Select>
            )}
            {selectedLead && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                {selectedLead.email && <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded"><Mail className="h-3 w-3 text-blue-400" /> {selectedLead.email}</span>}
                {selectedLead.phone && <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded"><Phone className="h-3 w-3 text-green-400" /> {selectedLead.phone}</span>}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Your Offer</label>
            <Input placeholder="e.g. Free 30‑min strategy call" value={offer} onChange={e => setOffer(e.target.value)} className="bg-white/5 border-white/10" />
          </div>
        </div>
        <Button onClick={generateSequence} disabled={generating || !selectedLeadId} className="bg-[#6366F1] hover:bg-[#4f46e5] gap-2 w-full md:w-auto">
          {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate 3‑Step Sequence</>}
        </Button>
      </div>

      {/* Step 2 */}
      <AnimatePresence>
        {generating && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full bg-white/5 rounded-xl" />)}</motion.div>}
        {sequence.length > 0 && !generating && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/20 rounded-xl p-5 border border-white/5 space-y-4">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6366F1] text-white text-xs">2</span> Review & Edit Sequence
            </h3>
            <div className="space-y-3">
              {sequence.map((body, i) => {
                const Icon = dayIcons[i];
                const color = dayColors[i];
                return (
                  <div key={i} className="relative group">
                    <div className="absolute -left-1 top-4 bottom-4 w-0.5 rounded" style={{ backgroundColor: color }} />
                    <div className="p-4 bg-black/30 rounded-xl border border-white/5 ml-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color }} />
                          <span className="font-medium text-sm text-white">Day {i + 1}: {dayLabels[i]}</span>
                        </div>
                        <button onClick={() => copyEmailText(body)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"><Copy className="h-3 w-3 text-gray-400" /></button>
                      </div>
                      <Textarea value={body} onChange={e => { const newSeq = [...sequence]; newSeq[i] = e.target.value; setSequence(newSeq); }} rows={4} className="bg-transparent border-white/10 resize-none text-sm" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Input placeholder="Campaign name" value={campaignName} onChange={e => { setCampaignName(e.target.value); setSaved(false); }} className="max-w-xs bg-white/5 border-white/10" />
              <Button onClick={saveCampaign} variant="outline" className={`gap-2 ${saved ? 'border-green-500 text-green-400' : 'border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1]/10'}`}>
                {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save Campaign</>}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3 */}
      <AnimatePresence>
        {activeCampaignId && sequence.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/20 rounded-xl p-5 border border-white/5 space-y-4">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs">3</span> Execute Outreach
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button onClick={() => sendDayEmail(0)} disabled={sendingDay === 0 || !selectedLead?.email} className="bg-[#6366F1] hover:bg-[#4f46e5] h-auto py-4 flex-col gap-2">
                {sendingDay === 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <div className="text-center"><div className="font-semibold text-sm">Day 1</div><div className="text-xs opacity-80">Send Email</div></div>
              </Button>
              <Button onClick={openWhatsApp} disabled={!selectedLead?.phone} className="bg-green-600 hover:bg-green-700 h-auto py-4 flex-col gap-2">
                <Phone className="h-5 w-5" />
                <div className="text-center"><div className="font-semibold text-sm">Day 3</div><div className="text-xs opacity-80">Open WhatsApp</div></div>
              </Button>
              <Button onClick={() => sendDayEmail(2)} disabled={sendingDay === 2 || !selectedLead?.email} className="bg-purple-600 hover:bg-purple-700 h-auto py-4 flex-col gap-2">
                {sendingDay === 2 ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />}
                <div className="text-center"><div className="font-semibold text-sm">Day 7</div><div className="text-xs opacity-80">Send Follow‑up</div></div>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">{selectedLead?.email ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />} Email: {selectedLead?.email || "N/A"}</span>
              <span className="flex items-center gap-1">{selectedLead?.phone ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />} Phone: {selectedLead?.phone || "N/A"}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
