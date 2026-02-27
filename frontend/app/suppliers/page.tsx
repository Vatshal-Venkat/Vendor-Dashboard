"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

type Supplier = {
  id: number;
  name: string;
  country: string;
  industry: string;
  latest_status?: "PASS" | "CONDITIONAL" | "FAIL" | null;
  risk_score?: number | null;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "country" | "industry">("name");
  const [sortAsc, setSortAsc] = useState(true);

  const router = useRouter();

  useEffect(() => {
    api
      .get("/suppliers/with-status")
      .then(res => setSuppliers(res.data));
  }, []);

  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filtered = useMemo(() => {
    return suppliers
      .filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const valA = a[sortKey]?.toLowerCase() || "";
        const valB = b[sortKey]?.toLowerCase() || "";
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [suppliers, search, sortKey, sortAsc]);

  const goToComparison = () => {
    router.push(`/comparison?ids=${selected.join(",")}`);
  };

  return (
    <main className="min-h-screen px-16 py-24 bg-[#070b12] text-white">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header Section with Button */}
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">
              Suppliers
            </h1>
            <p className="text-gray-500 text-sm">
              Risk monitoring and assessment control panel.
            </p>
          </div>

          <button
            onClick={() => router.push("/suppliers/new")}
            className="px-6 py-3 rounded-xl border border-zinc-700 hover:border-white transition"
          >
            Register New Supplier
          </button>
        </div>

        <div className="border border-zinc-800 bg-[#0c121c] rounded-lg px-6 py-4">
          <input
            placeholder="Search suppliers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full text-gray-300 placeholder-gray-600"
          />
        </div>

        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-[#0b111b]">

          <div className="grid grid-cols-12 px-8 py-4 text-xs uppercase tracking-widest text-gray-600 border-b border-zinc-800 bg-[#0a0f18]">
            <div className="col-span-4 cursor-pointer" onClick={() => handleSort("name")}>
              Name
            </div>
            <div className="col-span-3 cursor-pointer" onClick={() => handleSort("country")}>
              Country
            </div>
            <div className="col-span-3 cursor-pointer" onClick={() => handleSort("industry")}>
              Industry
            </div>
            <div className="col-span-2 text-right">
              Action
            </div>
          </div>

          {filtered.map((supplier) => {
            const isSelected = selected.includes(supplier.id);

            return (
              <div
                key={supplier.id}
                className={`grid grid-cols-12 items-center px-8 py-6 border-b border-zinc-800 last:border-none transition-all duration-200 group ${
                  isSelected ? "bg-[#111a2a]" : "hover:bg-[#101726]"
                }`}
              >
                <div className="col-span-4 flex items-center gap-4">
                  <div
                    onClick={() => toggleSelect(supplier.id)}
                    className={`w-4 h-4 border rounded-sm cursor-pointer transition ${
                      isSelected
                        ? "bg-white border-white"
                        : "border-zinc-600 group-hover:border-zinc-400"
                    }`}
                  />

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {supplier.name}
                    </span>

                    {supplier.latest_status && (
                      <span
                        className={`text-[10px] tracking-widest px-2 py-0.5 border rounded ${
                          supplier.latest_status === "PASS"
                            ? "border-green-500 text-green-400"
                            : supplier.latest_status === "CONDITIONAL"
                            ? "border-yellow-500 text-yellow-400"
                            : "border-red-500 text-red-400"
                        }`}
                      >
                        {supplier.latest_status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-3 text-gray-500 text-sm">
                  {supplier.country}
                </div>

                <div className="col-span-3 text-gray-500 text-sm">
                  {supplier.industry}
                </div>

                <div className="col-span-2 text-right">
                  <button
                    onClick={() => router.push(`/suppliers/${supplier.id}`)}
                    className="px-4 py-1.5 text-xs tracking-wide border border-zinc-700 hover:border-white transition mr-2"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => router.push(`/assessment/${supplier.id}`)}
                    className="px-4 py-1.5 text-xs tracking-wide border border-zinc-700 hover:border-white transition"
                  >
                    Assess
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {selected.length > 1 && (
          <div className="flex justify-end">
            <button
              onClick={goToComparison}
              className="px-6 py-2 text-sm tracking-wide border border-white hover:bg-white hover:text-black transition"
            >
              Compare {selected.length}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
