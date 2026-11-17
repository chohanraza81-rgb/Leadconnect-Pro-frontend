"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const countryNameMap: Record<string, string> = {
  US: "USA", UK: "UK", GB: "UK", CA: "Canada", AU: "Australia",
  DE: "Germany", SG: "Singapore", SA: "Saudi Arabia", AE: "UAE",
  PK: "Pakistan", IN: "India", TR: "Turkey", MY: "Malaysia",
  NZ: "New Zealand", ZA: "South Africa",
};

function getDisplayName(country: string) {
  const upper = country?.trim()?.toUpperCase() || "";
  return countryNameMap[upper] || upper;
}

export default function CountryBarChart({ data }: { data: { country: string; count: number }[] }) {
  // ✅ Deduplicate: UK + GB dono ko merge karke ek bar banao
  const merged = new Map<string, number>();
  (data || [])
    .filter((d) => d.count > 0)
    .forEach((d) => {
      const name = getDisplayName(d.country);
      merged.set(name, (merged.get(name) || 0) + d.count);
    });

  const chartData = Array.from(merged.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 font-semibold">
          📊 Leads by Country
        </CardTitle>
        <p className="text-xs text-muted-foreground">Top 10 regions by lead volume</p>
      </CardHeader>
      <CardContent className="h-80 pt-4">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No lead data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="country"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                interval={0}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                allowDecimals={false}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  color: "hsl(var(--card-foreground))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                itemStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(value: number) => [`${value} leads`, "Count"]}
              />
              <Bar
                dataKey="count"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
