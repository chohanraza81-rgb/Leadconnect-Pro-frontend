"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Play, Send, Phone, Loader2, Users } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
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
  };

  const runCampaign = async (campaign: any) => {
    setRunningId(campaign._id);
    let sent = 0;
    for (const lead of campaign.leads) {
      if (!lead.email) continue;
      try {
        await fetch(`${API}/outreach/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: campaign._id,
            stepIndex: 0,
            toEmail: lead.email,
          }),
        });
        sent++;
      } catch {}
    }
    toast({ title: `📧 Sent ${sent} emails!` });
    setRunningId(null);
  };

  const openAllWhatsApp = (campaign: any) => {
    campaign.leads.forEach((lead: any, i: number) => {
      if (lead.phone) {
        setTimeout(() => {
          window.open(`https://wa.me/${lead.phone.replace(/[^0-9+]/g, '')}?text=Hello`, "_blank");
        }, i * 800);
      }
    });
    toast({ title: "💬 Opening WhatsApp tabs..." });
  };

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full bg-white/5" />)}</div>;

  return (
    <div className="glass-card p-6 space-y-6">
      <h2 className="text-xl font-semibold">📬 Campaigns ({campaigns.length})</h2>
      {campaigns.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No campaigns yet. Create one in the Sequencer tab.</p>
      ) : (
        <div className="grid gap-3">
          {campaigns.map(camp => (
            <Card key={camp._id} className="bg-black/40 border-white/5 hover:border-[#6366F1]/30 transition-all">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">{camp.name}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1"><Users className="h-3 w-3" /> {camp.leads?.length || 0} leads</p>
                </div>
                <div className="flex gap-2 self-end">
                  <Button
                    size="sm"
                    className="bg-[#6366F1] hover:bg-[#4f46e5] gap-1"
                    disabled={runningId === camp._id}
                    onClick={() => runCampaign(camp)}
                  >
                    {runningId === camp._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Run Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/30 text-green-400 gap-1"
                    onClick={() => openAllWhatsApp(camp)}
                  >
                    <Phone className="h-4 w-4" /> WhatsApp All
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteCampaign(camp._id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
