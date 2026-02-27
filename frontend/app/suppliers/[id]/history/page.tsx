"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import TrustGraph from "@/components/TrustGraph";

export default function SupplierProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    api.get(`/suppliers/${id}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!data) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center text-white bg-[#070b12]">
          Loading...
        </div>
      </ProtectedRoute>
    );
  }

  const { supplier, latest_assessment, history, linked_entities, sanctioned_entities, graph_summary } = data;

  return (
    <ProtectedRoute>
      <main className="min-h-screen px-16 py-20 bg-[#070b12] text-white">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold">
            {supplier.legal_entity_name}
          </h1>
          <p className="text-zinc-400 mt-2">
            {supplier.registration_country || "Unknown Country"} | {supplier.industry || "Unknown Industry"}
          </p>
          <div className="mt-6 flex gap-8">
            <div>
              <div className="text-sm text-zinc-500">Risk Score</div>
              <div className="text-3xl font-semibold">
                {latest_assessment.risk_score ?? "N/A"}
              </div>
            </div>

            <div>
              <div className="text-sm text-zinc-500">Status</div>
              <div className="text-xl">
                {latest_assessment.overall_status ?? "Not Assessed"}
              </div>
            </div>

            <div>
              <div className="text-sm text-zinc-500">Graph Nodes</div>
              <div className="text-xl">
                {graph_summary.node_count}
              </div>
            </div>
          </div>
        </div>

        {/* Sanctions */}
        <section className="mb-16">
          <h2 className="text-2xl mb-6">Sanctions Exposure</h2>

          {sanctioned_entities.length === 0 ? (
            <div className="text-green-400">No sanctions exposure detected.</div>
          ) : (
            <ul className="space-y-2 text-red-400">
              {sanctioned_entities.map((name: string, index: number) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Linked Entities */}
        <section className="mb-16">
          <h2 className="text-2xl mb-6">Resolved Entities</h2>

          <div className="space-y-4">
            {linked_entities.map((entity: any, index: number) => (
              <div key={index} className="border border-zinc-800 p-4">
                <div className="font-semibold">{entity.canonical_name}</div>
                <div className="text-sm text-zinc-400">
                  {entity.entity_type} | Confidence: {entity.confidence_score}
                </div>
                {entity.sanctions.length > 0 && (
                  <div className="text-red-400 mt-2">
                    Sanctioned via: {entity.sanctions.map((s: any) => s.source).join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Trust Graph */}
        <section className="mb-16">
          <h2 className="text-2xl mb-6">Relationship Graph</h2>
          <TrustGraph name={supplier.name} />
        </section>

        {/* Assessment History */}
        <section>
          <h2 className="text-2xl mb-6">Assessment History</h2>

          <div className="space-y-4">
            {history.map((entry: any) => (
              <div key={entry.id} className="border border-zinc-800 p-4">
                <div>Score: {entry.risk_score}</div>
                <div>Status: {entry.overall_status}</div>
                <div className="text-sm text-zinc-500">
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </ProtectedRoute>
  );
}
