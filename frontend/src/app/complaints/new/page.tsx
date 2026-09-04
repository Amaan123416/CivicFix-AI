"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const categories = [
  'Road Damage',
  'Waste Management',
  'Streetlight',
  'Water/Sewerage',
  'Traffic',
  'Public Infrastructure',
  'Other',
];

const priorities = ['Low', 'Medium', 'High', 'Critical'];

const getRecommendation = (text: string) => {
  if (text.includes('pothole') || text.includes('road')) return 'Public works inspection';
  if (text.includes('garbage') || text.includes('waste') || text.includes('trash')) return 'Sanitation collection';
  if (text.includes('light') || text.includes('lamp') || text.includes('dark')) return 'Electrical maintenance';
  if (text.includes('water') || text.includes('leak') || text.includes('sewer')) return 'Water services inspection';
  return 'Municipal review and assignment';
};

export default function NewComplaintPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Road Damage',
    priority: 'Medium',
    location: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const analysisText = `${form.title} ${form.description}`.toLowerCase();
  const analysisRecommendation = getRecommendation(analysisText);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('civicfix_token');

      if (!token) {
        setError('Your session has expired. Please log in again before submitting a complaint.');
        setLoading(false);
        router.push('/login');
        return;
      }

      const response = await apiFetch<{ complaint: { _id: string } }>('/complaints', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      sessionStorage.setItem('civicfix_latest_complaint_id', response.complaint._id);
      window.dispatchEvent(new CustomEvent('civicfix:complaint-created', {
        detail: { complaintId: response.complaint._id },
      }));

      router.push('/citizen');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit complaint';
      setError(message === 'Authentication token missing' || message === 'Invalid or expired token'
        ? 'Your session has expired. Please log in again before submitting a complaint.'
        : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4"><div><p className="eyebrow text-[#0c7c78]">Citizen portal / new report</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-[#17232b] sm:text-4xl">Report a civic issue</h1><p className="mt-2 text-sm text-[#64727a]">Give your city team the signal they need to act.</p></div><span className="hidden rounded-full bg-[#d8efea] px-3 py-1.5 text-xs font-semibold text-[#0c7c78] sm:inline-flex">4 steps</span></div>
        <div className="card-surface p-5 sm:p-8">
        <div className="mb-8 grid grid-cols-4 gap-2 border-b border-black/5 pb-6">{['Issue details', 'Location', 'Evidence', 'Review'].map((step, index) => <div key={step} className="relative"><div className={`mb-2 h-1 rounded-full ${index === 0 ? 'bg-[#0c7c78]' : 'bg-[#e7e4dd]'}`} /><p className={`text-[0.65rem] font-semibold uppercase tracking-wide ${index === 0 ? 'text-[#0c7c78]' : 'text-[#9aa2a4]'}`}>{step}</p></div>)}</div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]"
              placeholder="Large pothole near main road"
              required
            />
          </div>

          <section className="rounded-2xl bg-[#17232b] p-5 text-white sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div><p className="eyebrow text-[#8ed5cb]">Live triage preview</p><h2 className="mt-2 text-lg font-bold">AI-ready analysis</h2></div>
              <span className="rounded-full bg-[#0b1830]/10 px-3 py-1 text-xs text-[#b9e6df]">Updates as you type</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#0b1830]/10 p-3"><p className="text-xs text-slate-300">Category</p><p className="mt-1 text-sm font-semibold">{form.category}</p></div>
              <div className="rounded-xl bg-[#0b1830]/10 p-3"><p className="text-xs text-slate-300">Priority</p><p className="mt-1 text-sm font-semibold">{form.priority}</p></div>
              <div className="rounded-xl bg-[#0b1830]/10 p-3"><p className="text-xs text-slate-300">Suggested route</p><p className="mt-1 text-sm font-semibold">{analysisRecommendation}</p></div>
            </div>
          </section>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Evidence image URL (optional)</label>
            <input type="url" value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} className="w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]" placeholder="https://example.com/photo.jpg" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="min-h-32 w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]"
              placeholder="Describe the issue in detail"
              required
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]"
              placeholder="Main Road, Ward 2, City Center"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/citizen')}
              className="rounded-xl border border-white/10 bg-[#0b1830] px-4 py-2.5 font-medium text-slate-300 hover:bg-white/[.03]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#31d6d0] px-4 py-2.5 font-medium text-white transition hover:bg-[#8cf7f0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </main>
  );
}
