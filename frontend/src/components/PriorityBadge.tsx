const styles: Record<string, string> = {
  Critical: 'bg-rose-100 text-rose-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-emerald-100 text-emerald-800',
};

export default function PriorityBadge({ priority }: { priority: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[priority] || 'bg-[#071120] text-slate-300'}`}>{priority}</span>;
}
