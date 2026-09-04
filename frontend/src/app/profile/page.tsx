"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type User = { name: string; email: string; phone?: string; role: string };

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("civicfix_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    apiFetch<{ user: User }>("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ user: currentUser }) => {
        setForm({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone || "" });
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const getToken = () => localStorage.getItem("civicfix_token");

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const token = getToken();
    if (!token) return router.replace("/login");

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await apiFetch<{ user: User }>("/auth/me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      setForm({ name: response.user.name, email: response.user.email, phone: response.user.phone || "" });
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    const token = getToken();
    if (!token || !password) {
      setError("Enter your current password to delete the account.");
      return;
    }
    if (!window.confirm("Delete your account and all submitted complaints? This cannot be undone.")) return;

    setDeleting(true);
    setError("");
    try {
      await apiFetch("/auth/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      });
      localStorage.removeItem("civicfix_token");
      localStorage.removeItem("civicfix_role");
      router.replace("/");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete account");
      setDeleting(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-[#071120] p-6 text-center text-slate-300">Loading profile...</main>;

  return (
    <main className="min-h-screen bg-[#071120] p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="rounded-3xl bg-slate-900 p-6 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Account</p>
          <h1 className="mt-2 text-3xl font-bold">Your profile</h1>
          <p className="mt-2 text-sm text-slate-300">Keep your contact details up to date.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-[#0b1830] p-6 shadow-sm">
          <form onSubmit={saveProfile} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Full name</label>
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-white/10 px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-white/10 px-3 py-2.5" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Phone number</label>
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full rounded-xl border border-white/10 px-3 py-2.5" />
            </div>
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-[#31d6d0] px-4 py-2.5 font-medium text-white disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
              <button type="button" onClick={() => router.back()} className="rounded-xl border border-white/10 px-4 py-2.5 font-medium text-slate-300">Back</button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">Delete account</h2>
          <p className="mt-2 text-sm text-red-800">This permanently deletes your profile and all complaints you submitted.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Current password" className="rounded-xl border border-red-200 bg-[#0b1830] px-3 py-2.5" />
            <button type="button" onClick={deleteAccount} disabled={deleting} className="rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white disabled:opacity-60">{deleting ? "Deleting..." : "Delete my account"}</button>
          </div>
        </section>
      </div>
    </main>
  );
}
