"use client";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, Copy, Phone, Mail, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function FinderPage() {
  const [niche, setNiche] = useState("");
  const [country, setCountry] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleFind = async () => {
    if (!niche.trim() || !country.trim()) {
      toast({ title: "Please enter niche and country", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    setLeads([]);
    setStats(null);
    
    try {
      const res = await fetch(`${API}/finder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, country, jobTitle }),
      });
      const data = await res.json();
      
      // New backend returns { leads, stats }
      if (data.leads && Array.isArray(data.leads)) {
        setLeads(data.leads);
        setStats(data.stats);
        if (data.leads.length > 0) {
          toast({ title: `✅ Found ${data.leads.length} leads with emails!` });
        } else {
          toast({ title: "No leads found. Try different keywords.", variant: "destructive" });
        }
      }
      // Old format fallback
      else if (Array.isArray(data)) {
        setLeads(data);
        if (data.length > 0) {
          toast({ title: `✅ Found ${data.length} leads` });
        }
      } else {
        toast({ title: "No leads found. Try different search terms.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "❌ Error finding leads. Check backend.", variant: "destructive" });
    }
    setLoading(false);
  };

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads;
    const s = search.toLowerCase();
    return leads.filter(
      l =>
        l.name?.toLowerCase().includes(s) ||
        l.company?.toLowerCase().includes(s) ||
        l.email?.toLowerCase().includes(s)
    );
  }, [leads, search]);

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredLeads.map(l => l._id) : []);
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const bulkDelete = async () => {
    try {
      await fetch(`${API}/leads/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      toast({ title: `🗑️ ${selectedIds.length} leads deleted` });
      setSelectedIds([]);
      setLeads(prev => prev.filter(l => !selectedIds.includes(l._id)));
      setDeleteOpen(false);
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({ title: "📋 Email copied!" });
  };

  const whatsappClick = async (lead: any) => {
    if (!lead.phone) return;
    const cleanPhone = lead.phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(lead.name || "there")}`, "_blank");
    try {
      await fetch(`${API}/leads/${lead._id}/whatsapp-click`, { method: "PUT" });
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
        🔍 Lead Finder
      </h1>

      {/* Search Form */}
      <div className="glass-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Niche/Industry *</label>
            <Input
              placeholder="e.g. Digital Marketing"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Country *</label>
            <Input
              placeholder="e.g. USA"
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Job Title</label>
            <Input
              placeholder="e.g. CEO, Manager"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleFind}
              disabled={loading}
              className="bg-[#6366F1] hover:bg-[#4f46e5] w-full gap-2"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Searching...</> : "🔍 Find Leads"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats after search */}
      {stats && (
        <div className="flex gap-4 text-sm text-gray-400">
          <span>🔗 {stats.total} sites scanned</span>
          <span>✅ {stats.scraped} emails found</span>
          <span>⏭️ {stats.skipped} skipped</span>
          <span>💾 {stats.saved} saved</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-lg" />
          ))}
        </div>
      )}

      {/* Results Table */}
      {!loading && leads.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-semibold">
              Results <span className="text-sm text-gray-400">({leads.length} leads)</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter results..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-64 bg-white/5 border-white/10"
                />
              </div>
              {selectedIds.length > 0 && (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" /> Delete ({selectedIds.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#111] border-white/10">
                    <DialogHeader>
                      <DialogTitle>Delete {selectedIds.length} leads?</DialogTitle>
                      <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={bulkDelete}>Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => (
                  <TableRow key={lead._id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(lead._id)}
                        onCheckedChange={() => toggleOne(lead._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{lead.name || "—"}</TableCell>
                    <TableCell>{lead.company || "—"}</TableCell>
                    <TableCell>
                      {lead.email ? (
                        <button
                          onClick={() => copyEmail(lead.email)}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                        >
                          {lead.email} <Copy className="h-3 w-3 opacity-50" />
                        </button>
                      ) : (
                        <span className="text-red-400 text-xs">No email</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.phone ? (
                        <span className="text-green-400 text-sm">{lead.phone}</span>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {lead.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs"
                            onClick={() => whatsappClick(lead)}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                        {lead.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs"
                            onClick={() => copyEmail(lead.email)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && leads.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Search className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No leads yet</h3>
          <p className="text-sm text-gray-500">
            Enter a niche and country above, then click "Find Leads" to search.
          </p>
        </div>
      )}
    </motion.div>
  );
}
