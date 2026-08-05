"use client";
import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RefreshCw, Phone, Send, Sparkles, Loader2, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_OPTIONS = ["new", "contacted", "replied", "qualified", "converted"];

export default function CampaignManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // Filters
  const [filters, setFilters] = useState({ niche: "all", country: "all", city: "all" });
  const [filterOptions, setFilterOptions] = useState({ niches: [], countries: [] });

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
      // Only leads with phone numbers
      data = data.filter((l: any) => l.phone);
      setLeads(data);
    } catch {
      toast({ title: "Failed to load leads", variant: "destructive" });
    }
    setLoading(false);
  }, [filters, search]);

  useEffect(() => {
    fetchLeads();
    fetch(`${API}/leads/filters`)
      .then(r => r.json())
      .then(d => {
        setFilterOptions({ niches: d.niches || [], countries: d.countries || [] });
      })
      .catch(() => {});
  }, [fetchLeads]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleAll = (checked: boolean) => setSelectedIds(checked ? leads.map(l => l._id) : []);

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`${API}/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads(prev =>
        prev.map(l => (l._id === leadId ? { ...l, status: newStatus } : l))
      );
      toast({ title: `Status updated to ${newStatus}` });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const openWhatsAppBulk = () => {
    const selected = leads.filter(l => selectedIds.includes(l._id));
    if (selected.length === 0) {
      toast({ title: "Select at least one lead with a phone number", variant: "destructive" });
      return;
    }
    const msg = message.trim() || "Hello";
    selected.forEach((lead, i) => {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, "");
      setTimeout(() => {
        window.open(
          `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`,
          "_blank"
        );
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
        setMessage(data.templates[0]);
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

  // Extract unique cities from leads (fixed with Array.from)
  const cities = Array.from(
    new Set(leads.map(l => l.address).filter(Boolean))
  ).slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">💬 WhatsApp Outreach ({leads.length})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-48 bg-white/5 border-white/10"
            />
          </div>
          <Button onClick={fetchLeads} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={filters.niche}
          onValueChange={v => setFilters(prev => ({ ...prev, niche: v }))}
        >
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-sm">
            <SelectValue placeholder="Niche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Niches</SelectItem>
            {filterOptions.niches.map(n => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.country}
          onValueChange={v => setFilters(prev => ({ ...prev, country: v }))}
        >
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-sm">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {filterOptions.countries.map(c => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.city}
          onValueChange={v => setFilters(prev => ({ ...prev, city: v }))}
        >
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-sm">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={fetchLeads}
          variant="outline"
          size="sm"
          className="border-[#6366F1] text-[#6366F1]"
        >
          Apply Filters
        </Button>
      </div>

      {/* AI Generator */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-sm font-medium text-gray-300">
          🤖 Generate WhatsApp Message Options
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input
            placeholder="Niche (e.g. Auto Parts)"
            value={aiNiche}
            onChange={e => setAiNiche(e.target.value)}
            className="bg-white/5 border-white/10"
          />
          <Input
            placeholder="Your Offer / Value"
            value={aiOffer}
            onChange={e => setAiOffer(e.target.value)}
            className="bg-white/5 border-white/10"
          />
          <Input
            placeholder="Your Name (Signature)"
            value={aiSignature}
            onChange={e => setAiSignature(e.target.value)}
            className="bg-white/5 border-white/10"
          />
        </div>
        <Button
          onClick={generateWhatsAppTemplates}
          disabled={generating}
          className="bg-[#6366F1] gap-2"
          size="sm"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Generating..." : "Generate 3 Options"}
        </Button>

        {templates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2 mt-2"
          >
            <p className="text-xs text-gray-400">Select the best option:</p>
            {templates.map((tmpl, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate === idx
                    ? "border-[#6366F1] bg-[#6366F1]/10"
                    : "border-white/10 hover:border-white/20"
                }`}
                onClick={() => selectTemplate(idx)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedTemplate === idx ? "border-[#6366F1]" : "border-gray-500"
                    }`}
                  >
                    {selectedTemplate === idx && (
                      <div className="w-2 h-2 rounded-full bg-[#6366F1]" />
                    )}
                  </div>
                  <span className="text-xs font-medium">Option {idx + 1}</span>
                </div>
                <p className="text-sm text-gray-200">{tmpl}</p>
              </div>
            ))}
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Message (edit if needed)</label>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            className="bg-white/5 border-white/10"
            placeholder="Your WhatsApp message..."
          />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
          <span className="text-sm text-gray-400">{selectedIds.length} selected</span>
          <Button
            onClick={openWhatsAppBulk}
            className="bg-green-600 hover:bg-green-700 gap-2"
            size="sm"
          >
            <Send className="h-4 w-4" /> Open WhatsApp
          </Button>
        </div>
      )}

      {/* Lead Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No leads with phone numbers found.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <Checkbox
                checked={selectedIds.length === leads.length && leads.length > 0}
                onCheckedChange={toggleAll}
              />
              Select All
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map(lead => (
              <Card
                key={lead._id}
                className={`bg-black/40 border ${
                  selectedIds.includes(lead._id)
                    ? "border-[#6366F1]"
                    : "border-white/5"
                } hover:border-white/10 transition-all`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={selectedIds.includes(lead._id)}
                        onCheckedChange={() => toggleSelect(lead._id)}
                      />
                      <div>
                        <h3 className="font-semibold text-white">
                          {lead.name || "Unknown"}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {lead.company || "—"}
                        </p>
                        {lead.address && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[180px]">{lead.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9+]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs hover:bg-green-500/20 transition-colors"
                        onClick={() => {
                          fetch(`${API}/leads/${lead._id}/whatsapp-click`, {
                            method: "PUT",
                          }).catch(() => {});
                        }}
                      >
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(lead.email);
                          toast({ title: "Email copied!" });
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20"
                      >
                        <Mail className="h-3 w-3" /> Email
                      </button>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <Select
                      value={lead.status || "new"}
                      onValueChange={val => updateLeadStatus(lead._id, val)}
                    >
                      <SelectTrigger className="h-7 px-2 text-xs bg-white/5 border-white/10 w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s} value={s} className="text-xs capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
