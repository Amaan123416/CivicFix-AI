type Status = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected' | string;

const styles: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-sky-100 text-sky-800',
  Resolved: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-rose-100 text-rose-800',
};

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || 'bg-[#071120] text-slate-300'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}
