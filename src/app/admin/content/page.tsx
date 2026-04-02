"use client";

import { useEffect, useState } from "react";

interface SectionState {
  expanded: boolean;
  saving: boolean;
}

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Record<string, SectionState>>({
    hero: { expanded: true, saving: false },
    pricing: { expanded: false, saving: false },
    social: { expanded: false, saving: false },
    visibility: { expanded: false, saving: false },
    about: { expanded: false, saving: false },
  });

  // Hero
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");

  // Pricing (Hub only)
  const [hubPrice, setHubPrice] = useState(0);
  const [hubOldPrice, setHubOldPrice] = useState(0);

  // Social Media
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeVisible, setYoutubeVisible] = useState(true);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [instagramVisible, setInstagramVisible] = useState(true);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [facebookVisible, setFacebookVisible] = useState(true);
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [tiktokVisible, setTiktokVisible] = useState(true);

  // Section Visibility
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [showTransformations, setShowTransformations] = useState(true);
  const [showCountdown, setShowCountdown] = useState(true);

  // About
  const [aboutHeading, setAboutHeading] = useState("");
  const [aboutBio, setAboutBio] = useState("");

  // Load all content on mount
  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        // Hero
        if (data.hero_headline) setHeroHeadline(data.hero_headline);
        if (data.hero_subtitle) setHeroSubtitle(data.hero_subtitle);
        // Pricing
        if (data.hub_price) setHubPrice(Number(data.hub_price));
        if (data.hub_old_price) setHubOldPrice(Number(data.hub_old_price));
        // Social
        if (data.social_youtube_url) setYoutubeUrl(data.social_youtube_url);
        if (data.social_youtube_visible !== undefined) setYoutubeVisible(data.social_youtube_visible === "true");
        if (data.social_instagram_url) setInstagramUrl(data.social_instagram_url);
        if (data.social_instagram_visible !== undefined) setInstagramVisible(data.social_instagram_visible === "true");
        if (data.social_facebook_url) setFacebookUrl(data.social_facebook_url);
        if (data.social_facebook_visible !== undefined) setFacebookVisible(data.social_facebook_visible === "true");
        if (data.social_tiktok_url) setTiktokUrl(data.social_tiktok_url);
        if (data.social_tiktok_visible !== undefined) setTiktokVisible(data.social_tiktok_visible === "true");
        // Visibility
        if (data.show_testimonials !== undefined) setShowTestimonials(data.show_testimonials === "true");
        if (data.show_transformations !== undefined) setShowTransformations(data.show_transformations === "true");
        if (data.show_countdown !== undefined) setShowCountdown(data.show_countdown === "true");
        // About
        if (data.about_heading) setAboutHeading(data.about_heading);
        if (data.about_bio) setAboutBio(data.about_bio);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggleSection(key: string) {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], expanded: !prev[key].expanded },
    }));
  }

  async function saveEntries(sectionKey: string, entries: Record<string, string>) {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], saving: true },
    }));
    try {
      await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
    } catch {
      // silent
    }
    // Show "Saved!" for 2 seconds
    setTimeout(() => {
      setSections((prev) => ({
        ...prev,
        [sectionKey]: { ...prev[sectionKey], saving: false },
      }));
    }, 2000);
  }

  function saveHero() {
    saveEntries("hero", {
      hero_headline: heroHeadline,
      hero_subtitle: heroSubtitle,
    });
  }

  function savePricing() {
    saveEntries("pricing", {
      hub_price: String(hubPrice),
      hub_old_price: String(hubOldPrice),
    });
  }

  function saveSocial() {
    saveEntries("social", {
      social_youtube_url: youtubeUrl,
      social_youtube_visible: String(youtubeVisible),
      social_instagram_url: instagramUrl,
      social_instagram_visible: String(instagramVisible),
      social_facebook_url: facebookUrl,
      social_facebook_visible: String(facebookVisible),
      social_tiktok_url: tiktokUrl,
      social_tiktok_visible: String(tiktokVisible),
    });
  }

  function saveVisibility() {
    saveEntries("visibility", {
      show_testimonials: String(showTestimonials),
      show_transformations: String(showTransformations),
      show_countdown: String(showCountdown),
    });
  }

  function saveAbout() {
    saveEntries("about", {
      about_heading: aboutHeading,
      about_bio: aboutBio,
    });
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-[#2A2A2A] bg-[#141414] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E51A1A]/40";
  const textareaCls = `${inputCls} resize-y`;

  const saveBtnCls = (saving: boolean) =>
    `px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer border-none ${
      saving
        ? "bg-green-600 text-white"
        : "bg-[#E51A1A] text-white hover:opacity-90"
    }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#E51A1A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Site Content</h1>
        <p className="text-sm text-white/50 mt-1">
          Edit the content displayed on the main website.
        </p>
      </div>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("hero")}
          className="w-full px-6 py-4 flex items-center justify-between cursor-pointer bg-transparent border-none text-left"
        >
          <h2 className="text-lg font-bold text-white">Hero Content</h2>
          <svg
            className={`w-5 h-5 text-white/40 transition-transform ${sections.hero.expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {sections.hero.expanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-[#2A2A2A] pt-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">
                Headline
              </label>
              <textarea
                rows={3}
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className={textareaCls}
                placeholder="Transform Your Body. Transform Your Life."
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">
                Subtitle
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className={textareaCls}
                placeholder="Join Level Up and get a personalised nutrition plan..."
              />
            </div>
            <button onClick={saveHero} className={saveBtnCls(sections.hero.saving)}>
              {sections.hero.saving ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* ── PRICING ───────────────────────────────────────── */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("pricing")}
          className="w-full px-6 py-4 flex items-center justify-between cursor-pointer bg-transparent border-none text-left"
        >
          <h2 className="text-lg font-bold text-white">Pricing</h2>
          <svg
            className={`w-5 h-5 text-white/40 transition-transform ${sections.pricing.expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {sections.pricing.expanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-[#2A2A2A] pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">
                  Hub Price (PKR)
                </label>
                <input
                  type="number"
                  value={hubPrice}
                  onChange={(e) => setHubPrice(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">
                  Hub Old Price (PKR)
                </label>
                <input
                  type="number"
                  value={hubOldPrice}
                  onChange={(e) => setHubOldPrice(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
            </div>
            <button onClick={savePricing} className={saveBtnCls(sections.pricing.saving)}>
              {sections.pricing.saving ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* ── SOCIAL MEDIA ──────────────────────────────────── */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("social")}
          className="w-full px-6 py-4 flex items-center justify-between cursor-pointer bg-transparent border-none text-left"
        >
          <h2 className="text-lg font-bold text-white">Social Media Links</h2>
          <svg
            className={`w-5 h-5 text-white/40 transition-transform ${sections.social.expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {sections.social.expanded && (
          <div className="px-6 pb-6 space-y-5 border-t border-[#2A2A2A] pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* YouTube */}
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">YouTube</span>
                  </div>
                  <ToggleSwitch checked={youtubeVisible} onChange={setYoutubeVisible} />
                </div>
                <input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@channel"
                  className={inputCls}
                />
              </div>

              {/* Instagram */}
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">Instagram</span>
                  </div>
                  <ToggleSwitch checked={instagramVisible} onChange={setInstagramVisible} />
                </div>
                <input
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className={inputCls}
                />
              </div>

              {/* Facebook */}
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">Facebook</span>
                  </div>
                  <ToggleSwitch checked={facebookVisible} onChange={setFacebookVisible} />
                </div>
                <input
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/page"
                  className={inputCls}
                />
              </div>

              {/* TikTok */}
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">TikTok</span>
                  </div>
                  <ToggleSwitch checked={tiktokVisible} onChange={setTiktokVisible} />
                </div>
                <input
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@username"
                  className={inputCls}
                />
              </div>
            </div>

            <button onClick={saveSocial} className={saveBtnCls(sections.social.saving)}>
              {sections.social.saving ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* ── SECTION VISIBILITY ────────────────────────────── */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("visibility")}
          className="w-full px-6 py-4 flex items-center justify-between cursor-pointer bg-transparent border-none text-left"
        >
          <h2 className="text-lg font-bold text-white">Section Visibility</h2>
          <svg
            className={`w-5 h-5 text-white/40 transition-transform ${sections.visibility.expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {sections.visibility.expanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-[#2A2A2A] pt-4">
            <p className="text-xs text-white/40">
              Control which sections are visible on the public website.
            </p>
            <div className="space-y-3">
              <VisibilityRow
                label="Show Testimonials Section"
                checked={showTestimonials}
                onChange={setShowTestimonials}
              />
              <VisibilityRow
                label="Show Transformations Section"
                checked={showTransformations}
                onChange={setShowTransformations}
              />
              <VisibilityRow
                label="Show Countdown Timer"
                checked={showCountdown}
                onChange={setShowCountdown}
              />
            </div>
            <button onClick={saveVisibility} className={saveBtnCls(sections.visibility.saving)}>
              {sections.visibility.saving ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* ── ABOUT ─────────────────────────────────────────── */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("about")}
          className="w-full px-6 py-4 flex items-center justify-between cursor-pointer bg-transparent border-none text-left"
        >
          <h2 className="text-lg font-bold text-white">About</h2>
          <svg
            className={`w-5 h-5 text-white/40 transition-transform ${sections.about.expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {sections.about.expanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-[#2A2A2A] pt-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">
                Heading
              </label>
              <input
                value={aboutHeading}
                onChange={(e) => setAboutHeading(e.target.value)}
                className={inputCls}
                placeholder="About Raheel"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">
                Bio
              </label>
              <textarea
                rows={8}
                value={aboutBio}
                onChange={(e) => setAboutBio(e.target.value)}
                className={textareaCls}
                placeholder="Write your bio here..."
              />
            </div>
            <button onClick={saveAbout} className={saveBtnCls(sections.about.saving)}>
              {sections.about.saving ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Toggle Switch Component ─────────────────────────────────── */
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-none ${
        checked ? "bg-[#E51A1A]" : "bg-[#333]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ── Visibility Row ──────────────────────────────────────────── */
function VisibilityRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-[#141414] border border-[#2A2A2A] rounded-xl px-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}
