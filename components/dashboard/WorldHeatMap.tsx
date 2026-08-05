"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { scaleLinear } from "d3-scale"
import { useState } from "react"

const geoUrl = "/world-110m.json"

const countryCodeMap: Record<string, string> = {
  US: "USA", UK: "GBR", CA: "CAN", AU: "AUS", DE: "DEU", SG: "SGP",
  SA: "SAU", AE: "ARE", PK: "PAK", IN: "IND", TR: "TUR", MY: "MYS",
}

export default function WorldHeatMap({ data }: { data: Record<string, number> }) {
  const [tooltip, setTooltip] = useState("")
  const maxVal = Math.max(...Object.values(data || {}), 1)
  const colorScale = scaleLinear<string>().domain([0, maxVal]).range(["#1a1a2e", "#6366F1"])

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-lg">🌍 Global Lead Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ position: "relative" }}>
          <ComposableMap
            projectionConfig={{ scale: 140 }}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const iso = geo.properties.ISO_A3 || geo.properties.ISO_A2
                  const code = Object.keys(countryCodeMap).find(k => countryCodeMap[k] === iso)
                  const value = code ? (data[code] || 0) : 0
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={value > 0 ? colorScale(value) : "#1a1a2e"}
                      stroke="#333"
                      strokeWidth={0.5}
                      onMouseEnter={() => {
                        if (code) setTooltip(`${code}: ${value} leads`)
                      }}
                      onMouseLeave={() => setTooltip("")}
                      style={{
                        default: { outline: "none", transition: "all 0.2s" },
                        hover: { fill: "#818cf8", outline: "none", cursor: "pointer" },
                        pressed: { fill: "#6366F1", outline: "none" },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>
          {tooltip && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "#111",
                color: "white",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 13,
                border: "1px solid #333",
                zIndex: 10,
              }}
            >
              {tooltip}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
