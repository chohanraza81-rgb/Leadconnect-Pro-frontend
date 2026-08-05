"use client";
import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, RefreshCw, Phone, Send } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CampaignManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/leads`);
      let data = await res.json();
      // Only leads with phone
      data = data.filter((l: any) => l.phone);
      if (search.trim()) {
        const s = search.toLowerCase();
        data = data.filter((l: any) =>
          l.name?.toLowerCase().includes(s) ||
          l.company?.toLowerCase().includes(s) ||
          l.phone?.toLowerCase().includes(s)
        );
      }
      setLeads(data);
    } catch {
      toast({ title: "Failed to load leads", variant: "destructive" });
    }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const toggleAll = (checked: boolean) => setSelectedIds(checked ? leads.map(l => l._id) : []);
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const openWhatsAppBulk = () => {
    const selected = leads.filter(l => selectedIds.includes(l._id));
    if (selected.length === 0) {
      toast({ title: "Select leads with phone", variant: "destructive" });
      return;
    }
    const msg = message.trim() || "Hello";
    selected.forEach((lead, i) => {
      const cleanPhone = lead.phone.replace(/[^0-9+]/g, "");
      setTimeout(() => {
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
        fetch(`${API}/leads/${lead._id}/whatsapp-click`, { method: "PUT" }).catch(() => {});
      }, i * 800);
    });
    toast({ title: `💬 Opening WhatsApp for ${selected.length} leads...` });
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">💬 WhatsApp Outreach ({leads.length})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 bg-white/5 border-white/10" />
          </div>
          <Button onClick={fetchLeads} variant="outline" size="sm"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Message Template</label>
        <Textarea
          placeholder="Type your WhatsApp message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          className="bg-white/5 border-white/10"
        />
      </div>

      {selectedIds.length > 0 && (
        <Button onClick={openWhatsAppBulk} className="bg-green-600 hover:bg-green-700 gap-2">
          <Send className="h-4 w-4" /> Open WhatsApp for {selectedIds.length} leads
        </Button>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No leads with phone numbers found.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead className="w-10"><Checkbox checked={selectedIds.length === leads.length && leads.length > 0} onCheckedChange={toggleAll} /></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
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
                <TableCell className="text-green-400 text-sm">{lead.phone}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.status === "converted" ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>{lead.status}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
