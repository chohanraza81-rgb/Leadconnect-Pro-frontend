import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useState } from "react";

const geoUrl = "/world-110m.json"; // download from https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json

const countryCodeMap: Record<string, string> = {
  US: "USA", UK: "GBR", CA: "CAN", AU: "AUS", DE: "DEU", SG: "SGP",
  SA: "SAU", AE: "ARE", PK: "PAK", IN: "IND", TR: "TUR", MY: "MYS",
};

export default function WorldHeatMap({ data }: { data: Record<string, number> }) {
  const [tooltipContent, setTooltipContent] = useState("");
  const maxVal = Math.max(...Object.values(data), 1);
  const colorScale = scaleLinear<string>()
    .domain([0, maxVal])
    .range(["#1a1a2e", "#6366F1"]);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-lg">Global Lead Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div data-tooltip-id="map-tooltip" className="w-full">
          <ComposableMap projectionConfig={{ scale: 147 }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const countryName = geo.properties.ISO_A3;
                  const code = Object.keys(countryCodeMap).find(
                    k => countryCodeMap[k] === countryName
                  );
                  const value = code ? data[code] || 0 : 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={value ? colorScale(value) : "#2a2a3e"}
                      stroke="#444"
                      onMouseEnter={() => {
                        if (code) setTooltipContent(`${code}: ${value} leads`);
                      }}
                      onMouseLeave={() => setTooltipContent("")}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#818cf8", outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
        <ReactTooltip id="map-tooltip" content={tooltipContent} />
      </CardContent>
    </Card>
  );
}
