"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, Copy, Phone, Mail, MapPin, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

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
        toast({ title: `📍 Found ${data.leads.length} local businesses!` });
      } else {
        toast({ title: "No results. Try different search.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Search failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const bulkDelete = async () => {
    await fetch(`${API}/leads/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    toast({ title: `🗑️ Deleted ${selectedIds.length} leads` });
    setLeads(prev => prev.filter(l => !selectedIds.includes(l._id)));
    setSelectedIds([]);
  };

  const filtered = search.trim()
    ? leads.filter(l => 
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.address?.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase())
      )
    : leads;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map(l => l._id) : []);
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `📋 ${label} copied!` });
  };

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
        📍 Local Insights
      </h1>
      <p className="text-sm text-gray-400">Search Google Maps for local businesses with contact details.</p>

      {/* Search Form */}
      <div className="glass-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Business Type *</label>
            <Input
              placeholder="e.g. Auto Parts Shop"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Location *</label>
            <Input
              placeholder="e.g. Lahore, Pakistan"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#6366F1] hover:bg-[#4f46e5] w-full gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {loading ? "Searching Maps..." : "Search Google Maps"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <span>📍 {stats.total} places</span>
          <span>🌐 {stats.withWebsite} websites</span>
          <span>📧 {stats.withEmail} emails found</span>
          <span>💾 {stats.saved} saved</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card p-6 space-y-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-lg" />)}
        </div>
      )}

      {/* Results */}
      {!loading && leads.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-semibold">{leads.length} Local Businesses</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-48 bg-white/5 border-white/10"
                />
              </div>
              {selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" onClick={bulkDelete}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="w-10">
                    <Checkbox checked={selectedIds.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(lead => (
                  <TableRow key={lead._id} className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell><Checkbox checked={selectedIds.includes(lead._id)} onCheckedChange={() => toggleOne(lead._id)} /></TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="text-xs text-gray-400 max-w-[200px] truncate">{lead.address || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {lead.phone && (
                          <button onClick={() => copyText(lead.phone, "Phone")} className="text-green-400 hover:underline text-left">📱 {lead.phone}</button>
                        )}
                        {lead.email && (
                          <button onClick={() => copyText(lead.email, "Email")} className="text-blue-400 hover:underline text-left">📧 {lead.email}</button>
                        )}
                        {!lead.phone && !lead.email && <span className="text-gray-500">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.rating ? (
                        <span className="flex items-center gap-1 text-yellow-400 text-sm"><Star className="h-3 w-3 fill-yellow-400" /> {lead.rating}</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {lead.phone && (
                          <Button size="sm" variant="outline" className="h-8 border-green-500/30 text-green-400 text-xs" onClick={() => openWhatsApp(lead.phone)}>
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                        {lead.email && (
                          <Button size="sm" variant="outline" className="h-8 border-blue-500/30 text-blue-400 text-xs" onClick={() => copyText(lead.email, "Email")}>
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

      {/* Empty State */}
      {!loading && leads.length === 0 && (
        <div className="glass-card p-12 text-center">
          <MapPin className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No local businesses yet</h3>
          <p className="text-sm text-gray-500">Enter a business type and location, then click Search Google Maps.</p>
        </div>
      )}
    </motion.div>
  );
}
