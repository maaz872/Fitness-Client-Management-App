"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────────── */
interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: string;
}
interface MealLog {
  id: number;
  description: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedDate: string;
  loggedTime: string;
}
interface WeightLog {
  id: number;
  weightKg: number;
  loggedDate: string;
}
interface ProgressPhoto {
  id: number;
  imageData: string;
  photoDate: string;
  notes: string;
}
interface FavouriteItem {
  id: number;
  recipe: { id: number; title: string; slug: string; calories: number; protein: number };
}
interface MessageItem {
  id: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderName: string;
  receiverName: string;
  isSentByUser: boolean;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  role: string;
  plan: string;
  planStatus: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  paymentScreenshot: string | null;
  paymentAccountName: string | null;
  paymentTransactionRef: string | null;
  macroTarget: MacroTarget | null;
  mealLogs: MealLog[];
  weightLogs: WeightLog[];
  progressPhotos: ProgressPhoto[];
  favourites: FavouriteItem[];
  messages: MessageItem[];
}

type Tab = "meals" | "weight" | "photos" | "macros" | "favourites" | "messages";

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-white/10 text-white/70",
  HUB: "bg-[#FF6B00]/20 text-[#FF6B00]",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-[#FFB800]/20 text-[#FFB800]",
  ACTIVE: "bg-green-500/20 text-green-400",
  EXPIRED: "bg-white/10 text-white/50",
  CANCELLED: "bg-red-500/20 text-red-400",
};

export default function UserDetailClient({ user }: { user: UserData }) {
  const [activeTab, setActiveTab] = useState<Tab>("meals");

  const tabs: { key: Tab; label: string }[] = [
    { key: "meals", label: "Meal Logs" },
    { key: "weight", label: "Weight" },
    { key: "photos", label: "Photos" },
    { key: "macros", label: "Macros" },
    { key: "favourites", label: "Favourites" },
    { key: "messages", label: "Messages" },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Users
      </Link>

      {/* ── Profile Card ──────────────────────────────────── */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-white/50 mt-1">{user.email}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PLAN_COLORS[user.plan] || "bg-white/10 text-white/70"}`}>
                {user.plan.replace(/_/g, " ")}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[user.planStatus] || "bg-white/10 text-white/70"}`}>
                {user.planStatus}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70">
                {user.role}
              </span>
              {!user.isActive && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                  Inactive
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide">Country</p>
                <p className="text-white mt-0.5">{user.country || "N/A"}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide">Joined</p>
                <p className="text-white mt-0.5">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide">Last Login</p>
                <p className="text-white mt-0.5">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                </p>
              </div>
              {user.paymentAccountName && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide">Payment Name</p>
                  <p className="text-white mt-0.5">{user.paymentAccountName}</p>
                </div>
              )}
              {user.paymentTransactionRef && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide">Transaction Ref</p>
                  <p className="text-white mt-0.5">{user.paymentTransactionRef}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Screenshot */}
          {user.paymentScreenshot && (
            <div className="shrink-0">
              <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Payment Screenshot</p>
              <img
                src={user.paymentScreenshot}
                alt="Payment screenshot"
                className="w-48 h-auto rounded-xl border border-[#2A2A2A] object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer border-none transition-colors ${
              activeTab === t.key
                ? "bg-[#E51A1A] text-white"
                : "bg-[#1E1E1E] text-white/50 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ───────────────────────────────────── */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        {activeTab === "meals" && <MealLogsTab logs={user.mealLogs} />}
        {activeTab === "weight" && <WeightTab logs={user.weightLogs} />}
        {activeTab === "photos" && <PhotosTab photos={user.progressPhotos} />}
        {activeTab === "macros" && <MacrosTab target={user.macroTarget} />}
        {activeTab === "favourites" && <FavouritesTab items={user.favourites} />}
        {activeTab === "messages" && <MessagesTab messages={user.messages} userId={user.id} />}
      </div>
    </div>
  );
}

/* ── Meal Logs Tab ────────────────────────────────────────── */
function MealLogsTab({ logs }: { logs: MealLog[] }) {
  if (!logs.length) return <EmptyState text="No meal logs recorded yet." />;

  // Group by date and compute daily totals
  const grouped: Record<string, MealLog[]> = {};
  for (const log of logs) {
    const dateKey = new Date(log.loggedDate).toLocaleDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(log);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2A2A2A] text-white/40 text-xs uppercase tracking-wide">
            <th className="px-4 py-3 text-left font-medium">Date</th>
            <th className="px-4 py-3 text-left font-medium">Meal</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-right font-medium">Cals</th>
            <th className="px-4 py-3 text-right font-medium">P</th>
            <th className="px-4 py-3 text-right font-medium">C</th>
            <th className="px-4 py-3 text-right font-medium">F</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([date, items]) => {
            const totals = items.reduce(
              (acc, m) => ({
                calories: acc.calories + m.calories,
                protein: acc.protein + m.protein,
                carbs: acc.carbs + m.carbs,
                fat: acc.fat + m.fat,
              }),
              { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            return (
              <Fragment key={date}>
                {items.map((m) => (
                  <tr key={m.id} className="border-b border-[#2A2A2A]/50 text-white/80">
                    <td className="px-4 py-2.5">{date}</td>
                    <td className="px-4 py-2.5 max-w-[200px] truncate">{m.description}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-white/10">{m.mealType}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">{m.calories}</td>
                    <td className="px-4 py-2.5 text-right">{m.protein.toFixed(0)}g</td>
                    <td className="px-4 py-2.5 text-right">{m.carbs.toFixed(0)}g</td>
                    <td className="px-4 py-2.5 text-right">{m.fat.toFixed(0)}g</td>
                  </tr>
                ))}
                <tr className="border-b border-[#2A2A2A] bg-[#141414] text-[#FF6B00] font-semibold text-xs">
                  <td className="px-4 py-2" colSpan={3}>
                    Daily Total
                  </td>
                  <td className="px-4 py-2 text-right">{totals.calories}</td>
                  <td className="px-4 py-2 text-right">{totals.protein.toFixed(0)}g</td>
                  <td className="px-4 py-2 text-right">{totals.carbs.toFixed(0)}g</td>
                  <td className="px-4 py-2 text-right">{totals.fat.toFixed(0)}g</td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* We need Fragment */
import { Fragment } from "react";

/* ── Weight Tab ───────────────────────────────────────────── */
function WeightTab({ logs }: { logs: WeightLog[] }) {
  if (!logs.length) return <EmptyState text="No weight logs recorded yet." />;

  // Sort ascending for chart
  const sorted = [...logs].sort(
    (a, b) => new Date(a.loggedDate).getTime() - new Date(b.loggedDate).getTime()
  );

  const weights = sorted.map((w) => w.weightKg);
  const minW = Math.min(...weights) - 2;
  const maxW = Math.max(...weights) + 2;
  const range = maxW - minW || 1;

  const chartW = 700;
  const chartH = 200;
  const padX = 40;
  const padY = 20;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padY * 2;

  const points = sorted.map((w, i) => {
    const x = padX + (i / Math.max(sorted.length - 1, 1)) * plotW;
    const y = padY + plotH - ((w.weightKg - minW) / range) * plotH;
    return { x, y, weight: w.weightKg, date: w.loggedDate };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="p-6 space-y-6">
      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-[700px]">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = padY + plotH - pct * plotH;
            const val = (minW + pct * range).toFixed(1);
            return (
              <g key={pct}>
                <line x1={padX} y1={y} x2={chartW - padX} y2={y} stroke="#2A2A2A" strokeWidth={1} />
                <text x={padX - 5} y={y + 4} fill="#666" fontSize="10" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}
          {/* Line */}
          <path d={linePath} fill="none" stroke="#E51A1A" strokeWidth={2} />
          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill="#E51A1A" />
          ))}
        </svg>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-white/40 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Weight (kg)</th>
              <th className="px-4 py-3 text-right font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((w, i) => {
              const prev = i > 0 ? sorted[i - 1].weightKg : null;
              const change = prev !== null ? w.weightKg - prev : null;
              return (
                <tr key={w.id} className="border-b border-[#2A2A2A]/50 text-white/80">
                  <td className="px-4 py-2.5">{new Date(w.loggedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{w.weightKg.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-right">
                    {change !== null ? (
                      <span className={change > 0 ? "text-red-400" : change < 0 ? "text-green-400" : "text-white/40"}>
                        {change > 0 ? "+" : ""}
                        {change.toFixed(1)} kg
                      </span>
                    ) : (
                      <span className="text-white/30">--</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Photos Tab ───────────────────────────────────────────── */
function PhotosTab({ photos }: { photos: ProgressPhoto[] }) {
  if (!photos.length) return <EmptyState text="No progress photos uploaded yet." />;

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((p) => (
          <div key={p.id} className="space-y-2">
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[#2A2A2A] bg-[#141414]">
              <img
                src={p.imageData}
                alt={`Progress photo ${new Date(p.photoDate).toLocaleDateString()}`}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-white/50">{new Date(p.photoDate).toLocaleDateString()}</p>
            {p.notes && <p className="text-xs text-white/30">{p.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Macros Tab ───────────────────────────────────────────── */
function MacrosTab({ target }: { target: MacroTarget | null }) {
  if (!target) return <EmptyState text="No macro targets set for this user." />;

  const items = [
    { label: "Calories", value: `${target.calories} kcal`, color: "#E51A1A" },
    { label: "Protein", value: `${target.protein}g`, color: "#FF6B00" },
    { label: "Carbs", value: `${target.carbs}g`, color: "#FFB800" },
    { label: "Fat", value: `${target.fat}g`, color: "#A855F7" },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40 uppercase tracking-wide">Goal:</span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B00]/20 text-[#FF6B00]">
          {target.goal}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 text-center"
          >
            <p className="text-xs text-white/40 uppercase tracking-wide">{item.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: item.color }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Favourites Tab ───────────────────────────────────────── */
function FavouritesTab({ items }: { items: FavouriteItem[] }) {
  if (!items.length) return <EmptyState text="No favourite recipes yet." />;

  return (
    <div className="p-6">
      <div className="space-y-2">
        {items.map((f) => (
          <Link
            key={f.id}
            href={`/hub/recipes/${f.recipe.slug}`}
            className="flex items-center justify-between bg-[#141414] border border-[#2A2A2A] rounded-xl px-4 py-3 hover:border-[#E51A1A]/40 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-white">{f.recipe.title}</p>
              <p className="text-xs text-white/40 mt-0.5">
                {f.recipe.calories} kcal | {f.recipe.protein}g protein
              </p>
            </div>
            <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Messages Tab ─────────────────────────────────────────── */
function MessagesTab({ messages, userId }: { messages: MessageItem[]; userId: string }) {
  return (
    <div className="p-6 space-y-4">
      {messages.length === 0 ? (
        <EmptyState text="No messages yet." />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl px-4 py-3 border border-[#2A2A2A] ${
                m.isSentByUser ? "bg-[#141414]" : "bg-[#1A1A2E]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white/60">
                  {m.isSentByUser ? `From: User` : `From: Admin`}
                </span>
                <span className="text-xs text-white/30">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-white/80">{m.content}</p>
              {!m.isRead && (
                <span className="inline-block mt-1 text-xs text-[#FFB800]">Unread</span>
              )}
            </div>
          ))}
        </div>
      )}

      <Link
        href={`/admin/messages?user=${userId}`}
        className="inline-flex items-center gap-2 text-sm text-[#E51A1A] hover:underline"
      >
        View all messages
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

/* ── Empty State ──────────────────────────────────────────── */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm text-white/30">{text}</p>
    </div>
  );
}
