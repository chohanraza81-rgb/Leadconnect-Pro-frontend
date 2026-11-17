"use client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, Copy, Loader2, ExternalLink, Mail, Phone, Globe, Target } from "lucide-react";
import { motion } from "framer-motion";
import ExportMenu from "@/components/ui/export-menu";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://leadconnect-pro-backend-production-0edb.up.railway.app/api";

export default function FinderPage() {
  const [niche, setNiche] = useState("");
  const [country, setCountry] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [onlyContact, setOnlyContact] = useState(false);

  const handleFind = async () => {
    if (!niche.trim() || !country.trim()) {
      toast({ title: "Please enter niche and country", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLeads([]);
    try {
      const res = await fetch(`${API}/finder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, country, jobTitle }),
      });
      const data = await res.json();
      if (data.leads && data.leads.length > 0) {
        setLeads(data.leads);
        toast({ title: `Found ${data.leads.length} business leads` });
      } else {
        toast({ title: "No leads found. Try different terms.", variant: "destructive" });
      }
    } catch (e) {
      console.error("Find error:", e);
      toast({
        title: "Connection failed",
        description: "Check your internet or backend URL.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const filteredLeads = useMemo(() => {
    let list = leads;
    if (onlyContact) list = list.filter((l) => l.email || l.phone);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name?.toLowerCase().includes(s) ||
          l.company?.toLowerCase().includes(s) ||
          l.email?.toLowerCase().includes(s) ||
          l.phone?.toLowerCase().includes(s) ||
          l.source?.toLowerCase().includes(s)
      );
    }
    return list;
  }, [leads, search, onlyContact]);

  const toggleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? filteredLeads.map((l) => l._id) : []);
  const toggleOne = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const bulkDelete = async () => {
    await fetch(`${API}/leads/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    toast({ title: `Deleted ${selectedIds.length} leads` });
    setLeads((prev) => prev.filter((l) => !selectedIds.includes(l._id)));
    setSelectedIds([]);
    setDeleteOpen(false);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  const content = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Lead Finder"
        description="Discover verified business leads by niche and country."
        icon={<Search className="h-6 w-6" />}
      />

      {/* Info banner (replaces mode toggle) */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/50">
          <Target className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Business Leads Mode</p>
          <p className="text-xs text-muted-foreground">
            Find verified B2B prospects with contact details, job titles, and source links.
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="rounded-2xl bg-card border border-border p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold text-foreground">Search parameters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Niche / Industry *</label>
            <Input placeholder="e.g. SEO Agency" value={niche} onChange={(e) => setNiche(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Country *</label>
            <Input placeholder="e.g. US" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Job Title <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input placeholder="e.g. CEO" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleFind} disabled={loading} className="w-full gap-2 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Finding..." : "Find Leads"}
            </Button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
          <Checkbox checked={onlyContact} onCheckedChange={(v) => setOnlyContact(!!v)} />
          Show only leads with contact info (email or phone)
        </label>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && filteredLeads.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Results</h2>
              <p className="text-xs text-muted-foreground">
                {filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"} found
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-52"
                />
              </div>
              <ExportMenu data={filteredLeads} filename="business-leads" />
              {selectedIds.length > 0 && (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1.5">
                      <Trash2 className="h-4 w-4" /> Delete ({selectedIds.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">Name</TableHead>
                  <TableHead className="text-foreground font-semibold">Company</TableHead>
                  <TableHead className="text-foreground font-semibold">Email</TableHead>
                  <TableHead className="text-foreground font-semibold">Phone</TableHead>
                  <TableHead className="w-[100px] text-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead._id} className="hover:bg-muted/30">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(lead._id)}
                        onCheckedChange={() => toggleOne(lead._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{lead.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.company || "—"}</TableCell>
                    <TableCell>
                      {lead.email ? (
                        <button
                          onClick={() => copyText(lead.email, "Email")}
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
                        >
                          <Mail className="h-3 w-3" /> {lead.email}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.phone ? (
                        <button
                          onClick={() => copyText(lead.phone, "Phone")}
                          className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
                        >
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.source && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                          onClick={() => window.open(lead.source, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" /> Visit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredLeads.length === 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/50 p-16 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 mb-4">
            <Search className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold mb-1 text-foreground">No leads yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enter a niche and country above, then click{" "}
            <span className="font-semibold text-foreground">Find Leads</span> to start discovering prospects.
          </p>
        </div>
      )}
    </motion.div>
  );

  return <DashboardLayout>{content}</DashboardLayout>;
}
