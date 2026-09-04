"use client";

import { useEffect, useState } from "react";

const chatbotUrl = "https://cdn.botpress.cloud/webchat/v3.7/shareable.html?configUrl=https://files.bpcontent.cloud/2026/07/18/10/20260718103358-OS1DVSEE.json";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [complaintId, setComplaintId] = useState(() => (
    typeof window === 'undefined' ? '' : sessionStorage.getItem('civicfix_latest_complaint_id') || ''
  ));

  useEffect(() => {
    const handleComplaintCreated = (event: Event) => {
      const customEvent = event as CustomEvent<{ complaintId?: string }>;
      setComplaintId(customEvent.detail?.complaintId || '');
    };

    window.addEventListener('civicfix:complaint-created', handleComplaintCreated);
    return () => window.removeEventListener('civicfix:complaint-created', handleComplaintCreated);
  }, []);

  const copyComplaintId = async () => {
    if (complaintId) await navigator.clipboard.writeText(complaintId);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7">
      {open && (
        <div className="mb-3 h-[min(70vh,620px)] w-[min(92vw,390px)] overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#fbfaf7] shadow-[0_24px_70px_rgba(23,35,43,0.25)]">
          <div className="flex items-center justify-between bg-[#17232b] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">CivicFix assistant</p>
              <p className="text-xs text-slate-300">Ask about your civic issue</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chatbot" className="rounded-full px-2 py-1 text-xl leading-none text-slate-300 hover:bg-[#0b1830]/10 hover:text-white">&times;</button>
          </div>
          {complaintId && (
            <div className="flex items-center gap-2 border-b border-black/5 bg-[#e4f2ef] px-3 py-2 text-xs text-[#0c625f]">
              <span className="min-w-0 flex-1 truncate">Latest complaint: <strong title={complaintId}>{complaintId}</strong></span>
              <button type="button" onClick={copyComplaintId} className="shrink-0 rounded-full bg-[#0b1830] px-2 py-1 font-semibold hover:bg-[#d8efea]">Copy ID</button>
            </div>
          )}
          <iframe title="CivicFix AI chatbot" src={chatbotUrl} className={complaintId ? "h-[calc(100%-101px)] w-full border-0" : "h-[calc(100%-57px)] w-full border-0"} allow="microphone; camera" />
        </div>
      )}
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? "Close chatbot" : "Open chatbot"} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0c7c78] text-2xl text-white shadow-[0_12px_30px_rgba(12,124,120,0.3)] transition hover:-translate-y-1 hover:bg-[#095f5c]">
        {open ? "×" : "✦"}
      </button>
    </div>
  );
}
