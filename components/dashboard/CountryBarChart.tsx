"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Fallback data for 12 countries (all zeros)
const defaultData = [
  { country: "US", count: 0 }, { country: "UK", count: 0 },
  { country: "CA", count: 0 }, { country: "AU", count: 0 },
  { country: "DE", count: 0 }, { country: "SG", count: 0 },
  { country: "SA", count: 0 }, { country: "AE", count: 0 },
  { country: "PK", count: 0 }, { country: "IN", count: 0 },
  { country: "TR", count: 0 }, { country: "MY", count: 0 },
];

export default function CountryBarChart({ data }: { data: { country: string; count: number }[] }) {
  // Use provided data if it's an array and has items, otherwise fallback to default
  const chartData = Array.isArray(data) && data.length > 0 ? data : defaultData;
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-lg">📊 Leads by Country</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {maxCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <p className="text-gray-500 text-sm">No lead data yet. Run Lead Finder to populate.</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="country" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
              labelStyle={{ color: "#fff" }}
              formatter={(value: number) => [`${value} leads`, "Count"]}
            />
            <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
