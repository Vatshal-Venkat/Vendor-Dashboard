"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

import AnimatedCounter from "@/components/ui/AnimatedCounter";
import GradientSurface from "@/components/ui/GradientSurface";
import DeltaIndicator from "@/components/ui/DeltaIndicator";
import ComparisonBar from "@/components/ui/ComparisonBar";
import HeatBar from "@/components/ui/HeatBar";

type Metrics = {
  risk_score: number;
  sanctions_count: number;
  section_rank: number;
  graph_exposure: number;
  news_signal: number;
};

type SupplierData = {
  id: number;
  name: string;
  metrics: Metrics;
  decision_score: number;
};

type CompareResponse = {
  supplier_a?: SupplierData;
  supplier_b?: SupplierData;
  comparison?: any;
  delta_breakdown?: any;
  error?: string;
};

export default function ComparisonPage() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids");

  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids) {
      setLoading(false);
      return;
    }

    const idArray = ids.split(",");

    if (idArray.length !== 2) {
      console.error("Exactly 2 supplier IDs required.");
      setLoading(false);
      return;
    }

    const [supplierA, supplierB] = idArray;

    setLoading(true);

    api
      .get(
        `/suppliers/compare?supplier_a=${supplierA}&supplier_b=${supplierB}`
      )
      .then((res) => {
        console.log("COMPARE RESPONSE:", res.data);
        setCompareData(res.data);
      })
      .catch((err) => {
        console.error("Comparison fetch failed:", err);
        setCompareData({ error: "Failed to load comparison." });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ids]);

  /* ===========================
     Loading
  ============================ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading comparison...
      </div>
    );
  }

  /* ===========================
     No IDs
  ============================ */
  if (!ids) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        No supplier IDs provided.
      </div>
    );
  }

  /* ===========================
     Backend Error
  ============================ */
  if (compareData?.error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {compareData.error}
      </div>
    );
  }

  if (!compareData?.supplier_a || !compareData?.supplier_b) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Invalid comparison data received.
      </div>
    );
  }

  const a = compareData.supplier_a;
  const b = compareData.supplier_b;

  const riskA = a.metrics?.risk_score ?? 0;
  const riskB = b.metrics?.risk_score ?? 0;

  const delta = riskB - riskA;
  const maxScore = Math.max(riskA, riskB, 100);

  return (
    <main className="min-h-screen px-10 py-16 space-y-14 text-white">
      <h1 className="text-4xl font-semibold">
        Supplier Comparison
      </h1>

      <div className="grid md:grid-cols-2 gap-10">

        {/* Supplier A */}
        <GradientSurface>
          <h2 className="text-xl mb-6">
            {a.name}
          </h2>

          <div className="text-4xl font-semibold">
            <AnimatedCounter value={riskA} />
          </div>

          <ComparisonBar value={riskA} max={maxScore} />

          <div className="mt-6">
            <HeatBar value={riskA} />
          </div>
        </GradientSurface>

        {/* Supplier B */}
        <GradientSurface>
          <h2 className="text-xl mb-6">
            {b.name}
          </h2>

          <div className="text-4xl font-semibold flex items-center gap-3">
            <AnimatedCounter value={riskB} />
            <DeltaIndicator value={delta} />
          </div>

          <ComparisonBar value={riskB} max={maxScore} />

          <div className="mt-6">
            <HeatBar value={riskB} />
          </div>
        </GradientSurface>

      </div>
    </main>
  );
}