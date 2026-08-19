"use client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, Copy, Phone, Loader2, User, Briefcase, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ExportMenu from "@/components/ui/export-menu";

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
  const [leadMode, setLeadMode] = useState<"business" | "consumer">("business");

  const handleFind = async () => {
    if (!niche.trim() || !country.trim()) {
      toast({ title: "Please enter niche and country", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLeads([]);
    setStats(null);
    try {
      const endpoint = leadMode === "consumer" ? "/api/consumer-finder" : "/api/finder";
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, country, jobTitle, productType: leadMode }),
      });
      const data = await res.json();
      if (data.leads && data.leads.length > 0) {
        setLeads(data.leads);
        setStats(data.stats || { total: data.leads.length });
        toast({
          title: leadMode === "consumer"
            ? `🛒 Found ${data.leads.length} buyer-intent leads!`
            : `✅ Found ${data.leads.length} leads with emails!`,
        });
      } else if (Array.isArray(data) && data.length > 0) {
        setLeads(data);
        setStats({ total: data.length });
        toast({ title: `✅ Found ${data.length} leads` });
      } else {
        toast({ title: "No leads found. Try different terms.", variant: "destructive" });
      }
    } catch {
      toast({ title: "❌ Error finding leads.", variant: "destructive" });
    }
    setLoading(false);
  };

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads;
    const s = search.toLowerCase();
    return leads.filter(l =>
      l.name?.toLowerCase().includes(s) ||
      l.company?.toLowerCase().includes(s) ||
      l.email?.toLowerCase().includes(s)
    );
  }, [leads, search]);

  const toggleSelectAll = (checked: boolean) => setSelectedIds(checked ? filteredLeads.map(l => l._id) : []);
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const bulkDelete = async () => {
    await fetch(`${API}/leads/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    toast({ title: `🗑️ Deleted ${selectedIds.length} leads` });
    setLeads(prev => prev.filter(l => !selectedIds.includes(l._id)));
    setSelectedIds([]);
    setDeleteOpen(false);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({ title: "📋 Email copied!" });
  };

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
        🔍 Lead Finder
      </h1>

      {/* Mode Toggle + Search Form */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Mode:</span>
          <div className="flex bg-white/5 rounded-lg p-0.5">
            <Button
              variant={leadMode === "business" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLeadMode("business")}
              className="gap-1"
            >
              <Briefcase className="h-4 w-4" /> Business
            </Button>
            <Button
              variant={leadMode === "consumer" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLeadMode("consumer")}
              className="gap-1"
            >
              <User className="h-4 w-4" /> Consumer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Niche/Industry *</label>
            <Input placeholder="e.g. Digital Marketing" value={niche} onChange={e => setNiche(e.target.value)} className="bg-white/5 border-white/10" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Country *</label>
            <Input placeholder="e.g. US" value={country} onChange={e => setCountry(e.target.value)} className="bg-white/5 border-white/10" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Job Title (Business only)</label>
            <Input placeholder="e.g. CEO" value={jobTitle} onChange={e => setJobTitle(e.target.value)} disabled={leadMode === "consumer"} className="bg-white/5 border-white/10 disabled:opacity-50" />
          </div>
          <div className="flex items-end">
            <Button onClick={handleFind} disabled={loading} className="bg-[#6366F1] hover:bg-[#4f46e5] w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "🔍 Find Leads"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <span>🔗 {stats.total} leads found</span>
          {leadMode === "consumer" && <span>🛒 Buyer Intent Mode</span>}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card p-6 space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-lg" />)}
        </div>
      )}

      {/* Results */}
      {!loading && leads.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-semibold">Results ({leads.length} leads)</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Filter..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 bg-white/5 border-white/10" />
              </div>
              <ExportMenu data={filteredLeads} filename={`${leadMode}-leads`} />
              {selectedIds.length > 0 && (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-1" /> Delete ({selectedIds.length})</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#111] border-white/10">
                    <DialogHeader><DialogTitle>Delete leads?</DialogTitle><DialogDescription>Cannot be undone.</DialogDescription></DialogHeader>
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
                  <TableHead className="w-10"><Checkbox checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0} onCheckedChange={toggleSelectAll} /></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  {leadMode === "consumer" && <TableHead>Score</TableHead>}
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => (
                  <TableRow key={lead._id} className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell><Checkbox checked={selectedIds.includes(lead._id)} onCheckedChange={() => toggleOne(lead._id)} /></TableCell>
                    <TableCell className="font-medium">{lead.name || "—"}</TableCell>
                    <TableCell>{lead.company || "—"}</TableCell>
                    <TableCell>
                      {lead.email ? (
                        <button onClick={() => copyEmail(lead.email)} className="text-blue-400 hover:underline text-sm">{lead.email}</button>
                      ) : <span className="text-gray-500">—</span>}
                    </TableCell>
                    <TableCell className="text-green-400 text-sm">{lead.phone || "—"}</TableCell>
                    {leadMode === "consumer" && (
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          (lead.leadScore || 0) >= 20 ? 'bg-green-500/20 text-green-300' :
                          (lead.leadScore || 0) >= 10 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {lead.leadScore || 0}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex gap-1">
                        {lead.phone && (
                          <Button size="sm" variant="outline" className="h-8 border-green-500/30 text-green-400 text-xs" onClick={() => openWhatsApp(lead.phone)}>
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                        {lead.email && (
                          <Button size="sm" variant="outline" className="h-8 border-blue-500/30 text-blue-400 text-xs" onClick={() => copyEmail(lead.email)}>
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

      {!loading && leads.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Search className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No leads yet</h3>
          <p className="text-sm text-gray-500">Enter niche and country, then click Find Leads.</p>
        </div>
      )}
    </motion.div>
  );
}
