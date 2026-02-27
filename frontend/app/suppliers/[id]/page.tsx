"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

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

    const { supplier, latest_assessment, graph_summary } = data;

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#070b12] text-white px-16 py-16 space-y-16">

                {/* HEADER */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-semibold">
                            {supplier.legal_entity_name}
                        </h1>
                        <p className="text-zinc-500 mt-2">
                            {supplier.registration_country} | {supplier.industry}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push(`/suppliers/${id}/history`)}
                        className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
                    >
                        View Assessment History
                    </button>
                </div>

                {/* LATEST ASSESSMENT */}
                <section className="bg-[#0c121c] border border-zinc-800 rounded-xl p-8 space-y-6">
                    <h2 className="text-2xl font-semibold">
                        Latest Assessment
                    </h2>

                    {latest_assessment ? (
                        <div className="grid md:grid-cols-3 gap-6">

                            <Metric label="Risk Score" value={latest_assessment.risk_score} />
                            <Metric label="Overall Status" value={latest_assessment.overall_status} />
                            <Metric label="Graph Nodes" value={graph_summary.node_count} />

                            <Metric label="Scoring Date"
                                value={new Date(latest_assessment.created_at).toLocaleString()}
                            />

                        </div>
                    ) : (
                        <div className="text-zinc-500">
                            No assessments available.
                        </div>
                    )}
                </section>

            </main>
        </ProtectedRoute>
    );
}

function Metric({ label, value }: { label: string; value: any }) {
    return (
        <div className="bg-[#101726] border border-zinc-800 rounded-lg p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
                {label}
            </div>
            <div className="text-lg font-semibold">
                {value}
            </div>
        </div>
    );
}