"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import TrustGraph from "@/components/TrustGraph";

export default function SupplierProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (!id) return;

        api
            .get(`/suppliers/${id}`)
            .then((res) => setData(res.data))
            .catch(console.error);
    }, [id]);

    if (!data) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-[#070b12] text-white">
                    Loading supplier profile...
                </div>
            </ProtectedRoute>
        );
    }

    const {
        supplier,
        latest_assessment,
        linked_entities,
        sanctioned_entities,
        graph_summary,
    } = data;

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#070b12] text-white px-20 py-16 max-w-6xl mx-auto space-y-16">

                {/* HEADER */}
                <div className="flex justify-between items-start">

                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            {supplier.legal_entity_name}
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            {supplier.registration_country} • {supplier.industry}
                        </p>
                    </div>

                    {/* WHITE BUTTON */}
                    <button
                        onClick={() => router.push(`/suppliers/${id}/history`)}
                        className="px-5 py-2 text-sm border border-white text-white rounded-md hover:bg-white hover:text-black transition"
                    >
                        Assessment History
                    </button>

                </div>

                {/* LATEST ASSESSMENT */}
                <section className="border border-zinc-800 rounded-lg p-6 bg-[#0c121c] space-y-6">

                    <h2 className="text-lg font-semibold">
                        Latest Assessment Summary
                    </h2>

                    {latest_assessment ? (
                        <div className="space-y-3 text-sm">

                            <Row label="Risk Score" value={latest_assessment.risk_score} />
                            <Row label="Overall Status" value={latest_assessment.overall_status} />
                            <Row
                                label="Last Assessed"
                                value={new Date(latest_assessment.created_at).toLocaleString()}
                            />
                            <Row
                                label="Graph Nodes"
                                value={graph_summary?.node_count ?? 0}
                            />

                        </div>
                    ) : (
                        <div className="text-zinc-500 text-sm">
                            No assessments available.
                        </div>
                    )}
                </section>

                {/* SANCTIONS EXPOSURE */}
                <section className="border border-zinc-800 rounded-lg p-6 bg-[#0c121c] space-y-4">

                    <h2 className="text-lg font-semibold">
                        Sanctions Exposure
                    </h2>

                    {sanctioned_entities?.length === 0 ? (
                        <div className="text-green-400 text-sm">
                            No sanctions exposure detected.
                        </div>
                    ) : (
                        <ul className="space-y-1 text-red-400 text-sm">
                            {sanctioned_entities?.map((name: string, index: number) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* LINKED ENTITIES */}
                <section className="border border-zinc-800 rounded-lg p-6 bg-[#0c121c] space-y-6">

                    <h2 className="text-lg font-semibold">
                        Resolved Entities
                    </h2>

                    {linked_entities?.map((entity: any, index: number) => (
                        <div key={index} className="border border-zinc-800 rounded-md p-4">

                            <div className="font-medium">
                                {entity.canonical_name}
                            </div>

                            <div className="text-xs text-zinc-400 mt-1">
                                {entity.entity_type} • Confidence: {entity.confidence_score}
                            </div>

                            {entity.sanctions?.length > 0 && (
                                <div className="text-red-400 text-xs mt-2">
                                    Sanctioned via:{" "}
                                    {entity.sanctions.map((s: any) => s.source).join(", ")}
                                </div>
                            )}

                        </div>
                    ))}

                </section>

                {/* TRUST GRAPH */}
                <section className="border border-zinc-800 rounded-lg p-6 bg-[#0c121c] space-y-6">

                    <h2 className="text-lg font-semibold">
                        Relationship Graph
                    </h2>

                    <TrustGraph name={supplier.legal_entity_name} />

                </section>

            </main>
        </ProtectedRoute>
    );
}

/* Compact Row */

function Row({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{label}</span>
            <span className="text-white font-medium">{value}</span>
        </div>
    );
}