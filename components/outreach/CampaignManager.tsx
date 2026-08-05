"use client";
import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, RefreshCw, Phone, Send, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

const PAKISTAN_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi",
  "Faisalabad", "Multan", "Peshawar", "Quetta",
  "Sialkot", "Gujranwala"
];

export default function CampaignManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // Filters
  const [filters, setFilters] = useState({ niche: "all", country: "PK", city: "all" });
  const [filterOptions, setFilterOptions] = useState({ niches: [] });

  // AI generation
  const [aiNiche, setAiNiche] = useState("");
  const [aiOffer, setAiOffer] = useState("");
  const [aiSignature, setAiSignature] = useState("");
  const [generating, setGenerating] = useState(false);
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.niche !== "all") params.append("niche", filters.niche);
      if (filters.country !== "all") params.append("country", filters.country);
      if (filters.city !== "all") params.append("city", filters.city);
      if (search.trim()) params.append("search", search);

      const res = await fetch(`${API}/leads?${params.toString()}`);
      let data = await res.json();
      data = data.filter((l: any) => l.phone);
      setLeads(data);
    } catch {
      toast({ title: "Failed to load leads", variant: "destructive" });
    }
    setLoading(false);
  }, [filters, search]);

  useEffect(() => {
    fetchLeads();
    fetch(`${API}/leads/filters`).then(r => r.json()).then(d => {
      setFilterOptions({ niches: d.niches || [] });
    }).catch(() => {});
  }, [fetchLeads]);

  const toggleAll = (checked: boolean) => setSelectedIds(checked ? leads.map(l => l._id) : []);
  const toggleOne = (id: string) => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const openWhatsAppBulk = () => {
    const selected = leads.filter(l => selectedIds.includes(l._id));
    if (selected.length === 0) {
      toast({ title: "Select leads with phone numbers", variant: "destructive" });
      return;
    }
    const msg = message.trim() || "Hello";
    selected.forEach((lead, i) => {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, "");
      setTimeout(() => {
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
        fetch(`${API}/leads/${lead._id}/whatsapp-click`, { method: "PUT" }).catch(() => {});
      }, i * 800);
    });
    toast({ title: `💬 Opening WhatsApp for ${selected.length} leads...` });
  };

  const generateWhatsAppTemplates = async () => {
    if (!aiNiche.trim() || !aiOffer.trim()) {
      toast({ title: "Enter niche and offer", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`${API}/outreach/generate-whatsapp-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: aiNiche, offer: aiOffer, signature: aiSignature }),
      });
      const data = await res.json();
      if (data.templates && data.templates.length > 0) {
        setTemplates(data.templates);
        setSelectedTemplate(0);
        setMessage(data.templates[0]); // auto-fill first option
        toast({ title: "✅ 3 options generated!" });
      } else {
        toast({ title: "Failed to generate", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error generating templates", variant: "destructive" });
    }
    setGenerating(false);
  };

  const selectTemplate = (idx: number) => {
    setSelectedTemplate(idx);
    setMessage(templates[idx]);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">💬 WhatsApp Outreach ({leads.length})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 bg-white/5 border-white/10" />
          </div>
          <Button onClick={fetchLeads} variant="outline" size="sm"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filters.niche} onValueChange={v => setFilters(prev => ({ ...prev, niche: v }))}>
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-sm"><SelectValue placeholder="Niche" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Niches</SelectItem>
            {filterOptions.niches.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.city} onValueChange={v => setFilters(prev => ({ ...prev, city: v }))}>
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-sm"><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {PAKISTAN_CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button onClick={fetchLeads} variant="outline" size="sm" className="border-[#6366F1] text-[#6366F1]">
          Apply Filters
        </Button>
      </div>

      {/* AI Generator */}
      <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
        <p className="text-sm font-medium text-gray-300">🤖 Generate WhatsApp Message Options</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input placeholder="Niche (e.g. Auto Parts)" value={aiNiche} onChange={e => setAiNiche(e.target.value)} className="bg-white/5 border-white/10" />
          <Input placeholder="Your Offer / Value" value={aiOffer} onChange={e => setAiOffer(e.target.value)} className="bg-white/5 border-white/10" />
          <Input placeholder="Your Name (Signature)" value={aiSignature} onChange={e => setAiSignature(e.target.value)} className="bg-white/5 border-white/10" />
        </div>
        <Button onClick={generateWhatsAppTemplates} disabled={generating} className="bg-[#6366F1] gap-2" size="sm">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? "Generating..." : "Generate 3 Options"}
        </Button>

        {/* Template selection */}
        {templates.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mt-2">
            <p className="text-xs text-gray-400">Select the best option:</p>
            {templates.map((tmpl, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate === idx ? "border-[#6366F1] bg-[#6366F1]/10" : "border-white/10 hover:border-white/20"
                }`}
                onClick={() => selectTemplate(idx)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedTemplate === idx ? "border-[#6366F1]" : "border-gray-500"
                  }`}>
                    {selectedTemplate === idx && <div className="w-2 h-2 rounded-full bg-[#6366F1]" />}
                  </div>
                  <span className="text-xs font-medium">Option {idx + 1}</span>
                </div>
                <p className="text-sm text-gray-200">{tmpl}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Editable Message (always shows the selected template) */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Message (edit if needed)</label>
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          className="bg-white/5 border-white/10"
          placeholder="Your WhatsApp message will appear here..."
        />
      </div>

      {selectedIds.length > 0 && (
        <Button onClick={openWhatsAppBulk} className="bg-green-600 hover:bg-green-700 gap-2">
          <Send className="h-4 w-4" /> Open WhatsApp for {selectedIds.length} leads
        </Button>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No leads with phone numbers found for the selected filters.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead className="w-10"><Checkbox checked={selectedIds.length === leads.length && leads.length > 0} onCheckedChange={toggleAll} /></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map(lead => (
              <TableRow key={lead._id} className="border-white/5 hover:bg-white/[0.03]">
                <TableCell><Checkbox checked={selectedIds.includes(lead._id)} onCheckedChange={() => toggleOne(lead._id)} /></TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell className="text-green-400 text-sm">{lead.phone}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.status === "converted" ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
                    {lead.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
