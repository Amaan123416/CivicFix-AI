'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import DashboardShell from '@/components/DashboardShell';

type Complaint = {
  _id: string;
  title: string;
  citizen?: { name: string };
  category: string;
  priority: string;
  status: string;
  aiAnalysis?: { category: string; priority: string };
};

type Stats = { total: number; pending: number; inProgress: number; resolved: number; rejected: number };

export default function AdminDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const categoryCounts = complaints.reduce<Record<string, number>>((counts, complaint) => {
    const category = complaint.aiAnalysis?.category || complaint.category;
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});
  const priorityCounts = complaints.reduce<Record<string, number>>((counts, complaint) => {
    counts[complaint.priority] = (counts[complaint.priority] || 0) + 1;
    return counts;
  }, {});

  useEffect(() => {
    const token = localStorage.getItem('civicfix_token');

    if (!token) {
      router.replace('/login');
      return;
    }

    const loadDashboard = () => apiFetch<{ stats: Stats; complaints: Complaint[] }>('/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        setStats(data.stats);
        setComplaints(data.complaints);
        setLastUpdated(new Date());
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));

    const refreshTimer = window.setInterval(loadDashboard, 10000);
    return () => window.clearInterval(refreshTimer);
  }, [router]);

  const logout = () => {
    localStorage.removeItem('civicfix_token');
    localStorage.removeItem('civicfix_role');
    router.push('/login');
  };

  if (loading) {
    return <main className="min-h-screen bg-[#071120] p-6 text-center text-slate-300">Loading dashboard...</main>;
  }

  return (
    <DashboardShell role="admin">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-6 rounded-[1.75rem] bg-[#17232b] px-6 py-7 text-white shadow-[0_24px_60px_rgba(23,35,43,0.16)] sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow text-[#8ed5cb]">Admin dashboard</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Complaint operations</h1>
            <p className="mt-2 text-sm text-slate-300">Triage the city&apos;s signals and move them forward.</p>
            <p className="mt-3 text-xs font-semibold tracking-wide text-[#8ed5cb]">LIVE OPERATIONS {lastUpdated ? `• updated ${lastUpdated.toLocaleTimeString()}` : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => router.push('/profile')} className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-[#0b1830]/10">
              Profile
            </button>
            <button onClick={() => router.push('/admin/complaints')} className="rounded-full bg-[#8ed5cb] px-4 py-2.5 text-sm font-semibold text-[#17232b] hover:bg-[#0b1830]">
              Manage Complaints
            </button>
            <button onClick={logout} className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-[#0b1830]/10">
              Log out
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total" value={stats.total} detail="All submitted issues" tone="teal" />
          <StatCard label="Pending" value={stats.pending} detail="Awaiting triage" tone="amber" />
          <StatCard label="In Progress" value={stats.inProgress} detail="With a department" tone="blue" />
          <StatCard label="Resolved" value={stats.resolved} detail="Closed successfully" tone="coral" />
          <StatCard label="Rejected" value={stats.rejected} detail="Needs review" tone="amber" />
        </section>

        <section className="card-surface p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">All Complaints</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Priority View</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">ID</th>
                  <th className="pb-3 pr-4 font-medium">Citizen</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Priority</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-500">No complaints found.</td></tr>}
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="border-b border-white/5 align-middle">
                    <td className="max-w-52 py-3 pr-4 font-mono text-xs font-medium text-slate-300" title={complaint._id}>{complaint._id}</td>
                    <td className="py-3 pr-4 text-slate-300">{complaint.citizen?.name || 'Unknown'}</td>
                    <td className="py-3 pr-4 text-slate-300">{complaint.category}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        <PriorityBadge priority={complaint.priority} />
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <StatusBadge status={complaint.status} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card-surface p-5 sm:p-6"><p className="eyebrow text-[#0c7c78]">Signal mix</p><h2 className="mt-2 text-xl font-bold text-[#17232b]">Complaint categories</h2><div className="mt-5 space-y-3">{Object.entries(categoryCounts).length ? Object.entries(categoryCounts).map(([category, count]) => <div key={category}><div className="mb-1 flex justify-between text-sm"><span className="text-[#46545b]">{category}</span><strong className="text-[#17232b]">{count}</strong></div><div className="h-2 rounded-full bg-[#e7e4dd]"><div className="h-2 rounded-full bg-[#0c7c78]" style={{ width: `${(count / Math.max(complaints.length, 1)) * 100}%` }} /></div></div>) : <p className="text-sm text-[#64727a]">Distribution appears as reports arrive.</p>}</div></div>
          <div className="card-surface p-5 sm:p-6"><p className="eyebrow text-[#e56b55]">Urgency radar</p><h2 className="mt-2 text-xl font-bold text-[#17232b]">Priority distribution</h2><div className="mt-5 grid grid-cols-2 gap-3">{['Critical', 'High', 'Medium', 'Low'].map((priority) => <div key={priority} className="rounded-xl border border-black/5 bg-[#f4f1eb] p-4"><p className="text-xs text-[#64727a]">{priority}</p><p className="mt-2 text-3xl font-bold text-[#17232b]">{priorityCounts[priority] || 0}</p></div>)}</div></div>
        </section>
      </div>
    </DashboardShell>
  );
}
