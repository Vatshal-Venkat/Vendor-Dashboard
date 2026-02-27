"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

type Assessment = {
  id: number;
  risk_score: number;
  overall_status: string;
  sanctions_flag: boolean;
  section889_status: string;
  news_signal_score: number;
  graph_risk_score: number;
  scoring_version: string;
  initiated_by_user_id: number;
  created_at: string;
};

type DeltaResponse = {
  risk_score_delta: number;
  sanctions_flag_delta: number;
  news_signal_delta: number;
  graph_risk_delta: number;
  section889_change: { from: string; to: string };
  version_change: { from: string; to: string };
};

export default function SupplierHistoryPage() {
  const { id } = useParams();
  const [history, setHistory] = useState<Assessment[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [delta, setDelta] = useState<DeltaResponse | null>(null);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/suppliers/${id}/history`)
      .then((res) => {
        const sorted = [...res.data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        setHistory(sorted);
      })
      .catch(console.error);
  }, [id]);

  const latestVersion = history[0]?.scoring_version;

  const toggleSelect = (assessmentId: number) => {
    setSelected((prev) =>
      prev.includes(assessmentId)
        ? prev.filter((i) => i !== assessmentId)
        : prev.length < 2
          ? [...prev, assessmentId]
          : prev
    );
  };

  const compareSelected = async () => {
    if (selected.length !== 2) return;

    const [a, b] = selected;

    const res = await api.post(
      `/suppliers/${id}/compare-assessments?assessment_a_id=${a}&assessment_b_id=${b}`
    );

    setDelta(res.data);
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#070b12] text-white px-20 py-16 max-w-5xl mx-auto space-y-14">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Assessment History
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Chronological audit of scoring activity.
          </p>
        </div>

        {/* TIMELINE */}
        <div className="relative border-l border-zinc-800 pl-6 space-y-10">

          {history.map((assessment, index) => {
            const isLatest = index === 0;
            const isSelected = selected.includes(assessment.id);
            const isNewVersion =
              assessment.scoring_version === latestVersion;

            return (
              <div key={assessment.id} className="relative">

                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full ${isLatest
                      ? "bg-indigo-500"
                      : "bg-zinc-600"
                    }`}
                />

                <div
                  onClick={() => toggleSelect(assessment.id)}
                  className={`cursor-pointer p-5 rounded-lg border transition ${isSelected
                      ? "border-indigo-500 bg-[#111827]"
                      : "border-zinc-800 bg-[#0c121c]"
                    }`}
                >

                  {/* Top Row */}
                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-3">
                      <span className="text-xl font-semibold">
                        {assessment.risk_score}
                      </span>

                      {isLatest && (
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-600 rounded-full">
                          LATEST
                        </span>
                      )}

                      {isNewVersion && (
                        <span className="text-[10px] px-2 py-0.5 bg-green-600 rounded-full">
                          NEW VERSION
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-500">
                      {new Date(assessment.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Compact Metric Row */}
                  <div className="mt-4 text-sm text-zinc-400 space-y-1">

                    <Row label="Status" value={assessment.overall_status} />
                    <Row label="Section 889" value={assessment.section889_status} />
                    <Row label="Sanctions" value={assessment.sanctions_flag ? "Yes" : "No"} />
                    <Row label="Graph Risk" value={assessment.graph_risk_score} />
                    <Row label="News Signal" value={assessment.news_signal_score} />
                    <Row label="Scoring Version" value={assessment.scoring_version} />

                  </div>

                  <div className="text-xs text-zinc-600 mt-3">
                    Initiated by User ID: {assessment.initiated_by_user_id}
                  </div>

                </div>
              </div>
            );
          })}

        </div>

        {selected.length === 2 && (
          <button
            onClick={compareSelected}
            className="px-5 py-2 text-sm bg-indigo-600 rounded-md hover:bg-indigo-500 transition"
          >
            Compare Selected Assessments
          </button>
        )}

        {/* DELTA PANEL */}
        {delta && (
          <div className="space-y-6 border-t border-zinc-800 pt-8">

            <h2 className="text-xl font-semibold">
              Assessment Comparison
            </h2>

            <div className="space-y-4 text-sm">

              <DeltaRow label="Risk Score" value={delta.risk_score_delta} />
              <DeltaRow label="Sanctions Flag" value={delta.sanctions_flag_delta} />
              <DeltaRow label="News Signal" value={delta.news_signal_delta} />
              <DeltaRow label="Graph Risk" value={delta.graph_risk_delta} />

              <SimpleDelta
                label="Section 889"
                from={delta.section889_change.from}
                to={delta.section889_change.to}
              />

              <SimpleDelta
                label="Scoring Version"
                from={delta.version_change.from}
                to={delta.version_change.to}
              />

            </div>
          </div>
        )}

      </main>
    </ProtectedRoute>
  );
}

/* ---------- Compact Components ---------- */

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

function DeltaRow({ label, value }: { label: string; value: number }) {
  const positive = value > 0;
  const negative = value < 0;

  return (
    <div className="flex justify-between items-center">
      <span className="text-zinc-500">{label}</span>
      <span
        className={`font-medium ${positive
            ? "text-red-400"
            : negative
              ? "text-green-400"
              : "text-white"
          }`}
      >
        {value > 0 ? `+${value}` : value}
      </span>
    </div>
  );
}

function SimpleDelta({
  label,
  from,
  to,
}: {
  label: string;
  from: string;
  to: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="text-white">
        {from} → {to}
      </span>
    </div>
  );
}