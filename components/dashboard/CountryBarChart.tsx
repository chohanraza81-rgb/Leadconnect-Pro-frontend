"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Short, clear country names
const countryNameMap: Record<string, string> = {
  US: "USA",
  UK: "UK",
  GB: "UK",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  SG: "Singapore",
  SA: "Saudi Arabia",
  AE: "UAE",
  PK: "Pakistan",
  IN: "India",
  TR: "Turkey",
  MY: "Malaysia",
  NZ: "New Zealand",
  ZA: "South Africa",
};

function getDisplayName(country: string) {
  const upper = country?.trim()?.toUpperCase() || "";
  return countryNameMap[upper] || upper;
}

export default function CountryBarChart({ data }: { data: { country: string; count: number }[] }) {
  const chartData = (data || [])
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(d => ({
      country: getDisplayName(d.country),
      count: d.count,
    }));

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-[#6366F1]/30 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          📊 Leads by Country
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>No lead data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="country"
                stroke="#888"
                tick={{ fill: '#ccc', fontSize: 12 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis stroke="#888" tick={{ fill: '#ccc', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(99,102,241,0.1)' }}
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: 8,
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value} leads`, 'Count']}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
