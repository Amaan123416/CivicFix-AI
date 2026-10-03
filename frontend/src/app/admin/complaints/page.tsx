"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
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
  aiAnalysis?: {
    category: string;
    priority: string;
    confidence: number;
    recommendation: string;
  };
};

const statuses = ["Pending", "In Progress", "Resolved", "Rejected"];

export default function AdminComplaintsPage() {
  const router = useRouter();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [updatingId, setUpdatingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("civicfix_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchComplaints = async () => {
      try {
        const data = await apiFetch<{ complaints: Complaint[] }>(
          "/admin/complaints",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setComplaints(data.complaints);
      } catch (error) {
        console.error("Failed to load complaints", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load complaints"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [router]);

  const updateStatus = async (
    id: string,
    status: string,
    adminNotes: string
  ) => {
    const token = localStorage.getItem("civicfix_token");

    if (!token) return;

    setUpdatingId(id);
    setError("");

    try {
      const data = await apiFetch<{ complaint: Complaint }>(
        `/complaints/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            adminNotes,
          }),
        }
      );

      setComplaints((current) =>
        current.map((item) =>
          item._id === id ? data.complaint : item
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update complaint"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const toggleComplaint = (id: string) => {
    setExpandedId((current) => (current === id ? "" : id));
  };

  return (
    <main className="min-h-screen bg-[#071120] p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-3xl bg-slate-900 px-6 py-6 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Manage Complaints
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Review citizen reports, evidence and AI analysis.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-[#0b1830] p-6 shadow-sm">
          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {loading && (
            <p className="py-8 text-center text-slate-500">
              Loading complaints...
            </p>
          )}

          {!loading && !error && complaints.length === 0 && (
            <p className="py-8 text-center text-slate-500">
              No complaints found.
            </p>
          )}

          {!loading && complaints.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-500">
                    <th className="pb-3 pr-4 font-medium">
                      Complaint
                    </th>

                    <th className="pb-3 pr-4 font-medium">
                      Citizen
                    </th>

                    <th className="pb-3 pr-4 font-medium">
                      Category
                    </th>

                    <th className="pb-3 pr-4 font-medium">
                      Priority
                    </th>

                    <th className="pb-3 pr-4 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((complaint) => {
                    const isExpanded =
                      expandedId === complaint._id;

                    return (
                      <Fragment key={complaint._id}>
                        <tr className="border-b border-white/5 align-middle">
                          <td className="py-4 pr-4 font-medium text-slate-200">
                            <button
                              type="button"
                              onClick={() =>
                                toggleComplaint(complaint._id)
                              }
                              className="cursor-pointer text-left font-semibold text-white underline decoration-[#8ed5cb] underline-offset-4 transition hover:text-[#8ed5cb]"
                            >
                              {complaint.title}
                            </button>

                            <p className="mt-1 break-all font-mono text-[10px] text-slate-400">
                              {complaint._id}
                            </p>

                            <p className="mt-1 text-[10px] font-medium text-[#8ed5cb]">
                              {isExpanded
                                ? "▲ Hide details"
                                : "▼ Click to view details"}
                            </p>
                          </td>

                          <td className="py-4 pr-4 text-slate-300">
                            {complaint.citizen?.name || "Unknown"}
                          </td>

                          <td className="py-4 pr-4 text-slate-300">
                            {complaint.category}
                          </td>

                          <td className="py-4 pr-4">
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                              {complaint.priority}
                            </span>
                          </td>

                          <td className="py-4 pr-4">
                            <select
                              value={complaint.status}
                              disabled={
                                updatingId === complaint._id
                              }
                              onChange={(event) =>
                                updateStatus(
                                  complaint._id,
                                  event.target.value,
                                  notes[complaint._id] ??
                                    complaint.adminNotes ??
                                    ""
                                )
                              }
                              className="rounded-lg border border-white/10 bg-[#0b1830] px-2 py-1 text-xs font-medium text-slate-300"
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>

                            <textarea
                              value={
                                notes[complaint._id] ??
                                complaint.adminNotes ??
                                ""
                              }
                              onChange={(event) =>
                                setNotes((current) => ({
                                  ...current,
                                  [complaint._id]:
                                    event.target.value,
                                }))
                              }
                              onBlur={() =>
                                updateStatus(
                                  complaint._id,
                                  complaint.status,
                                  notes[complaint._id] ??
                                    complaint.adminNotes ??
                                    ""
                                )
                              }
                              placeholder="Admin note"
                              className="mt-2 w-48 rounded-lg border border-white/10 px-2 py-1 text-xs"
                              rows={2}
                            />
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-b border-white/5">
                            <td
                              colSpan={5}
                              className="p-5"
                            >
                              <div className="rounded-2xl bg-[#f4f1eb] p-5">
                                <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                                  {/* Citizen Report */}
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0c7c78]">
                                      Citizen Report
                                    </p>

                                    <h3 className="mt-2 text-lg font-bold text-[#17232b]">
                                      {complaint.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-[#46545b]">
                                      {complaint.description}
                                    </p>

                                    <p className="mt-4 text-sm text-[#17232b]">
                                      <strong>Location:</strong>{" "}
                                      {complaint.location}
                                    </p>

                                    <p className="mt-2 text-xs text-[#64727a]">
                                      Submitted{" "}
                                      {new Date(
                                        complaint.createdAt
                                      ).toLocaleString()}
                                    </p>

                                    {/* Evidence Image */}
                                    <div className="mt-5">
                                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#64727a]">
                                        Evidence
                                      </p>

                                      {complaint.imageUrl ? (
                                        <a
                                          href={complaint.imageUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Open full-size evidence image"
                                          className="block max-w-xl"
                                        >
                                          <img
                                            src={
                                              complaint.imageUrl
                                            }
                                            alt="Citizen evidence"
                                            className="max-h-80 w-full rounded-xl border border-black/10 object-cover shadow-sm transition hover:opacity-90"
                                          />

                                          <p className="mt-2 text-xs font-semibold text-[#0c7c78]">
                                            🔍 Click image to view
                                            full size
                                          </p>
                                        </a>
                                      ) : (
                                        <div className="rounded-xl border border-dashed border-black/10 bg-white/50 px-4 py-6 text-center">
                                          <p className="text-sm text-[#64727a]">
                                            No evidence image
                                            uploaded.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* AI Analysis */}
                                  <div className="rounded-2xl bg-[#17232b] p-5 text-white">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8ed5cb]">
                                      AI Analysis
                                    </p>

                                    <p className="mt-4 text-sm">
                                      Category:{" "}
                                      <strong>
                                        {complaint.aiAnalysis
                                          ?.category ||
                                          complaint.category}
                                      </strong>
                                    </p>

                                    <p className="mt-3 text-sm">
                                      Priority:{" "}
                                      <strong>
                                        {complaint.aiAnalysis
                                          ?.priority ||
                                          complaint.priority}
                                      </strong>
                                    </p>

                                    <p className="mt-4 text-sm leading-6 text-slate-300">
                                      {complaint.aiAnalysis
                                        ?.recommendation ||
                                        "Review and assign to the relevant department."}
                                    </p>

                                    {typeof complaint.aiAnalysis
                                      ?.confidence === "number" && (
                                      <p className="mt-4 text-xs text-slate-400">
                                        AI confidence:{" "}
                                        {Math.round(
                                          complaint.aiAnalysis
                                            .confidence * 100
                                        )}
                                        %
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}