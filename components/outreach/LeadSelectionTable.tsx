"use client";
import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, Filter, RefreshCw, Send, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LeadSelectionTable() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ niche: "all", country: "all", status: "all", emailOnly: true });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState({ niches: [], countries: [], statuses: ["new", "contacted", "replied", "converted"] });
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Bulk email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailOffer, setEmailOffer] = useState("");
  const [signature, setSignature] = useState("");
  const [generating, setGenerating] = useState(false);
  const [templates, setTemplates] = useState<string[]>([]);
  const [editableTemplates, setEditableTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [sending, setSending] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.niche !== "all") params.append("niche", filters.niche);
      if (filters.country !== "all") params.append("country", filters.country);
      if (filters.status !== "all") params.append("status", filters.status);
      if (search.trim()) params.append("search", search);

      const res = await fetch(`${API}/leads?${params.toString()}`);
      let data = await res.json();
      if (filters.emailOnly) data = data.filter((l: any) => l.email);
      setLeads(data);
    } catch {
      toast({ title: "Failed to load leads", variant: "destructive" });
    }
    setLoading(false);
  }, [filters, search]);

  useEffect(() => {
    fetchLeads();
    fetch(`${API}/leads/filters`).then(r => r.json()).then(d => {
      setFilterOptions(prev => ({ ...prev, niches: d.niches || [], countries: d.countries || [] }));
    }).catch(() => {});
  }, [fetchLeads]);

  const toggleAll = (checked: boolean) => setSelectedIds(checked ? leads.map(l => l._id) : []);
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const bulkDelete = async () => {
    await fetch(`${API}/leads/bulk-delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selectedIds }) });
    toast({ title: `🗑️ Deleted ${selectedIds.length} leads` });
    setSelectedIds([]);
    fetchLeads();
    setDeleteOpen(false);
  };

  const selectedLeads = leads.filter(l => selectedIds.includes(l._id));

  const openEmailModal = () => {
    if (selectedLeads.length === 0) {
      toast({ title: "Select at least one lead with email", variant: "destructive" });
      return;
    }
    setEmailSubject("");
    setEmailOffer("");
    setSignature("");
    setTemplates([]);
    setEditableTemplates([]);
    setSelectedTemplate(0);
    setEmailModalOpen(true);
  };

  const generateTemplates = async () => {
    if (!emailSubject.trim() || !emailOffer.trim()) {
      toast({ title: "Subject and offer are required", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`${API}/outreach/generate-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject, offer: emailOffer, signature }),
      });
      const data = await res.json();
      if (data.templates && data.templates.length > 0) {
        setTemplates(data.templates);
        setEditableTemplates(data.templates.map(t => t)); // make editable copies
        setSelectedTemplate(0);
      } else {
        toast({ title: "AI generation failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error generating templates", variant: "destructive" });
    }
    setGenerating(false);
  };

  const updateTemplate = (index: number, value: string) => {
    const updated = [...editableTemplates];
    updated[index] = value;
    setEditableTemplates(updated);
  };

  const sendBulkEmail = async () => {
    if (editableTemplates.length === 0) return;
    const body = editableTemplates[selectedTemplate]; // use the edited version
    setSending(true);
    let success = 0;
    for (const lead of selectedLeads) {
      try {
        await fetch(`${API}/outreach/bulk-send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: lead.email, subject: emailSubject, body, leadId: lead._id }),
        });
        success++;
      } catch {}
    }
    toast({ title: `📧 Sent to ${success} / ${selectedLeads.length} leads` });
    setSending(false);
    setEmailModalOpen(false);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Select Leads ({leads.length})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchLeads()} className="pl-9 w-48 bg-white/5 border-white/10" />
          </div>
          <Button onClick={fetchLeads} variant="outline" size="sm"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filters.niche} onValueChange={v => setFilters(prev => ({ ...prev, niche: v }))}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-sm"><SelectValue placeholder="Niche" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Niches</SelectItem>
            {filterOptions.niches.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.country} onValueChange={v => setFilters(prev => ({ ...prev, country: v }))}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-sm"><SelectValue placeholder="Country" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {filterOptions.countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={v => setFilters(prev => ({ ...prev, status: v }))}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {filterOptions.statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <Checkbox checked={filters.emailOnly} onCheckedChange={v => setFilters(prev => ({ ...prev, emailOnly: !!v }))} />
          Email only
        </label>
        <Button onClick={fetchLeads} variant="outline" className="border-[#6366F1] text-[#6366F1]">
          <Filter className="h-4 w-4 mr-1" /> Apply
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={openEmailModal}>
            <Send className="h-4 w-4 mr-1" /> Send Bulk Email
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-[#111] border-white/10">
          <DialogHeader><DialogTitle>Delete {selectedIds.length} leads?</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={bulkDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="bg-[#111] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-[#6366F1]" /> Bulk Email to {selectedLeads.length} leads</DialogTitle>
            <DialogDescription>
              Templates use <code className="bg-white/5 px-1 rounded">{"{{firstName}}"}</code> and <code className="bg-white/5 px-1 rounded">{"{{company}}"}</code> placeholders – they will be replaced automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email Subject</label>
              <Input placeholder="e.g. Partnership Opportunity" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Your Offer / Key Points</label>
              <Textarea placeholder="e.g. We offer free SEO audit" value={emailOffer} onChange={e => setEmailOffer(e.target.value)} rows={3} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Your Name (Signature)</label>
              <Input placeholder="e.g. Ali from HighTech" value={signature} onChange={e => setSignature(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <Button onClick={generateTemplates} disabled={generating || !emailSubject || !emailOffer} className="bg-[#6366F1] gap-2 w-full">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generating..." : "Generate Email Templates"}
            </Button>

            {editableTemplates.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <p className="text-sm text-gray-400">Select a template and edit if needed:</p>
                {editableTemplates.map((tmpl, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTemplate === idx ? "border-[#6366F1] bg-[#6366F1]/10" : "border-white/10 hover:border-white/20"}`} onClick={() => setSelectedTemplate(idx)}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedTemplate === idx ? "border-[#6366F1]" : "border-gray-500"}`}>
                        {selectedTemplate === idx && <div className="w-2 h-2 rounded-full bg-[#6366F1]" />}
                      </div>
                      <span className="text-sm font-medium">Option {idx + 1}</span>
                    </div>
                    <Textarea
                      value={tmpl}
                      onChange={e => updateTemplate(idx, e.target.value)}
                      rows={6}
                      className="bg-transparent border-white/10 text-sm text-gray-200"
                    />
                  </div>
                ))}

                <Button onClick={sendBulkEmail} disabled={sending} className="w-full bg-green-600 hover:bg-green-700 gap-2">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Sending..." : `Send to ${selectedLeads.length} leads`}
                </Button>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><Filter className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No leads match your filters.</p></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead className="w-10"><Checkbox checked={selectedIds.length === leads.length && leads.length > 0} onCheckedChange={toggleAll} /></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
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
                <TableCell className="text-blue-400 text-sm">{lead.email || "—"}</TableCell>
                <TableCell className="text-green-400 text-sm">{lead.phone || "—"}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.status === "converted" ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>{lead.status}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
