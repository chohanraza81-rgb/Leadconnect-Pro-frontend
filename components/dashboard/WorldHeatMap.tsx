"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { useState } from "react";

const geoUrl = "/world-110m.json";

// Map country names (as stored in DB) to numeric IDs used by the TopoJSON
const countryToNumericId: Record<string, string> = {
  US: "840",
  UK: "826",
  GB: "826",
  CA: "124",
  AU: "036",
  DE: "276",
  SG: "702",
  SA: "682",
  AE: "784",
  PK: "586",
  IN: "356",
  TR: "792",
  MY: "458",
  NZ: "554",
  "NEW ZEALAND": "554",
  ZA: "710",
  "SOUTH AFRICA": "710",
  // Add more if needed
};

function getCountryCode(country: string) {
  const upper = country?.trim?.()?.toUpperCase?.() || "";
  return countryToNumericId[upper] || "";
}

export default function WorldHeatMap({ data }: { data: Record<string, number> }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Convert data to numeric ID map
  const numericData: Record<string, number> = {};
  Object.entries(data || {}).forEach(([country, count]) => {
    const id = getCountryCode(country);
    if (id) numericData[id] = (numericData[id] || 0) + count;
  });

  const values = Object.values(numericData).filter(v => v > 0);
  const maxVal = Math.max(...values, 1);
  const colorScale = scaleLinear<string>()
    .domain([0, maxVal])
    .range(["#1a1a2e", "#6366F1"]);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-[#6366F1]/30 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          🌍 Global Lead Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ position: "relative", width: "100%", maxWidth: 800, margin: "0 auto" }}>
          <ComposableMap
            projectionConfig={{ scale: 140 }}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const value = numericData[geo.id] || 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={value > 0 ? colorScale(value) : "#1a1a2e"}
                      stroke="#333"
                      strokeWidth={0.5}
                      onMouseEnter={(evt) => {
                        if (value > 0) {
                          setTooltip({
                            x: evt.clientX,
                            y: evt.clientY,
                            text: `${geo.properties?.name || "Country"}: ${value} leads`,
                          });
                        }
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
            <div
              style={{
                position: "fixed",
                top: tooltip.y + 10,
                left: tooltip.x + 10,
                background: "#111",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 13,
                border: "1px solid #333",
                pointerEvents: "none",
                zIndex: 9999,
              }}
            >
              {tooltip.text}
            </div>
          )}
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ background: "#1a1a2e" }} /> 0
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ background: "#6366F1" }} /> {maxVal}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
