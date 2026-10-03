"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, apiFetch } from "@/lib/api";

const categories = [
  'Road Damage',
  'Waste Management',
  'Streetlight',
  'Water/Sewerage',
  'Traffic',
  'Public Infrastructure',
  'Other',
];

const priorities = ['Low', 'Medium', 'High', 'Critical'];

const getRecommendation = (text: string) => {
  if (text.includes('pothole') || text.includes('road')) return 'Public works inspection';
  if (text.includes('garbage') || text.includes('waste') || text.includes('trash')) return 'Sanitation collection';
  if (text.includes('light') || text.includes('lamp') || text.includes('dark')) return 'Electrical maintenance';
  if (text.includes('water') || text.includes('leak') || text.includes('sewer')) return 'Water services inspection';
  return 'Municipal review and assignment';
};

export default function NewComplaintPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Road Damage',
    priority: 'Medium',
    location: '',
    imageUrl: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const analysisText = `${form.title} ${form.description}`.toLowerCase();
  const analysisRecommendation = getRecommendation(analysisText);

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10 MB.');
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    const token = localStorage.getItem('civicfix_token');

    if (!token) {
      setError('Your session has expired. Please log in again.');
      router.push('/login');
      return;
    }

    setUploadingImage(true);

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const response = await fetch(
        `${API_BASE_URL}/complaints/upload-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      setForm((prev) => ({
        ...prev,
        imageUrl: data.imageUrl,
      }));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to upload image';

      setError(message);
      setSelectedImage(null);
      setImagePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setForm((prev) => ({
      ...prev,
      imageUrl: '',
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('civicfix_token');

      if (!token) {
        setError(
          'Your session has expired. Please log in again before submitting a complaint.'
        );
        setLoading(false);
        router.push('/login');
        return;
      }

      if (selectedImage && uploadingImage) {
        setError('Please wait until the image upload finishes.');
        setLoading(false);
        return;
      }

      const response = await apiFetch<{ complaint: { _id: string } }>(
        '/complaints',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      sessionStorage.setItem(
        'civicfix_latest_complaint_id',
        response.complaint._id
      );

      window.dispatchEvent(
        new CustomEvent('civicfix:complaint-created', {
          detail: {
            complaintId: response.complaint._id,
          },
        })
      );

      router.push('/citizen');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to submit complaint';

      setError(
        message === 'Authentication token missing' ||
          message === 'Invalid or expired token'
          ? 'Your session has expired. Please log in again before submitting a complaint.'
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-[#0c7c78]">
              Citizen portal / new report
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#17232b] sm:text-4xl">
              Report a civic issue
            </h1>

            <p className="mt-2 text-sm text-[#64727a]">
              Give your city team the signal they need to act.
            </p>
          </div>

          <span className="hidden rounded-full bg-[#d8efea] px-3 py-1.5 text-xs font-semibold text-[#0c7c78] sm:inline-flex">
            4 steps
          </span>
        </div>

        <div className="card-surface p-5 sm:p-8">
          <div className="mb-8 grid grid-cols-4 gap-2 border-b border-black/5 pb-6">
            {['Issue details', 'Location', 'Evidence', 'Review'].map(
              (step, index) => (
                <div key={step} className="relative">
                  <div
                    className={`mb-2 h-1 rounded-full ${
                      index === 0
                        ? 'bg-[#0c7c78]'
                        : 'bg-[#e7e4dd]'
                    }`}
                  />

                  <p
                    className={`text-[0.65rem] font-semibold uppercase tracking-wide ${
                      index === 0
                        ? 'text-[#0c7c78]'
                        : 'text-[#9aa2a4]'
                    }`}
                  >
                    {step}
                  </p>
                </div>
              )
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]"
                placeholder="Large pothole near main road"
                required
              />
            </div>

            <section className="rounded-2xl bg-[#17232b] p-5 text-white sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow text-[#8ed5cb]">
                    Live triage preview
                  </p>

                  <h2 className="mt-2 text-lg font-bold">
                    AI-ready analysis
                  </h2>
                </div>

                <span className="rounded-full bg-[#0b1830]/10 px-3 py-1 text-xs text-[#b9e6df]">
                  Updates as you type
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[#0b1830]/10 p-3">
                  <p className="text-xs text-slate-300">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {form.category}
                  </p>
                </div>

                <div className="rounded-xl bg-[#0b1830]/10 p-3">
                  <p className="text-xs text-slate-300">
                    Priority
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {form.priority}
                  </p>
                </div>

                <div className="rounded-xl bg-[#0b1830]/10 p-3">
                  <p className="text-xs text-slate-300">
                    Suggested route
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {analysisRecommendation}
                  </p>
                </div>
              </div>
            </section>

            {/* Evidence Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Evidence image (optional)
              </label>

              <div className="rounded-2xl border border-dashed border-white/15 bg-[#0b1830]/30 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      Upload a photo of the issue
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      JPG, PNG, WEBP or other image files up to 10 MB
                    </p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#31d6d0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8cf7f0]">
                    {uploadingImage
                      ? 'Uploading...'
                      : 'Choose Image'}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {imagePreview && (
                  <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Selected evidence"
                        className="max-h-72 w-full object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-white/10 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {selectedImage?.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {uploadingImage
                            ? 'Uploading to secure image storage...'
                            : form.imageUrl
                              ? 'Image uploaded successfully'
                              : 'Preparing image...'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={uploadingImage}
                        className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Or
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Paste an image URL instead
                </label>

                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }));

                    if (imagePreview) {
                      setImagePreview('');
                      setSelectedImage(null);
                    }
                  }}
                  className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-[#31d6d0]"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-32 w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]"
                placeholder="Describe the issue in detail"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Priority
                </label>

                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]"
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Location
              </label>

              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 px-3 py-2.5 outline-none transition focus:border-[#31d6d0]"
                placeholder="Main Road, Ward 2, City Center"
                required
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/citizen')}
                className="rounded-xl border border-white/10 bg-[#0b1830] px-4 py-2.5 font-medium text-slate-300 hover:bg-white/[.03]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="rounded-xl bg-[#31d6d0] px-4 py-2.5 font-medium text-white transition hover:bg-[#8cf7f0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Submitting...'
                  : uploadingImage
                    ? 'Uploading Image...'
                    : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}