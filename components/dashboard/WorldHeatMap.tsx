"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { useState } from "react";

const geoUrl = "/world-110m.json";

const numericIdToCode: Record<string, string> = {
  "840": "US", "826": "UK", "124": "CA", "036": "AU",
  "276": "DE", "702": "SG", "682": "SA", "784": "AE",
  "586": "PK", "356": "IN", "792": "TR", "458": "MY",
};

export default function WorldHeatMap({ data }: { data: Record<string, number> }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const values = Object.values(data || {}).filter(v => v > 0);
  const maxVal = Math.max(...values, 1);
  const colorScale = scaleLinear<string>().domain([0, maxVal]).range(["#1a1a2e", "#6366F1"]);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
      <CardHeader><CardTitle className="text-lg">🌍 Global Lead Distribution</CardTitle></CardHeader>
      <CardContent>
        <div style={{ position: "relative", width: "100%", maxWidth: 800, margin: "0 auto" }}>
          <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: "100%", height: "auto" }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const countryCode = numericIdToCode[geo.id];
                  const value = countryCode ? (data[countryCode] || 0) : 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={value > 0 ? colorScale(value) : "#1a1a2e"}
                      stroke="#333"
                      strokeWidth={0.5}
                      onMouseEnter={(evt) => {
                        if (countryCode) setTooltip({ x: evt.clientX, y: evt.clientY, text: `${countryCode}: ${value} leads` });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: { outline: "none", transition: "fill 0.3s" },
                        hover: { fill: "#818cf8", outline: "none", cursor: "pointer" },
                        pressed: { fill: "#6366F1", outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          {tooltip && (
            <div style={{
              position: "fixed", top: tooltip.y + 10, left: tooltip.x + 10,
              background: "#111", color: "#fff", padding: "6px 12px", borderRadius: 8,
              fontSize: 13, border: "1px solid #333", pointerEvents: "none", zIndex: 9999,
            }}>{tooltip.text}</div>
          )}
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "#1a1a2e" }} /> 0</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "#6366F1" }} /> {maxVal}</span>
        </div>
      </CardContent>
    </Card>
  );
}
