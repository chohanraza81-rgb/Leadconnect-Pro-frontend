"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CountryBarChart({ data }: { data: { country: string; count: number }[] }) {
  const chartData = (data || []).filter(d => d.count > 0);
  if (chartData.length === 0) {
    return (
      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
        <CardHeader><CardTitle className="text-lg">📊 Leads by Country</CardTitle></CardHeader>
        <CardContent className="h-80 flex items-center justify-center"><p className="text-gray-500">No lead data yet.</p></CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
      <CardHeader><CardTitle className="text-lg">📊 Leads by Country</CardTitle></CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="country" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} labelStyle={{ color: "#fff" }} formatter={(value: number) => [`${value} leads`, "Count"]} />
            <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
