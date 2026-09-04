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
  status: string;
  priority: string;
  createdAt: string;
};

type User = {
  name: string;
};

export default function CitizenDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('civicfix_token');

    if (!token) {
      router.replace('/login');
      return;
    }

    const loadDashboard = () => Promise.all([
      apiFetch<{ user: User }>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
      apiFetch<{ complaints: Complaint[] }>('/complaints/my', { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([userResponse, complaintResponse]) => {
        setUser(userResponse.user);
        setComplaints(complaintResponse.complaints);
        setLastUpdated(new Date());
      })
      .catch(() => {
        localStorage.removeItem('civicfix_token');
        localStorage.removeItem('civicfix_role');
        router.replace('/login');
      })
      .finally(() => setLoading(false));

    const refreshTimer = window.setInterval(loadDashboard, 15000);
    return () => window.clearInterval(refreshTimer);
  }, [router]);

  const logout = () => {
    localStorage.removeItem('civicfix_token');
    localStorage.removeItem('civicfix_role');
    router.push('/login');
  };

  const resolvedCount = complaints.filter((complaint) => complaint.status === 'Resolved').length;
  const inProgressCount = complaints.filter((complaint) => complaint.status === 'In Progress').length;

  if (loading) {
    return <main className="min-h-screen bg-[#071120] p-6 text-center text-slate-300">Loading dashboard...</main>;
  }

  return (
    <DashboardShell role="citizen">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-6 rounded-[1.75rem] bg-[#17232b] px-6 py-7 text-white shadow-[0_24px_60px_rgba(23,35,43,0.16)] sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow text-[#8ed5cb]">Citizen dashboard</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Welcome, {user?.name || 'citizen'}</h1>
            <p className="mt-2 text-sm text-slate-300">Keep an eye on every issue you have raised.</p>
            <p className="mt-3 text-xs font-semibold tracking-wide text-[#8ed5cb]">LIVE SYNC {lastUpdated ? `• updated ${lastUpdated.toLocaleTimeString()}` : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => router.push('/profile')} className="rounded-full border border-white/30 px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0b1830]/10">
              Profile
            </button>
            <button onClick={() => router.push('/complaints/new')} className="rounded-full bg-[#f5a18e] px-4 py-2.5 text-sm font-semibold text-[#17232b] hover:bg-[#0b1830]">
              Report New Issue
            </button>
            <button onClick={logout} className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-[#0b1830]/10">
              Log out
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Complaints" value={complaints.length} detail="Across your account" tone="teal" />
          <StatCard label="In Progress" value={inProgressCount} detail="Currently being handled" tone="blue" />
          <StatCard label="Resolved" value={resolvedCount} detail="Closed successfully" tone="coral" />
        </section>

        <section className="card-surface p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">My Complaint History</h2>
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-[#6ff3ec]">Active Cases</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Complaint ID</th>
                  <th className="pb-3 pr-4 font-medium">Issue</th>
                  <th className="pb-3 pr-4 font-medium">Priority</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500">No complaints submitted yet.</td></tr>
                )}
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="border-b border-white/5 align-middle">
                    <td className="max-w-52 py-3 pr-4 font-mono text-xs font-medium text-slate-300" title={complaint._id}>{complaint._id}</td>
                    <td className="py-3 pr-4 text-slate-300"><button onClick={() => router.push(`/complaints/${complaint._id}`)} className="text-left hover:text-[#31d6d0]">{complaint.title}</button></td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                        <PriorityBadge priority={complaint.priority} />
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <StatusBadge status={complaint.status} />
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
