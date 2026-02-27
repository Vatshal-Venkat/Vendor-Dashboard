"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { ForceGraphProps } from "react-force-graph-2d";
import api from "@/lib/api";

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d"),
  { ssr: false }
) as React.ComponentType<ForceGraphProps>;

type GraphNode = {
  id: string;
  type?: string;
  tier?: number;
  risk_score?: number;
  risk_level?: "GREEN" | "YELLOW" | "RED";
  sanctioned?: boolean;
};

type GraphLink = {
  source: string | any;
  target: string | any;
  type?: string;
};

type GraphResponse = {
  nodes: GraphNode[];
  links: GraphLink[];
  sanction_paths?: string[][];
};

export default function TrustGraph({ name }: { name: string }) {
  const [data, setData] = useState<GraphResponse>({
    nodes: [],
    links: [],
    sanction_paths: [],
  });

  const [riskFilter, setRiskFilter] = useState<
    "" | "GREEN" | "YELLOW" | "RED"
  >("");

  // -----------------------------------------
  // Fetch Graph
  // -----------------------------------------
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await api.get(`/graph/${name}`);
        setData({
          nodes: res.data.nodes || [],
          links: res.data.links || [],
          sanction_paths: res.data.sanction_paths || [],
        });
      } catch (err) {
        console.error("Graph fetch error:", err);
        setData({ nodes: [], links: [], sanction_paths: [] });
      }
    };

    if (name) {
      fetchGraph();
    }
  }, [name]);

  // -----------------------------------------
  // Risk Filtering
  // -----------------------------------------
  const filteredGraph = useMemo(() => {
    if (!riskFilter) return data;

    const filteredNodes = data.nodes.filter(
      (node) => node.risk_level === riskFilter || node.tier === 0
    );

    const allowedIds = new Set(filteredNodes.map((n) => n.id));

    const filteredLinks = data.links.filter((link: any) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      return allowedIds.has(sourceId) && allowedIds.has(targetId);
    });

    return {
      ...data,
      nodes: filteredNodes,
      links: filteredLinks,
    };
  }, [data, riskFilter]);

  // -----------------------------------------
  // Sanction Path Highlight Check
  // -----------------------------------------
  const isSanctionLink = (link: any) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;

    return data.sanction_paths?.some((path) => {
      for (let i = 0; i < path.length - 1; i++) {
        if (path[i] === sourceId && path[i + 1] === targetId) {
          return true;
        }
      }
      return false;
    });
  };

  return (
    <div>
      {/* ---------------- RISK FILTER ---------------- */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8, fontWeight: 500 }}>
          Filter by Risk:
        </label>
        <select
          value={riskFilter}
          onChange={(e) =>
            setRiskFilter(e.target.value as "" | "GREEN" | "YELLOW" | "RED")
          }
        >
          <option value="">All</option>
          <option value="GREEN">Green</option>
          <option value="YELLOW">Yellow</option>
          <option value="RED">Red</option>
        </select>
      </div>

      {/* ---------------- GRAPH ---------------- */}
      <div style={{ height: 550 }}>
        <ForceGraph2D
          graphData={filteredGraph}
          nodeLabel={(node: any) =>
            `${node.id}
Tier: ${node.tier ?? "-"}
Risk Score: ${node.risk_score ?? 0}
Risk Level: ${node.risk_level ?? "N/A"}
Sanctioned: ${node.sanctioned ? "Yes" : "No"}`
          }
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const colorMap: any = {
              GREEN: "#22c55e",
              YELLOW: "#facc15",
              RED: "#ef4444",
            };

            const size = node.tier === 0 ? 10 : 6;

            ctx.beginPath();
            ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI);
            ctx.fillStyle = colorMap[node.risk_level] || "#9ca3af";
            ctx.fill();
          }}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkColor={(link: any) =>
            isSanctionLink(link) ? "#dc2626" : "#9ca3af"
          }
        />
      </div>
    </div>
  );
}