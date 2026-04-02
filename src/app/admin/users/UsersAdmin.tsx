"use client";

import { useState, useMemo } from "react";
import ChangePasswordModal from "@/components/admin/ChangePasswordModal";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  role: string;
  plan: string;
  planStatus: string;
  isActive: boolean;
  hasPaymentProof?: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const planBadge = (plan: string) => {
  const styles: Record<string, string> = {
    FREE: "bg-white/10 text-white/50",
    HUB: "bg-[#FF6B00]/20 text-[#FF6B00]",
  };
  const labels: Record<string, string> = {
    FREE: "Free",
    HUB: "Hub",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[plan] || "bg-white/10 text-white/50"}`}>
      {labels[plan] || plan}
    </span>
  );
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    PENDING: "bg-[#FFB800]/20 text-[#FFB800]",
    ACTIVE: "bg-green-500/20 text-green-400",
    EXPIRED: "bg-white/10 text-white/40",
    CANCELLED: "bg-[#E51A1A]/20 text-[#E51A1A]",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[status] || "bg-white/10 text-white/50"}`}>
      {status}
    </span>
  );
};

export default function UsersAdmin({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filtered = useMemo(() => {
    let result = [...users];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "ALL") {
      result = result.filter((u) => u.planStatus === filterStatus);
    }
    return result;
  }, [users, search, filterStatus]);

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "ACTIVE" ? "PENDING" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planStatus: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, planStatus: newStatus } : u))
        );
      }
    } catch (err) {
      console.error("Failed:", err);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, isActive: !current } : u))
        );
      }
    } catch (err) {
      console.error("Failed:", err);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (err) {
      console.error("Failed:", err);
    }
  }

  const pendingCount = users.filter((u) => u.planStatus === "PENDING" && u.role !== "ADMIN").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Users</h1>
          <p className="text-white/50 text-sm mt-1">{users.length} total users</p>
        </div>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-[#FFB800] text-2xl">&#9203;</span>
          <div>
            <p className="text-[#FFB800] font-bold text-sm">{pendingCount} pending approval{pendingCount > 1 ? "s" : ""}</p>
            <p className="text-white/50 text-xs">Users waiting for account activation</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-white/30 focus:border-[#E51A1A] focus:outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl py-2.5 px-4 text-white text-sm focus:border-[#E51A1A] focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-[#2A2A2A]/50 hover:bg-[#252525] transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-white/40 text-xs">{user.email}</p>
                  </td>
                  <td className="px-5 py-3">{planBadge(user.plan)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {statusBadge(user.planStatus)}
                      {!user.isActive && (
                        <span className="text-xs text-[#E51A1A]">Deactivated</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/40 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {user.role !== "ADMIN" && (
                        <>
                          <button
                            onClick={() => toggleStatus(user.id, user.planStatus)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border-none transition-colors ${
                              user.planStatus === "ACTIVE"
                                ? "bg-[#FFB800]/20 text-[#FFB800] hover:bg-[#FFB800]/30"
                                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            }`}
                          >
                            {user.planStatus === "ACTIVE" ? "Suspend" : "Activate"}
                          </button>
                          <ChangePasswordModal userId={user.id} userName={`${user.firstName} ${user.lastName}`} />
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#E51A1A]/10 text-[#E51A1A] hover:bg-[#E51A1A]/20 cursor-pointer border-none transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {user.role === "ADMIN" && (
                        <span className="text-xs text-white/30">Admin</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-white/30">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
