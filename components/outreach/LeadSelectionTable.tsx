"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, Filter, RefreshCw, Send, Paperclip, File, X, Mail, Users, Info, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const API = "https://leadconnect-pro-backend-production.up.railway.app/api"; // Hardcoded

export default function LeadSelectionTable() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ niche: "all", country: "all", status: "all", emailOnly: true });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState({ niches: [], countries: [], statuses: ["new", "contacted", "replied", "qualified", "converted"] });
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Email composer state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailCC, setEmailCC] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    fetch(`${API}/leads/filters`)
      .then(r => r.json())
      .then(d => setFilterOptions(prev => ({ ...prev, niches: d.niches || [], countries: d.countries || [] })))
      .catch(() => {});
  }, [fetchLeads]);

  const toggleAll = (checked: boolean) => setSelectedIds(checked ? leads.map(l => l._id) : []);
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const bulkDelete = async () => {
    await fetch(`${API}/leads/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
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
    setEmailBody("");
    setEmailCC("");
    setEmailBCC("");
    setUploadedFile(null);
    setEmailModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large. Max 10MB allowed.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setUploadedFile(data);
        toast({ title: `📎 ${data.filename} uploaded!` });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch {
      toast({ title: "File upload failed", variant: "destructive" });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = () => setUploadedFile(null);

  // Send emails with manual subject/body, placeholders, CC/BCC, attachment
  const sendEmails = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({ title: "Subject and body are required", variant: "destructive" });
      return;
    }

    setSending(true);
    let success = 0;
    let failed = 0;

    for (const lead of selectedLeads) {
      try {
        // Replace placeholders
        const firstName = lead.name?.split(' ')[0] || 'there';
        const company = lead.company || 'your company';
        let personalizedBody = emailBody
          .replace(/{{firstName}}/g, firstName)
          .replace(/{{company}}/g, company);

        const res = await fetch(`${API}/outreach/bulk-send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: lead.email,
            subject: emailSubject,
            body: personalizedBody,
            leadId: lead._id,
            cc: emailCC || undefined,
            bcc: emailBCC || undefined,
            attachment: uploadedFile ? {
              filename: uploadedFile.filename,
              path: uploadedFile.path,
              content_type: uploadedFile.mimetype,
            } : undefined,
          }),
        });

        if (res.ok) success++;
        else {
          const err = await res.json();
          console.error("Send failed:", err);
          failed++;
        }
      } catch (e) {
        console.error("Network error:", e);
        failed++;
      }
    }

    setSending(false);
    setEmailModalOpen(false);
    setSelectedIds([]);

    if (failed > 0) {
      toast({
        title: `📧 ${success} sent, ${failed} failed`,
        description: "Check backend logs for details.",
        variant: "destructive",
      });
    } else {
      toast({ title: `✅ Successfully sent to ${success} leads!` });
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Select Leads ({leads.length})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchLeads()}
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

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={openEmailModal}>
            <Send className="h-4 w-4 mr-1" /> Send Email
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-[#111] border-white/10">
          <DialogHeader><DialogTitle>Delete {selectedIds.length} leads?</DialogTitle><DialogDescription>Cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={bulkDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Composer Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="bg-[#111] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-[#6366F1]" /> Compose Email to {selectedLeads.length} leads</DialogTitle>
            <DialogDescription>
              Use <code className="bg-white/5 px-1 rounded">{"{{firstName}}"}</code> and <code className="bg-white/5 px-1 rounded">{"{{company}}"}</code> placeholders – they will be replaced automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Subject *</label>
              <Input placeholder="Email subject..." value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Body *</label>
              <Textarea placeholder="Write your email..." value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={8} className="bg-white/5 border-white/10" />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Info className="h-3 w-3" /> Placeholders: {`{{firstName}}`}, {`{{company}}`}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">CC (optional)</label>
                <Input placeholder="cc@example.com" value={emailCC} onChange={e => setEmailCC(e.target.value)} className="bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">BCC (optional)</label>
                <Input placeholder="bcc@example.com" value={emailBCC} onChange={e => setEmailBCC(e.target.value)} className="bg-white/5 border-white/10" />
              </div>
            </div>

            {/* Attachment */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Attachment (max 10MB)</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />} Choose File
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                {uploadedFile && (
                  <span className="text-xs text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full">
                    <File className="h-3 w-3" /> {uploadedFile.filename}
                    <button onClick={removeAttachment}><X className="h-3 w-3 hover:text-red-400" /></button>
                  </span>
                )}
              </div>
            </div>

            <Button onClick={sendEmails} disabled={sending || !emailSubject || !emailBody} className="w-full bg-green-600 hover:bg-green-700 gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending..." : `Send to ${selectedLeads.length} leads`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading State */}
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
                <TableCell className="font-medium">{lead.name || "—"}</TableCell>
                <TableCell>{lead.company || "—"}</TableCell>
                <TableCell className="text-blue-400 text-sm">{lead.email || "—"}</TableCell>
                <TableCell className="text-green-400 text-sm">{lead.phone || "—"}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.status === "converted" ? "bg-green-500/20 text-green-300" : lead.status === "replied" ? "bg-blue-500/20 text-blue-300" : lead.status === "contacted" ? "bg-yellow-500/20 text-yellow-300" : "bg-gray-500/20 text-gray-400"}`}>{lead.status}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
