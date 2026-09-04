"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type PublicComplaint = { _id: string; title: string; status: string; priority: string; createdAt: string };
type PublicSummary = { stats: { total: number; resolved: number; pending: number }; complaints: PublicComplaint[] };

const categories = ['Road Damage', 'Waste Management', 'Streetlight', 'Water / Sewerage', 'Traffic', 'Public Infrastructure', 'Other'];

function CityIllustration() {
  return <div className="relative mx-auto h-72 w-full max-w-[520px] sm:h-80">
    <div className="absolute inset-x-10 bottom-6 h-2 rounded-full bg-[#31d6d0]/20 blur-md" />
    <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#31d6d0]/10 blur-3xl pulse-glow" />
    <svg viewBox="0 0 520 320" className="relative h-full w-full float" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M74 242 260 146l186 96-186 55-186-55Z" fill="rgba(49,214,208,.07)" stroke="rgba(49,214,208,.35)"/>
      <path d="m117 224 143-73 143 73-143 44-143-44Z" fill="rgba(139,124,255,.08)" stroke="rgba(139,124,255,.28)"/>
      <g stroke="rgba(234,242,255,.45)" strokeWidth="2">
        <path d="M155 214v-57l35-19v57l-35 19ZM200 201v-89l42-23v89l-42 23ZM252 190V83l44-24v107l-44 24ZM305 205v-74l38-21v74l-38 21ZM351 219v-55l32-18v55l-32 18Z"/>
      </g>
      <g fill="rgba(49,214,208,.85)"><rect x="211" y="119" width="8" height="12" rx="2"/><rect x="263" y="100" width="8" height="12" rx="2"/><rect x="315" y="145" width="8" height="12" rx="2"/><rect x="165" y="171" width="8" height="10" rx="2"/></g>
      <g><path d="M115 113c0-19 15-34 34-34s34 15 34 34c0 26-34 56-34 56s-34-30-34-56Z" fill="#ff7b6b" fillOpacity=".95"/><circle cx="149" cy="113" r="10" fill="#071120"/><path d="M366 86c0-16 13-29 29-29s29 13 29 29c0 22-29 48-29 48s-29-26-29-48Z" fill="#31d6d0" fillOpacity=".95"/><circle cx="395" cy="86" r="9" fill="#071120"/></g>
      <path d="M97 257h326" stroke="rgba(255,255,255,.16)" strokeDasharray="5 8"/>
    </svg>
  </div>;
}

export default function HomePage() {
  const [summary, setSummary] = useState<PublicSummary | null>(null);
  useEffect(() => { apiFetch<PublicSummary>('/complaints/public/summary').then(setSummary).catch(() => undefined); }, []);

  const stats = [
    { label: 'Issues reported', value: summary?.stats.total ?? 0, icon: '◈' },
    { label: 'Resolved', value: summary?.stats.resolved ?? 0, icon: '✓' },
    { label: 'Pending review', value: summary?.stats.pending ?? 0, icon: '◌' },
    { label: 'Resolution rate', value: summary?.stats.total ? `${Math.round((summary.stats.resolved / summary.stats.total) * 100)}%` : '0%', icon: '↗' },
  ];

  return <main className="min-h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-10">
    <div className="mx-auto max-w-7xl">
      <header className="rise-in grid-bg relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#071120]/85 px-6 py-6 shadow-[0_30px_100px_rgba(0,0,0,.4)] backdrop-blur-xl sm:px-10 sm:py-8">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[2rem] border-[#8b7cff]/10" />
        <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#31d6d0]/10 blur-3xl" />
        <nav className="relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-lg font-bold"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#31d6d0] to-[#587cff] text-sm font-black text-[#06101f] shadow-[0_0_30px_rgba(49,214,208,.28)]">CF</span>CivicFix <span className="text-[#31d6d0]">AI</span></Link>
          <div className="hidden items-center gap-7 text-sm text-slate-400 md:flex"><a href="#how">How it works</a><a href="#features">Features</a><a href="#impact">Impact</a></div>
          <div className="flex gap-2"><Link href="/login" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#0b1830]/5">Sign in</Link><Link href="/register" className="rounded-xl bg-[#31d6d0] px-4 py-2.5 text-sm font-bold text-[#06101f] shadow-[0_0_24px_rgba(49,214,208,.18)] hover:bg-[#8cf7f0]">Get started</Link></div>
        </nav>

        <div className="relative mt-12 grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:mt-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#31d6d0]/20 bg-[#31d6d0]/5 px-3 py-1.5 text-xs font-bold text-[#6ff3ec]"><span className="h-2 w-2 rounded-full bg-[#31d6d0] shadow-[0_0_12px_#31d6d0]"/>AI-POWERED CIVIC OPERATIONS</div>
            <h1 className="max-w-2xl text-5xl font-black leading-[.98] tracking-[-.04em] text-white sm:text-7xl">Fix the city.<br/><span className="bg-gradient-to-r from-[#31d6d0] via-[#7ce9e3] to-[#8b7cff] bg-clip-text text-transparent">One report at a time.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">CivicFix AI turns citizen reports into structured, prioritized cases so the right team can act faster — with every step visible.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/register" className="rounded-xl bg-[#31d6d0] px-6 py-3.5 text-sm font-bold text-[#06101f] shadow-[0_0_35px_rgba(49,214,208,.2)] transition hover:-translate-y-0.5 hover:bg-[#8cf7f0]">Report an issue →</Link><Link href="#how" className="rounded-xl border border-white/10 bg-[#0b1830]/[.03] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0b1830]/[.07]">See how it works</Link></div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs text-slate-500"><span>✓ AI classification</span><span>✓ Priority scoring</span><span>✓ Live tracking</span></div>
          </div>
          <CityIllustration />
        </div>
      </header>

      <section id="impact" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => <div key={stat.label} className="card-surface lift rise-in p-5" style={{animationDelay:`${i*80}ms`}}><div className="flex items-start justify-between"><p className="text-sm text-slate-400">{stat.label}</p><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#31d6d0]/10 text-[#6ff3ec]">{stat.icon}</span></div><p className="mt-4 text-3xl font-black tracking-tight text-white">{stat.value}</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-[#0b1830]/5"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#31d6d0] to-[#8b7cff]"/></div></div>)}
      </section>

      <section id="how" className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="card-surface p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="eyebrow text-[#31d6d0]">The workflow</p><h2 className="mt-2 text-2xl font-bold text-white">From complaint to action</h2></div><span className="rounded-full border border-[#31d6d0]/15 bg-[#31d6d0]/5 px-3 py-1.5 text-xs font-bold text-[#6ff3ec]">LIVE PIPELINE</span></div><div className="mt-8 grid gap-3 md:grid-cols-3">{[['01','Report','Citizen submits the problem with location and evidence.'],['02','Understand','AI categorizes the issue and estimates priority.'],['03','Resolve','The case reaches the responsible team and stays trackable.']].map(([n,t,d])=><div key={n} className="rounded-2xl border border-white/8 bg-[#0b1830]/[.025] p-5"><span className="text-xs font-black text-[#31d6d0]">{n}</span><h3 className="mt-5 text-lg font-bold text-white">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{d}</p></div>)}</div></div>
        <div id="features" className="card-surface p-6 sm:p-8"><p className="eyebrow text-[#8b7cff]">Built-in intelligence</p><h2 className="mt-2 text-2xl font-bold text-white">Why CivicFix feels different</h2><div className="mt-6 space-y-3">{['AI-assisted triage & confidence scoring','Transparent complaint status journey','Priority-aware municipal workflow','Citizen-first updates and accountability'].map((x,i)=><div key={x} className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#0b1830]/[.025] p-4"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#31d6d0]/15 to-[#8b7cff]/15 text-[#6ff3ec]">{i+1}</span><span className="text-sm font-semibold text-slate-300">{x}</span></div>)}</div></div>
      </section>

      <section className="mt-5 card-surface overflow-hidden p-6 sm:p-8"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="eyebrow text-[#ff7b6b]">Public activity</p><h2 className="mt-2 text-2xl font-bold text-white">Latest civic reports</h2></div><Link href="/login" className="text-sm font-bold text-[#6ff3ec]">Track your own cases →</Link></div><div className="mt-6 grid gap-3">{(summary?.complaints || []).slice(0,5).map((item)=><div key={item._id} className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0b1830]/[.025] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-white">{item.title}</p><p className="mt-1 text-xs text-slate-500">Submitted {new Date(item.createdAt).toLocaleDateString()}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-[#ff7b6b]/10 px-2.5 py-1 text-xs font-bold text-[#ff9d91]">{item.priority}</span><span className="rounded-full bg-[#31d6d0]/10 px-2.5 py-1 text-xs font-bold text-[#6ff3ec]">{item.status}</span></div></div>)}{!summary?.complaints?.length && <p className="py-8 text-center text-sm text-slate-500">No public complaints yet.</p>}</div></section>

      <footer className="py-8 text-center text-xs text-slate-400">CivicFix AI • Smarter reporting. Faster response. Stronger communities.</footer>
    </div>
  </main>;
}
