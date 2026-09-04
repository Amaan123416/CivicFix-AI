"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<{ token: string; user: { role: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, role: 'citizen' }),
      });

      localStorage.setItem('civicfix_token', response.token);
      localStorage.setItem('civicfix_role', response.user.role);

      router.push('/citizen');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell flex items-center justify-center">
      <div className="w-full max-w-lg card-surface p-7 sm:p-9">
        <div className="mb-8"><p className="eyebrow text-[#0c7c78]">CivicFix AI / get started</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-[#17232b]">Create your civic account</h1><p className="mt-2 text-sm leading-6 text-[#64727a]">Join the people helping their city move forward.</p></div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-black/10 bg-[#f4f1eb]/50 px-3 py-2.5 outline-none transition focus:border-[#0c7c78] focus:bg-[#0b1830]"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-xl border border-black/10 bg-[#f4f1eb]/50 px-3 py-2.5 outline-none transition focus:border-[#0c7c78] focus:bg-[#0b1830]"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Phone number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-xl border border-black/10 bg-[#f4f1eb]/50 px-3 py-2.5 outline-none transition focus:border-[#0c7c78] focus:bg-[#0b1830]"
              placeholder="+123456789"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-xl border border-black/10 bg-[#f4f1eb]/50 px-3 py-2.5 outline-none transition focus:border-[#0c7c78] focus:bg-[#0b1830]"
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#17232b] px-4 py-3 font-semibold text-white transition hover:bg-[#0c7c78] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-[#31d6d0] hover:text-sky-500">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
