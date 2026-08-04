"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [newCampaignName, setNewCampaignName] = useState("");
  const { toast } = useToast();

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    const res = await fetch(`${API}/outreach/campaigns`);
    setCampaigns(await res.json());
    setLoading(false);
  };

  const deleteCampaign = async (id: string) => {
    await fetch(`${API}/outreach/campaigns/${id}`, { method: "DELETE" });
    toast({ title: "Campaign deleted" });
    fetchCampaigns();
    if (selectedCampaign?._id === id) setSelectedCampaign(null);
  };

  const createCampaign = async () => {
    if (!newCampaignName) return;
    await fetch(`${API}/outreach/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCampaignName, leads: [], sequence: [] }),
    });
    toast({ title: "Campaign created" });
    setNewCampaignName("");
    fetchCampaigns();
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Campaigns</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Campaign name"
            value={newCampaignName}
            onChange={e => setNewCampaignName(e.target.value)}
            className="w-48 bg-white/5 border-white/10"
          />
          <Button onClick={createCampaign} size="sm" className="bg-[#6366F1]">
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No campaigns yet. Create one from the Sequencer tab.
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {campaigns.map(camp => (
              <motion.div
                key={camp._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card
                  className="bg-black/40 border-white/5 hover:border-[#6366F1]/30 cursor-pointer transition-all"
                  onClick={() => setSelectedCampaign(camp)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{camp.name}</h3>
                      <p className="text-sm text-gray-400">
                        {camp.leads?.length || 0} leads · {camp.sequence?.length || 0} steps
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={e => { e.stopPropagation(); deleteCampaign(camp._id); }}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {selectedCampaign && (
        <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
          <h3 className="text-lg font-semibold text-[#6366F1]">
            {selectedCampaign.name} – Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Leads:</p>
              <ul className="list-disc list-inside">
                {selectedCampaign.leads?.map((lead: any) => (
                  <li key={lead._id}>{lead.name} – {lead.company}</li>
                ))}
                {(!selectedCampaign.leads || selectedCampaign.leads.length === 0) && (
                  <li className="text-gray-500">No leads added</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-gray-400">Sequence:</p>
              {selectedCampaign.sequence?.map((step: any, i: number) => (
                <div key={i} className="mt-1">
                  <span className="font-medium">Day {i+1} ({step.type})</span>
                  <p className="text-gray-300 text-xs truncate">{step.subject}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
    }
