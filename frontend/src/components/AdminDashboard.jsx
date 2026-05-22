import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import IssueCard from './IssueCard';
import MapComponent from './MapComponent';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Download,
  Sparkles,
  MapPin,
} from 'lucide-react';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState('all');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;
    fetchAnalytics();
    fetchIssues();
  }, [token, filter]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/analytics', {
        headers: { 'x-auth-token': token },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const queryParam = filter !== 'all' ? `?status=${filter}` : '';
      const res = await axios.get(`http://localhost:5000/api/issues${queryParam}`);
      setIssues(res.data || []);
    } catch (err) {
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handleExport = async () => {
    if (!issues.length) return;
    setExporting(true);

    try {
      const rows = issues.map((issue) => ({
        Title: issue.title,
        Category: issue.category,
        Priority: issue.priority,
        Status: issue.status,
        CreatedAt: new Date(issue.createdAt).toLocaleString(),
        Reporter: issue.createdBy?.name || 'Anonymous',
        Upvotes: issue.upvotes?.length || 0,
        Location: issue.location?.address || `${issue.location?.lat || '-'}, ${issue.location?.lng || '-'}`,
      }));
      const csvHeader = Object.keys(rows[0]).join(',');
      const csvBody = rows
        .map((row) => Object.values(row).map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const csvContent = `${csvHeader}\n${csvBody}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `civic-eye-issues-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const categoryItems = analytics?.categoryCounts ? Object.entries(analytics.categoryCounts) : [];
  const departmentItems = analytics?.departmentCounts ? Object.entries(analytics.departmentCounts) : [];
  const timelineItems = analytics?.recentActivity || issues.slice(0, 4).map((issue) => ({
    label: issue.title,
    status: issue.status,
    timestamp: issue.createdAt,
  }));

  return (
    <div className="space-y-10">
      <section className="glass-card p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Operations cockpit</p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-100">Admin analytics & city health.</h2>
            <p className="mt-4 max-w-2xl text-slate-400">A premium control panel for tracking performance, escalation, and community trust.</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={18} /> {exporting ? 'Exporting…' : 'Export reports'}
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] bg-slate-900/80 p-6 border border-white/10 shadow-[0_20px_70px_-40px_rgba(0,0,0,0.7)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-300">
              <AlertTriangle size={20} />
            </div>
            <p className="mt-5 text-3xl font-semibold text-slate-100">{analytics?.total ?? '—'}</p>
            <p className="mt-2 text-sm text-slate-400">Total reported issues</p>
          </div>

          <div className="rounded-[28px] bg-slate-900/80 p-6 border border-white/10 shadow-[0_20px_70px_-40px_rgba(0,0,0,0.7)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 size={20} />
            </div>
            <p className="mt-5 text-3xl font-semibold text-slate-100">{analytics?.resolutionRate ?? '—'}%</p>
            <p className="mt-2 text-sm text-slate-400">Resolution rate</p>
          </div>

          <div className="rounded-[28px] bg-slate-900/80 p-6 border border-white/10 shadow-[0_20px_70px_-40px_rgba(0,0,0,0.7)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-300">
              <TrendingUp size={20} />
            </div>
            <p className="mt-5 text-3xl font-semibold text-slate-100">{analytics?.avgResolutionTime ?? '—'}h</p>
            <p className="mt-2 text-sm text-slate-400">Avg resolution time</p>
          </div>

          <div className="rounded-[28px] bg-slate-900/80 p-6 border border-white/10 shadow-[0_20px_70px_-40px_rgba(0,0,0,0.7)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-300">
              <MapPin size={20} />
            </div>
            <p className="mt-5 text-3xl font-semibold text-slate-100">{analytics?.statusCounts?.pending ?? '—'}</p>
            <p className="mt-2 text-sm text-slate-400">Pending issues</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
        <div className="glass-card p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">City heatmap</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-100">Issue geography at a glance</h3>
            </div>
            <div className="rounded-full border border-slate-700/60 bg-slate-900/90 px-4 py-2 text-sm text-slate-300">Auto assigned departments</div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {categoryItems.slice(0, 3).map(([category, count]) => (
              <div key={category} className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{category}</p>
                <p className="mt-4 text-3xl font-semibold text-slate-100">{count}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 h-72 rounded-[32px] bg-slate-950/90 border border-white/10 overflow-hidden">
            <MapComponent issues={issues} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Department pulse</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-100">Smart response teams</h3>
              </div>
              <ShieldCheck size={28} className="text-sky-300" />
            </div>

            <div className="mt-6 space-y-4">
              {departmentItems.slice(0, 4).map(([department, count]) => (
                <div key={department} className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-slate-100">{department}</p>
                    <p className="text-slate-500">Active issues</p>
                  </div>
                  <span className="rounded-full bg-slate-800/80 px-3 py-1 text-slate-200">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Recent activity</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-100">Timeline of city action</h3>
            <div className="mt-6 space-y-4">
              {timelineItems.slice(0, 4).map((item, index) => (
                <div key={`${item.label}-${index}`} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-slate-300">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">{item.status}</span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-slate-100">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Manage issues</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-100">Today’s highest priority reports.</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {statusFilters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleFilterChange(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${filter === item.value ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' : 'bg-slate-900/90 text-slate-300 hover:bg-primary/10 hover:border-primary/20 border border-transparent'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-[360px]" />
            ))
          ) : issues.length ? (
            issues.slice(0, 4).map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onUpdate={fetchIssues}
                onDelete={fetchIssues}
                showAdmin={true}
              />
            ))
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-700/60 bg-slate-950/80 p-12 text-center text-slate-400">
              <p className="text-lg font-semibold text-slate-100">No issues match these filters.</p>
              <p className="mt-2 text-sm">Try another filter or refresh the feed for the latest city reports.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
