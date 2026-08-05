"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Eye, Mail } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API}/outreach/campaigns`);
      setCampaigns(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const deleteCampaign = async (id: string) => {
    await fetch(`${API}/outreach/campaigns/${id}`, { method: "DELETE" });
    toast({ title: "Campaign deleted" });
    fetchCampaigns();
  };

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5" />)}</div>;

  return (
    <div className="glass-card p-6 space-y-6">
      <h2 className="text-xl font-semibold">📬 Sent Campaigns ({campaigns.length})</h2>
      {campaigns.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No campaigns sent yet. Use the "Select Leads" tab to send bulk emails.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map(camp => (
            <Card key={camp._id} className="bg-black/40 border-white/5 hover:border-[#6366F1]/30 transition-all">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-medium">{camp.name}</h3>
                  <p className="text-sm text-gray-400">{camp.leads?.length || 0} recipients</p>
                  {camp.sequence?.[0] && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="text-gray-300">Subject:</span> {camp.sequence[0].subject}
                      <p className="truncate text-gray-600">{camp.sequence[0].body?.substring(0, 100)}...</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{new Date(camp.sentAt || camp.createdAt).toLocaleString()}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteCampaign(camp._id)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
