import Link from 'next/link';
import type { ReactNode } from 'react';

type DashboardShellProps = { role: 'citizen' | 'admin'; children: ReactNode };

const citizenLinks = [
  ['Overview', '/citizen', '⌂'],
  ['Report issue', '/complaints/new', '＋'],
  ['My complaints', '/citizen', '▤'],
  ['Profile', '/profile', '◉'],
];
const adminLinks = [
  ['Overview', '/admin', '⌂'],
  ['Complaints', '/admin/complaints', '▤'],
  ['Profile', '/profile', '◉'],
];

export default function DashboardShell({ role, children }: DashboardShellProps) {
  const links = role === 'admin' ? adminLinks : citizenLinks;
  return (
    <div className="min-h-screen bg-[#050b18] text-[#eaf2ff]">
      <header className="fixed left-0 right-0 top-0 z-40 h-[72px] border-b border-white/10 bg-[#050b18]/80 px-4 backdrop-blur-xl sm:px-6 lg:pl-64 lg:pr-8">
        <div className="flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#31d6d0] to-[#587cff] text-sm font-black text-[#06101f] shadow-[0_0_30px_rgba(49,214,208,.28)]">CF<span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#ff7b6b]" /></span>
            <span>CivicFix <span className="text-[#31d6d0]">AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden w-64 items-center gap-2 rounded-xl border border-white/10 bg-[#0b1830]/[0.04] px-3 py-2 text-sm text-slate-400 sm:flex">⌕ <span>Search reports...</span></div>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0b1830]/[0.05] text-slate-300">♢<i className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#31d6d0] shadow-[0_0_10px_#31d6d0]" /></span>
            <Link href="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb38a] to-[#ff7b6b] text-sm font-black text-[#071120] ring-2 ring-white/10">{role === 'admin' ? 'A' : 'U'}</Link>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-[72px] z-30 hidden w-60 border-r border-white/10 bg-[#071120]/90 backdrop-blur-xl lg:block">
        <div className="px-5 pb-3 pt-7"><p className="eyebrow text-[#31d6d0]">{role === 'admin' ? 'Operations center' : 'Citizen portal'}</p><p className="mt-2 text-xs leading-5 text-slate-500">Intelligent civic issue management.</p></div>
        <nav className="space-y-1.5 p-4">
          {links.map(([label, href, icon], index) => <Link key={label} href={href} className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${index === 0 ? 'bg-[#31d6d0]/10 text-[#6ff3ec] ring-1 ring-[#31d6d0]/10' : 'text-slate-400 hover:bg-[#0b1830]/[.04] hover:text-white'}`}><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b1830]/[.05] text-sm group-hover:bg-[#31d6d0]/10">{icon}</span>{label}</Link>)}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 overflow-hidden rounded-2xl border border-[#31d6d0]/15 bg-gradient-to-br from-[#31d6d0]/10 to-[#8b7cff]/10 p-4">
          <div className="mb-3 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#31d6d0] shadow-[0_0_12px_#31d6d0]"/><p className="text-xs font-bold text-white">AI system online</p></div>
          <p className="text-xs leading-5 text-slate-400">Reports are classified and routed faster with CivicFix intelligence.</p>
        </div>
      </aside>

      <main className="pt-[72px] lg:pl-60"><div className="mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-8">{children}</div></main>
    </div>
  );
}
