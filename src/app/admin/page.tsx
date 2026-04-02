import Link from "next/link";

const stats = [
  { label: "Total Users", value: "247", icon: "\uD83D\uDC65", change: "+12% from last month" },
  { label: "New This Month", value: "18", icon: "\uD83C\uDD95", change: "+3 from last month" },
  { label: "Revenue", value: "\u20AC19,513", icon: "\uD83D\uDCB0", change: "247 \u00D7 \u20AC79" },
  { label: "Active Users (30d)", value: "189", icon: "\u2705", change: "76% of total" },
  { label: "Newsletter Subs", value: "1,432", icon: "\u2709", change: "+89 this month" },
  { label: "Total Recipes", value: "412", icon: "\uD83C\uDF74", change: "In The Hub" },
];

const quickActions = [
  { label: "Add Recipe", href: "/admin/recipes/new", icon: "\uD83C\uDF74", description: "Create a new recipe for the hub" },
  { label: "Add Testimonial", href: "/admin/testimonials/new", icon: "\u2B50", description: "Add a client transformation" },
  { label: "Manage Users", href: "/admin/users", icon: "\uD83D\uDC65", description: "View and manage all users" },
];

const recentActivity = [
  { time: "2 hours ago", text: "New user registered: Sarah M." },
  { time: "5 hours ago", text: "New Hub purchase from James K." },
  { time: "Yesterday", text: "Recipe published: High-Protein Chicken Wrap" },
  { time: "Yesterday", text: "Testimonial updated: Mark D. (12-week transformation)" },
  { time: "2 days ago", text: "Newsletter sent to 1,432 subscribers" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-white/50 mt-1">Welcome back. Here&apos;s an overview of Level Up.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#1E1E1E] rounded-2xl shadow-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/50">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-white/30 mt-2">{stat.change}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-[#1E1E1E] rounded-2xl shadow-card p-6 hover:shadow-lg transition-shadow group"
            >
              <span className="text-3xl">{action.icon}</span>
              <p className="font-bold text-white mt-3 group-hover:text-primary transition-colors">
                {action.label}
              </p>
              <p className="text-sm text-white/50 mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
        <div className="bg-[#1E1E1E] rounded-2xl shadow-card divide-y divide-dark/5">
          {recentActivity.map((activity, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <span className="text-xs text-white/30 w-24 shrink-0">{activity.time}</span>
              <p className="text-sm text-white">{activity.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
