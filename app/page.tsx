"use client";
import { useEffect, useState } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import CountryBarChart from "@/components/dashboard/CountryBarChart";
import PerformanceAreaChart from "@/components/dashboard/PerformanceAreaChart";
import WorldHeatMap from "@/components/dashboard/WorldHeatMap";
import QuickActions from "@/components/dashboard/QuickActions";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [countryData, setCountryData] = useState([]);
  const [perfData, setPerfData] = useState({ whatsapp: [], emails: [] });
  const [geoData, setGeoData] = useState({});

  useEffect(() => {
    fetch(`${API}/dashboard/stats`).then(r => r.json()).then(setStats);
    fetch(`${API}/dashboard/country-stats`).then(r => r.json()).then(setCountryData);
    fetch(`${API}/dashboard/performance`).then(r => r.json()).then(setPerfData);
    fetch(`${API}/dashboard/geo-data`).then(r => r.json()).then(setGeoData);
  }, []);

  if (!stats) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-purple-400 bg-clip-text text-transparent">
        Dashboard
      </h1>
      <StatsCards data={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountryBarChart data={countryData} />
        <PerformanceAreaChart data={perfData} />
      </div>
      <WorldHeatMap data={geoData} />
      <QuickActions />
    </motion.div>
  );
  }
