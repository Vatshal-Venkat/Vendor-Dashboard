"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HistoryPage() {
  const { id } = useParams();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/suppliers/${id}/history`)
      .then(res => setHistory(res.data));
  }, [id]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen px-16 py-24 bg-[#070b12] text-white">
        <h1 className="text-3xl mb-10">Assessment History</h1>

        <div className="space-y-6">
          {history.map(entry => (
            <div
              key={entry.id}
              className="border border-zinc-800 p-6"
            >
              <div>Score: {entry.risk_score}</div>
              <div>Status: {entry.overall_status}</div>
              <div>{entry.created_at}</div>
            </div>
          ))}
        </div>
      </main>
    </ProtectedRoute>
  );
}
