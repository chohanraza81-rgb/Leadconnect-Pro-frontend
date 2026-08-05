"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadSelectionTable from "@/components/outreach/LeadSelectionTable";
import CampaignManager from "@/components/outreach/CampaignManager";
import { motion } from "framer-motion";

export default function OutreachPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
        📬 Outreach Center
      </h1>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-xl inline-flex gap-1">
          <TabsTrigger value="leads" className="data-[state=active]:bg-[#6366F1] rounded-lg px-5 py-2 transition-all">
            Select Leads
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-[#6366F1] rounded-lg px-5 py-2 transition-all">
            Campaigns / WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-6">
          <LeadSelectionTable />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignManager />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
