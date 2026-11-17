"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, Copy, Phone, MapPin, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ExportMenu from "@/components/ui/export-menu";
import DashboardLayout from "@/components/DashboardLayout";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://leadconnect-pro-backend-production-0edb.up.railway.app/api";

export default function LocalInsightsPage() {
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any>(null);

  const handleSearch = async () => {
    if (!niche.trim() || !location.trim()) {
      toast({ title: "Enter niche and location", variant: "destructive" });
      return;
    }
    setLoading(true);
    setLeads([]);
    setStats(null);
    try {
      const res = await fetch(`${API}/local-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, location }),
      });
      const data = await res.json();
      if (data.leads && data.leads.length > 0) {
        setLeads(data.leads);
        setStats(data.stats);
        toast({ title: `Found ${data.leads.length} local businesses` });
      } else {
        toast({ title: "No results. Try different search.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Search failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const filtered = search.trim()
    ? leads.filter(
        (l) =>
          l.name?.toLowerCase().includes(search.toLowerCase()) ||
          l.address?.toLowerCase().includes(search.toLowerCase()) ||
          l.email?.toLowerCase().includes(search.toLowerCase())
      )
    : leads;

  const toggleAll = (checked: boolean) =>
    setSelectedIds(checked ? filtered.map((l) => l._id) : []);
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
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  const content = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* HEADER */}
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">📍 Local Insights</h1>
        <p className="text-sm text-muted-foreground">
          Find local businesses on Google Maps with verified contact details.
        </p>
      </div>

      {/* SEARCH FORM */}
      <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Business Type *</label>
            <Input placeholder="e.g. Auto Parts Shop" value={niche} onChange={(e) => setNiche(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Location *</label>
            <Input placeholder="e.g. Lahore, Pakistan" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} disabled={loading} className="w-full gap-2 shadow-md">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {loading ? "Searching..." : "Search Maps"}
            </Button>
          </div>
        </div>
      </div>

      {/* STATS */}
      {stats && (
        <div className="rounded-2xl bg-card border border-border p-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" /> <span className="font-semibold text-foreground">{stats.total}</span> places
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            🌐 <span className="font-semibold text-foreground">{stats.withWebsite}</span> with website
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            📧 <span className="font-semibold text-foreground">{stats.withEmail}</span> emails
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            💾 <span className="font-semibold text-foreground">{stats.saved}</span> saved
          </span>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* RESULTS */}
      {!loading && leads.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold">Local Businesses</h2>
              <p className="text-xs text-muted-foreground">
                {filtered.length} result{filtered.length === 1 ? "" : "s"}
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
              <ExportMenu data={filtered} filename="local-businesses" />
              {selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" onClick={bulkDelete} className="gap-1.5">
                  <Trash2 className="h-4 w-4" /> Delete ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow key={lead._id} className="hover:bg-muted/30">
                    <TableCell>
                      <Checkbox checked={selectedIds.includes(lead._id)} onCheckedChange={() => toggleOne(lead._id)} />
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
                      {lead.address || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {lead.phone && (
                          <button
                            onClick={() => copyText(lead.phone, "Phone")}
                            className="text-emerald-600 hover:text-emerald-700 hover:underline text-left"
                          >
                            📱 {lead.phone}
                          </button>
                        )}
                        {lead.email && (
                          <button
                            onClick={() => copyText(lead.email, "Email")}
                            className="text-indigo-600 hover:text-indigo-700 hover:underline text-left"
                          >
                            📧 {lead.email}
                          </button>
                        )}
                        {!lead.phone && !lead.email && <span className="text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{lead.rating}</span>
                          {lead.reviews && (
                            <span className="text-muted-foreground text-xs ml-0.5">({lead.reviews})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {lead.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => openWhatsApp(lead.phone)}
                            title="Open WhatsApp"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {lead.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            onClick={() => copyText(lead.email, "Email")}
                            title="Copy email"
                          >
                            <Copy className="h-3.5 w-3.5" />
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

      {/* EMPTY */}
      {!loading && leads.length === 0 && (
        <div className="rounded-2xl bg-card border border-border p-16 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No local businesses yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enter a business type and location above, then click <span className="font-medium text-foreground">Search Maps</span> to discover local prospects.
          </p>
        </div>
      )}
    </motion.div>
  );

  return <DashboardLayout>{content}</DashboardLayout>;
}
