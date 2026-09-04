"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Complaint = {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: string;
  createdAt: string;
  citizen?: { name: string; email: string };
  adminNotes?: string;
  imageUrl?: string;
  aiAnalysis?: { category: string; priority: string; confidence: number; recommendation: string };
};

export default function ComplaintDetailsPage() {
  const params = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      const token = localStorage.getItem('civicfix_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch<{ complaint: Complaint }>(`/complaints/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setComplaint(data.complaint);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [params.id]);

  if (loading) {
    return <p className="p-8 text-center text-slate-300">Loading complaint...</p>;
  }

  if (!complaint) {
    return <p className="p-8 text-center text-slate-300">Complaint not found.</p>;
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-4xl">
        <div className="card-surface p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#31d6d0]">Complaint Details</p>
        <h1 className="mt-3 text-3xl font-bold text-white">{complaint.title}</h1>
        <p className="mt-2 break-all font-mono text-xs text-slate-500">Complaint ID: {complaint._id}</p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-white/[.03] p-4">
            <p className="text-sm text-slate-500">Category</p>
            <p className="mt-2 font-semibold text-white">{complaint.category}</p>
          </div>
          <div className="rounded-2xl bg-white/[.03] p-4">
            <p className="text-sm text-slate-500">Priority</p>
            <p className="mt-2 font-semibold text-white">{complaint.priority}</p>
          </div>
          <div className="rounded-2xl bg-white/[.03] p-4">
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-2 font-semibold text-white">{complaint.status}</p>
          </div>
          <div className="rounded-2xl bg-white/[.03] p-4">
            <p className="text-sm text-slate-500">Location</p>
            <p className="mt-2 font-semibold text-white">{complaint.location}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 p-4">
          <p className="text-sm text-slate-500">Description</p>
          <p className="mt-2 whitespace-pre-line text-slate-300">{complaint.description}</p>
        </div>

        <section className="mt-6 rounded-2xl bg-[#17232b] p-5 text-white sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="eyebrow text-[#8ed5cb]">AI analysis</p><h2 className="mt-2 text-xl font-bold">Triage recommendation</h2></div>
            {complaint.aiAnalysis && <span className="rounded-full bg-[#0b1830]/10 px-3 py-1 text-xs text-[#b9e6df]">{Math.round(complaint.aiAnalysis.confidence * 100)}% confidence</span>}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#0b1830]/10 p-4"><p className="text-xs text-slate-300">Detected category</p><p className="mt-2 font-semibold">{complaint.aiAnalysis?.category || complaint.category}</p></div>
            <div className="rounded-xl bg-[#0b1830]/10 p-4"><p className="text-xs text-slate-300">Priority signal</p><p className="mt-2 font-semibold">{complaint.aiAnalysis?.priority || complaint.priority}</p></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">{complaint.aiAnalysis?.recommendation || 'Your report is ready for municipal review.'}</p>
        </section>

        <section className="mt-6 card-surface p-5 sm:p-6">
          <p className="eyebrow text-[#0c7c78]">Case journey</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            {['Submitted', 'AI analyzed', 'Assigned', 'In progress', 'Resolved'].map((step, index) => {
              const active = index === 0 || (index === 1 && complaint.status !== 'Pending') || (index === 2 && ['In Progress', 'Resolved'].includes(complaint.status)) || (index === 3 && ['In Progress', 'Resolved'].includes(complaint.status)) || (index === 4 && complaint.status === 'Resolved');
              return <div key={step} className="flex items-center gap-3 sm:block"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? 'bg-[#0c7c78] text-white' : 'bg-[#e7e4dd] text-[#64727a]'}`}>{index + 1}</span><p className={`mt-0 text-sm font-semibold sm:mt-3 ${active ? 'text-[#17232b]' : 'text-[#9aa2a4]'}`}>{step}</p></div>;
            })}
          </div>
        </section>

        {complaint.adminNotes && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm text-emerald-700">Administrator update</p><p className="mt-2 whitespace-pre-line text-emerald-900">{complaint.adminNotes}</p></div>}
        {complaint.imageUrl && <img src={complaint.imageUrl} alt="Complaint evidence" className="mt-6 max-h-96 w-full rounded-2xl object-cover" />}

        <div className="mt-6 text-sm text-slate-500">
          <p>Submitted on: {new Date(complaint.createdAt).toLocaleDateString()}</p>
          {complaint.citizen && <p>Reporter: {complaint.citizen.name}</p>}
        </div>
        </div>
      </div>
    </main>
  );
}
