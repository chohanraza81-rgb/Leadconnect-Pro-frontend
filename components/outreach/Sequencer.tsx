"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Send, Phone, Clock } from "lucide-react";
import { motion } from "framer-motion";

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
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API}/leads`).then(r => r.json()).then(setLeads);
  }, []);

  const generateSequence = async () => {
    if (!selectedLeadId) return;
    setGenerating(true);
    const res = await fetch(`${API}/outreach/generate-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: selectedLeadId, offer }),
    });
    const data = await res.json();
    setSequence(data.emails || []);
    setGenerating(false);
  };

  const saveCampaign = async () => {
    if (!campaignName || sequence.length === 0) return;
    const res = await fetch(`${API}/outreach/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: campaignName,
        leads: [selectedLeadId],
        sequence: sequence.map((body, i) => ({
          step: i + 1,
          type: i === 1 ? "whatsapp" : "email",
          subject: `Outreach Day ${i + 1}`,
          body,
        })),
      }),
    });
    const camp = await res.json();
    setActiveCampaignId(camp._id);
    toast({ title: "Campaign saved" });
  };

  const sendDayEmail = async (stepIndex: number) => {
    if (!activeCampaignId) {
      toast({ title: "Save the campaign first", variant: "destructive" });
      return;
    }
    setSendingDay(stepIndex);
    const lead = leads.find(l => l._id === selectedLeadId);
    if (!lead?.email) {
      toast({ title: "Lead has no email", variant: "destructive" });
      setSendingDay(null);
      return;
    }
    await fetch(`${API}/outreach/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: activeCampaignId, stepIndex, toEmail: lead.email }),
    });
    toast({ title: "Email sent" });
    setSendingDay(null);
  };

  const openWhatsApp = async () => {
    if (!activeCampaignId) {
      toast({ title: "Save the campaign first", variant: "destructive" });
      return;
    }
    const lead = leads.find(l => l._id === selectedLeadId);
    if (!lead?.phone) {
      toast({ title: "Lead has no phone", variant: "destructive" });
      return;
    }
    const link = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(sequence[1]?.substring(0, 200) || "Hello!")}`;
    window.open(link, "_blank");
    await fetch(`${API}/leads/${lead._id}/whatsapp-click`, { method: "PUT" });
  };

  return (
    <div className="glass-card p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-[#6366F1]" />
        <h2 className="text-xl font-semibold">AI Sequencer</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Select Lead</label>
          <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Choose a lead" />
            </SelectTrigger>
            <SelectContent>
              {leads.map(l => (
                <SelectItem key={l._id} value={l._id}>
                  {l.name} – {l.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Your Offer</label>
          <Input
            placeholder="e.g. Free consultation"
            value={offer}
            onChange={e => setOffer(e.target.value)}
            className="bg-white/5 border-white/10"
          />
        </div>
      </div>

      <Button
        onClick={generateSequence}
        disabled={generating || !selectedLeadId}
        className="bg-[#6366F1] gap-2"
      >
        <Sparkles className="h-4 w-4" /> {generating ? "Generating..." : "Generate 3-Step Sequence"}
      </Button>

      {generating && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <Skeleton key={i} className="h-20 w-full bg-white/5" />
          ))}
        </div>
      )}

      {sequence.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {sequence.map((body, i) => (
            <div key={i} className="p-4 bg-black/30 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-[#6366F1]">
                  Day {i + 1} {i === 1 ? "(WhatsApp)" : "(Email)"}
                </span>
                <span className="text-xs text-gray-500">
                  {i === 1 ? <Phone className="h-3 w-3 inline mr-1" /> : <Send className="h-3 w-3 inline mr-1" />}
                  {i === 1 ? "WhatsApp" : "Email"}
                </span>
              </div>
              <Textarea
                value={body}
                onChange={e => {
                  const newSeq = [...sequence];
                  newSeq[i] = e.target.value;
                  setSequence(newSeq);
                }}
                rows={3}
                className="bg-transparent border-white/10 resize-none"
              />
            </div>
          ))}

          <div className="flex items-center gap-3">
            <Input
              placeholder="Campaign Name"
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              className="max-w-xs bg-white/5 border-white/10"
            />
            <Button onClick={saveCampaign} variant="outline" className="border-[#6366F1] text-[#6366F1]">
              Save Campaign
            </Button>
          </div>

          {activeCampaignId && (
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => sendDayEmail(0)}
                disabled={sendingDay === 0}
                className="bg-[#6366F1] gap-2"
              >
                <Send className="h-4 w-4" /> {sendingDay === 0 ? "Sending..." : "Day 1 Email"}
              </Button>
              <Button onClick={openWhatsApp} variant="secondary" className="gap-2">
                <Phone className="h-4 w-4" /> Day 3 WhatsApp
              </Button>
              <Button
                onClick={() => sendDayEmail(2)}
                disabled={sendingDay === 2}
                className="gap-2"
              >
                <Clock className="h-4 w-4" /> {sendingDay === 2 ? "Sending..." : "Day 7 Follow-up"}
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
