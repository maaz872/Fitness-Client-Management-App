"use client";

import { useState, useEffect } from "react";

export default function AdminBrandingPage() {
  const [siteName, setSiteName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        setSiteName(data.site_name || "Level Up");
        setCoachName(data.coach_name || "Coach Raheel");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: {
            site_name: siteName.trim(),
            coach_name: coachName.trim(),
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full py-3 px-4 border-2 border-[#2A2A2A] rounded-xl text-base bg-[#1E1E1E] text-white placeholder:text-white/30 focus:border-[#E51A1A] focus:outline-none transition-colors";

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">Branding</h1>
      <p className="text-white/50 mb-8">
        Customize your app name and coach name across the entire platform.
      </p>

      {loading ? (
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 animate-pulse">
          <div className="h-4 bg-[#2A2A2A] rounded w-32 mb-6" />
          <div className="h-12 bg-[#2A2A2A] rounded mb-6" />
          <div className="h-4 bg-[#2A2A2A] rounded w-32 mb-6" />
          <div className="h-12 bg-[#2A2A2A] rounded" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-[600px]">
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 space-y-6">
            <div>
              <label className="block font-semibold text-sm text-white mb-1.5">
                App Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. Level Up"
                required
                className={inputClass}
              />
              <p className="text-white/30 text-xs mt-1.5">
                Appears in the header, footer, sidebar, and throughout the site.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-sm text-white mb-1.5">
                Coach Name
              </label>
              <input
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="e.g. Coach Raheel"
                required
                className={inputClass}
              />
              <p className="text-white/30 text-xs mt-1.5">
                Appears in the admin sidebar, approval messages, and about page.
              </p>
            </div>

            {error && (
              <div className="bg-[#E51A1A]/10 border border-[#E51A1A]/20 text-[#E51A1A] px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm">
                Branding updated! Changes will appear across the entire site.
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`bg-[#E51A1A] hover:bg-[#C41010] text-white font-bold px-8 py-3 rounded-xl text-sm uppercase tracking-wider transition-colors cursor-pointer ${
                saving ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
