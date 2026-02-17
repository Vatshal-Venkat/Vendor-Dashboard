"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/suppliers";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace(redirect);
    }
  }, [user, router, redirect]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await login(username.trim(), password.trim());

      // redirect handled by useEffect after user updates
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Invalid credentials");
      } else if (err?.response?.status === 422) {
        setError("Invalid request format");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#070b12] text-white">
      <div className="w-96 space-y-6">
        <h1 className="text-2xl font-semibold">Login</h1>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <input
          value={username}
          className="w-full px-4 py-2 bg-[#111a2a] border border-zinc-700"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          value={password}
          type="password"
          className="w-full px-4 py-2 bg-[#111a2a] border border-zinc-700"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={submitting}
          onClick={handleLogin}
          className="w-full px-4 py-2 border border-white hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>

        <div className="text-sm text-[var(--text-muted)]">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-500 hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
