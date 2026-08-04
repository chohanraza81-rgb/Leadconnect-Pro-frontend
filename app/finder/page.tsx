"use client";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, Copy, Phone } from "lucide-react";
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
  const { toast } = useToast();

  const handleFind = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/finder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, country, jobTitle }),
      });
      const data = await res.json();
      setLeads(data);
      toast({ title: `Found ${data.length} leads` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to find leads", variant: "destructive" });
    }
    setLoading(false);
  };

  const filteredLeads = useMemo(() => {
    if (!search) return leads;
    const s = search.toLowerCase();
    return leads.filter(
      l =>
        l.name?.toLowerCase().includes(s) ||
        l.company?.toLowerCase().includes(s) ||
        l.email?.toLowerCase().includes(s)
    );
  }, [leads, search]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filteredLeads.map(l => l._id));
    else setSelectedIds([]);
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const bulkDelete = async () => {
    await fetch(`${API}/leads/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    toast({ title: `${selectedIds.length} leads deleted` });
    setSelectedIds([]);
    setLeads(prev => prev.filter(l => !selectedIds.includes(l._id)));
    setDeleteOpen(false);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({ title: "Email copied" });
  };

  const whatsappClick = async (lead: any) => {
    await fetch(`${API}/leads/${lead._id}/whatsapp-click`, { method: "PUT" });
    window.open(
      `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=Hello%20${lead.name}`,
      "_blank"
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
        Lead Finder
      </h1>

      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Niche (e.g. SaaS)"
          value={niche}
          onChange={e => setNiche(e.target.value)}
          className="max-w-[180px] bg-white/5 border-white/10"
        />
        <Input
          placeholder="Country (e.g. US)"
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="max-w-[150px] bg-white/5 border-white/10"
        />
        <Input
          placeholder="Job Title (e.g. CEO)"
          value={jobTitle}
          onChange={e => setJobTitle(e.target.value)}
          className="max-w-[180px] bg-white/5 border-white/10"
        />
        <Button
          onClick={handleFind}
          disabled={loading}
          className="bg-[#6366F1] hover:bg-[#4f46e5]"
        >
          {loading ? "Searching..." : "Find Leads"}
        </Button>
      </div>

      {leads.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search leads..."
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
                      <DialogDescription>This cannot be undone.</DialogDescription>
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

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-white/5" />
              ))}
            </div>
          ) : (
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => (
                  <TableRow key={lead._id} className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(lead._id)}
                        onCheckedChange={() => toggleOne(lead._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>
                      {lead.email ? (
                        <button
                          onClick={() => copyEmail(lead.email)}
                          className="text-blue-400 hover:underline flex items-center gap-1"
                        >
                          {lead.email} <Copy className="h-3 w-3" />
                        </button>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{lead.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {lead.phone && (
                          <Button size="sm" variant="outline" onClick={() => whatsappClick(lead)}>
                            <Phone className="h-3 w-3 mr-1" /> WhatsApp
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-xs">
                          + Campaign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </motion.div>
  );
    }
