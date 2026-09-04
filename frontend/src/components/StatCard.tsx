type StatCardProps = { label: string; value: string | number; detail: string; tone?: 'teal' | 'coral' | 'amber' | 'blue' };

const tones = {
  teal: 'bg-teal-50 text-teal-700 ring-teal-100',
  coral: 'bg-orange-50 text-orange-700 ring-orange-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  blue: 'bg-sky-50 text-[#6ff3ec] ring-sky-100',
};

export default function StatCard({ label, value, detail, tone = 'teal' }: StatCardProps) {
  return <div className="card-surface lift relative overflow-hidden p-5"><div className={`mb-5 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ring-4 ${tones[tone]}`}>●</div><p className="text-sm text-[#64727a]">{label}</p><p className="mt-2 text-4xl font-bold tracking-tight text-[#17232b]">{value}</p><p className="mt-2 text-xs text-[#64727a]">{detail}</p></div>;
}
