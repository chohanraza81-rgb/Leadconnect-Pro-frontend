"use client";
import { useEffect, useState } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import CountryBarChart from "@/components/dashboard/CountryBarChart";
import PerformanceAreaChart from "@/components/dashboard/PerformanceAreaChart";
import WorldHeatMap from "@/components/dashboard/WorldHeatMap";
import QuickActions from "@/components/dashboard/QuickActions";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import LeadQualityBar from "@/components/dashboard/LeadQualityBar";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ExportMenu from "@/components/ui/export-menu";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const [stats, setStats] = useState({ totalLeads: 0, emailsFound: 0, whatsappClicks: 0, campaignsSent: 0 });
  const [countryData, setCountryData] = useState([]);
  const [perfData, setPerfData] = useState({ whatsapp: [], emails: [] });
  const [geoData, setGeoData] = useState({});
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, countryRes, perfRes, geoRes, leadsRes] = await Promise.all([
        fetch(`${API}/dashboard/stats`).then(r => r.json()),
        fetch(`${API}/dashboard/country-stats`).then(r => r.json()),
        fetch(`${API}/dashboard/performance`).then(r => r.json()),
        fetch(`${API}/dashboard/geo-data`).then(r => r.json()),
        fetch(`${API}/leads`).then(r => r.json()),
      ]);
      setStats(statsRes || { totalLeads: 0, emailsFound: 0, whatsappClicks: 0, campaignsSent: 0 });
      setCountryData(Array.isArray(countryRes) ? countryRes : []);
      setPerfData(perfRes || { whatsapp: [], emails: [] });
      setGeoData(geoRes || {});
      setLeads(Array.isArray(leadsRes) ? leadsRes : []);
    } catch (e) {
      console.error("Dashboard load error:", e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 bg-white/5 rounded-xl" />)}
        </div>
        <Skeleton className="h-20 bg-white/5 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 bg-white/5 rounded-xl" />
          <Skeleton className="h-80 bg-white/5 rounded-xl" />
        </div>
        <Skeleton className="h-96 bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
          📊 Dashboard
        </h1>
        <StatusIndicator />
      </div>

      <StatsCards data={stats} />
      <LeadQualityBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountryBarChart data={countryData} />
        <PerformanceAreaChart data={perfData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-gray-400">📤 Export All Leads</p>
          <ExportMenu data={leads} filename="all-leads" />
          <p className="text-xs text-gray-500">{leads.length} leads available</p>
        </div>
      </div>

      <WorldHeatMap data={geoData} />
      <QuickActions />
    </motion.div>
  );
}
