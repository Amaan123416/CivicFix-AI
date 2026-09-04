"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Fragment } from "react";
import { useRouter } from 'next/navigation';
import { apiFetch } from "@/lib/api";

type Complaint = {
  _id: string;
  title: string;
  citizen?: { name: string };
  category: string;
  priority: string;
  status: string;
  adminNotes: string;
  description: string;
  location: string;
  imageUrl?: string;
  createdAt: string;
  aiAnalysis?: { category: string; priority: string; confidence: number; recommendation: string };
};

const statuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [updatingId, setUpdatingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('civicfix_token');

    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchComplaints = async () => {
      try {
        const data = await apiFetch<{ complaints: Complaint[] }>('/admin/complaints', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setComplaints(data.complaints);
      } catch (error) {
        console.error('Failed to load complaints', error);
        setError(error instanceof Error ? error.message : 'Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [router]);

  const updateStatus = async (id: string, status: string, adminNotes: string) => {
    const token = localStorage.getItem('civicfix_token');
    if (!token) return;

    setUpdatingId(id);
    setError('');
    try {
      const data = await apiFetch<{ complaint: Complaint }>(`/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, adminNotes }),
      });
      setComplaints((current) => current.map((item) => item._id === id ? data.complaint : item));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update complaint');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <main className="min-h-screen bg-[#071120] p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-3xl bg-slate-900 px-6 py-6 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Admin</p>
            <h1 className="mt-2 text-3xl font-bold">Manage Complaints</h1>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-[#0b1830] p-6 shadow-sm">
          {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {loading && <p className="py-8 text-center text-slate-500">Loading complaints...</p>}
          {!loading && !error && complaints.length === 0 && <p className="py-8 text-center text-slate-500">No complaints found.</p>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Complaint</th>
                  <th className="pb-3 pr-4 font-medium">Citizen</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Priority</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <Fragment key={complaint._id}>
                  <tr key={complaint._id} className="border-b border-white/5 align-middle">
                    <td className="py-3 pr-4 font-medium text-slate-200"><button type="button" onClick={() => setExpandedId(expandedId === complaint._id ? '' : complaint._id)} className="text-left hover:text-[#0c7c78]">{complaint.title}</button><p className="mt-1 break-all font-mono text-[10px] text-slate-400">{complaint._id}</p></td>
                    <td className="py-3 pr-4 text-slate-300">{complaint.citizen?.name || 'Unknown'}</td>
                    <td className="py-3 pr-4 text-slate-300">{complaint.category}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <select value={complaint.status} disabled={updatingId === complaint._id} onChange={(event) => updateStatus(complaint._id, event.target.value, notes[complaint._id] ?? complaint.adminNotes ?? '')} className="rounded-lg border border-white/10 bg-[#0b1830] px-2 py-1 text-xs font-medium text-slate-300">
                        {statuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                      <textarea value={notes[complaint._id] ?? complaint.adminNotes ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [complaint._id]: event.target.value }))} onBlur={() => updateStatus(complaint._id, complaint.status, notes[complaint._id] ?? complaint.adminNotes ?? '')} placeholder="Admin note" className="mt-2 w-48 rounded-lg border border-white/10 px-2 py-1 text-xs" rows={2} />
                    </td>
                  </tr>
                  {expandedId === complaint._id && <tr className="bg-[#f4f1eb]/60"><td colSpan={5} className="p-5"><div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]"><div><p className="eyebrow text-[#0c7c78]">Citizen report</p><p className="mt-2 text-sm leading-6 text-slate-300">{complaint.description}</p><p className="mt-4 text-sm"><strong>Location:</strong> {complaint.location}</p><p className="mt-2 text-xs text-slate-500">Submitted {new Date(complaint.createdAt).toLocaleString()}</p>{complaint.imageUrl && <img src={complaint.imageUrl} alt="Citizen evidence" className="mt-4 max-h-64 w-full rounded-xl object-cover" />}</div><div className="rounded-2xl bg-[#17232b] p-4 text-white"><p className="eyebrow text-[#8ed5cb]">AI analysis</p><p className="mt-3 text-sm">Category: <strong>{complaint.aiAnalysis?.category || complaint.category}</strong></p><p className="mt-2 text-sm">Priority: <strong>{complaint.aiAnalysis?.priority || complaint.priority}</strong></p><p className="mt-3 text-sm leading-6 text-slate-300">{complaint.aiAnalysis?.recommendation || 'Review and assign to the relevant department.'}</p></div></div></td></tr>}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
