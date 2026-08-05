"use client";
import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, Filter, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LeadSelectionTable() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ niche: "all", country: "all", status: "all" });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState({ niches: [], countries: [], statuses: ["new", "contacted", "replied", "converted"] });
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.niche !== "all") params.append("niche", filters.niche);
      if (filters.country !== "all") params.append("country", filters.country);
      if (filters.status !== "all") params.append("status", filters.status);
      if (search.trim()) params.append("search", search);

      const res = await fetch(`${API}/leads?${params.toString()}`);
      const data = await res.json();
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

  return (
    <div className="glass-card p-6 space-y-4">
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
          <Button onClick={fetchLeads} variant="outline" size="sm"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={filters.niche} onValueChange={v => setFilters(prev => ({ ...prev, niche: v }))}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-sm">
            <SelectValue placeholder="Niche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Niches</SelectItem>
            {filterOptions.niches.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.country} onValueChange={v => setFilters(prev => ({ ...prev, country: v }))}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-sm">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {filterOptions.countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={v => setFilters(prev => ({ ...prev, status: v }))}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {filterOptions.statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={fetchLeads} variant="outline" className="border-[#6366F1] text-[#6366F1]">
          <Filter className="h-4 w-4 mr-1" /> Apply
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-1" /> Delete ({selectedIds.length})</Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111] border-white/10">
            <DialogHeader><DialogTitle>Delete leads?</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={bulkDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No leads match your filters.</p>
        </div>
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
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lead.status === "converted" ? "bg-green-500/20 text-green-300" :
                    lead.status === "replied" ? "bg-blue-500/20 text-blue-300" :
                    lead.status === "contacted" ? "bg-yellow-500/20 text-yellow-300" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>{lead.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
                                                   }
