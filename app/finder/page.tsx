"use client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, Copy, Loader2, User, Briefcase, ExternalLink, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import ExportMenu from "@/components/ui/export-menu";
import DashboardLayout from "@/components/DashboardLayout";

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
  const [leadMode, setLeadMode] = useState<"business" | "consumer">("consumer");
  const [onlyContact, setOnlyContact] = useState(false);

  const handleFind = async () => {
    if (!niche.trim() || !country.trim()) {
      toast({ title: "Please enter niche and country", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLeads([]);
    try {
      const endpoint = leadMode === "consumer" ? "/consumer-finder" : "/finder";
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, country, jobTitle, productType: leadMode }),
      });
      const data = await res.json();
      if (data.leads && data.leads.length > 0) {
        setLeads(data.leads);
        toast({
          title:
            leadMode === "consumer"
              ? `Found ${data.leads.length} buyer leads`
              : `Found ${data.leads.length} business leads`,
        });
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
      {/* HEADER */}
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">🔍 Lead Finder</h1>
        <p className="text-sm text-muted-foreground">
          Discover verified business and consumer leads by niche and country.
        </p>
      </div>

      {/* MODE TOGGLE */}
      <div className="rounded-2xl bg-card border border-border p-3 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground px-2">Mode</span>
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setLeadMode("consumer")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              leadMode === "consumer"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> Consumer
          </button>
          <button
            onClick={() => setLeadMode("business")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              leadMode === "business"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="h-4 w-4" /> Business
          </button>
        </div>
        {leadMode === "consumer" && (
          <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
            Buyer-intent leads
          </span>
        )}
      </div>

      {/* SEARCH FORM */}
      <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Niche / Industry *</label>
            <Input placeholder="e.g. Headphones" value={niche} onChange={(e) => setNiche(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Country *</label>
            <Input placeholder="e.g. US" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Job Title <span className="text-muted-foreground/60">(Business only)</span>
            </label>
            <Input
              placeholder="e.g. CEO"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={leadMode === "consumer"}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleFind} disabled={loading} className="w-full gap-2 shadow-md">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Finding..." : "Find Leads"}
            </Button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <Checkbox checked={onlyContact} onCheckedChange={(v) => setOnlyContact(!!v)} />
          Show only leads with contact info (email or phone)
        </label>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* RESULTS */}
      {!loading && filteredLeads.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold">Results</h2>
              <p className="text-xs text-muted-foreground">
                {filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"} found
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <ExportMenu data={filteredLeads} filename={`${leadMode}-leads`} />
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
                      <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={bulkDelete}>
                        Delete
                      </Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  {leadMode === "consumer" && <TableHead>Score</TableHead>}
                  <TableHead className="w-[100px]">Actions</TableHead>
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
                    <TableCell className="font-medium">{lead.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{lead.company || "—"}</TableCell>
                    <TableCell>
                      {lead.email ? (
                        <button
                          onClick={() => copyText(lead.email, "Email")}
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
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
                          className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {leadMode === "consumer" && (
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            (lead.leadScore || 0) >= 40
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : (lead.leadScore || 0) >= 20
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {lead.leadScore || 0}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      {lead.source && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs"
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

      {/* EMPTY */}
      {!loading && filteredLeads.length === 0 && (
        <div className="rounded-2xl bg-card border border-border p-16 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No leads yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enter a niche and country above, then click <span className="font-medium text-foreground">Find Leads</span> to start discovering prospects.
          </p>
        </div>
      )}
    </motion.div>
  );

  return <DashboardLayout>{content}</DashboardLayout>;
}
