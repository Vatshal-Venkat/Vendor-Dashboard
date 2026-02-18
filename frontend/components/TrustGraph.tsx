"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ForceGraphProps } from "react-force-graph-2d";
import api from "@/lib/api";

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d"),
  { ssr: false }
) as React.ComponentType<ForceGraphProps>;

type GraphNode = {
  id: string;
  label?: string;
};

type GraphLink = {
  source: string;
  target: string;
  type?: string;
};

export default function TrustGraph({ name }: { name: string }) {
  const [data, setData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await api.get(`/graph/${name}`);

        setData({
          nodes: res.data.nodes || [],
          links: res.data.links || [],
        });
      } catch (err) {
        console.error("Graph fetch error:", err);
        setData({ nodes: [], links: [] });
      }
    };

    if (name) {
      fetchGraph();
    }
  }, [name]);

  return (
    <div style={{ height: 500 }}>
      <ForceGraph2D
        graphData={data}
        nodeLabel="id"
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
      />
    </div>
  );
}
