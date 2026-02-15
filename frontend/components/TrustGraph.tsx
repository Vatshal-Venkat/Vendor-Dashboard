"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const ForceGraph2D = dynamic(
  () => import("react-force-graph").then(mod => mod.ForceGraph2D),
  { ssr: false }
);

export default function TrustGraph({ name }: { name: string }) {
  const [data, setData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    api.get(`/graph/${name}`).then(res => {
      setData({
        nodes: res.data.nodes,
        links: res.data.edges
      });
    });
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
