"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function ConfigPage() {
  return (
    <ProtectedRoute requireAdmin>
      <main className="min-h-screen px-16 py-24 bg-[#070b12] text-white">
        <h1 className="text-3xl mb-10">Risk Scoring Configuration</h1>

        <div className="border border-zinc-800 p-8 space-y-6">
          <div>
            <label>Sanctions Weight</label>
            <input className="block mt-2 px-4 py-2 bg-[#111a2a] border border-zinc-700" />
          </div>

          <div>
            <label>Section 889 Weight</label>
            <input className="block mt-2 px-4 py-2 bg-[#111a2a] border border-zinc-700" />
          </div>

          <button className="px-6 py-2 border border-white hover:bg-white hover:text-black transition">
            Save Configuration
          </button>
        </div>
      </main>
    </ProtectedRoute>
  );
}
