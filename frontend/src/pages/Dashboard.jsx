import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import { Plus, Map, BarChart3, Bell } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-slate-700 bg-slate-900/60 p-8 shadow-lg backdrop-blur-sm"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="mt-3 text-slate-400">
              {isAdmin
                ? 'Manage and resolve civic issues in your city'
                : 'Track your reported issues and help improve your community'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!isAdmin && (
              <Link
                to="/submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-5 py-2.5 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
              >
                <Plus size={20} /> Report Issue
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-5 py-2.5 font-semibold text-slate-200 transition hover:border-slate-500"
            >
              <Map size={20} /> View Map
            </Link>
            {isAdmin && (
              <Link
                to="#analytics"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-secondary to-accent px-5 py-2.5 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
              >
                <BarChart3 size={20} /> View Analytics
              </Link>
            )}
          </div>
        </div>
      </motion.section>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: 'Your Reports', value: '0', icon: BarChart3, color: 'sky' },
          { label: 'In Progress', value: '0', icon: Bell, color: 'amber' },
          { label: 'Resolved', value: '0', icon: Bell, color: 'green' },
          { label: 'Total Impact', value: '0', icon: BarChart3, color: 'purple' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-700 bg-slate-800/40 p-6 hover:border-slate-600 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-100">{stat.value}</p>
              </div>
              <stat.icon size={24} className={`text-${stat.color}-400`} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Admin Panel */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AdminDashboard />
        </motion.div>
      )}

      {/* User Guide */}
      {!isAdmin && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-slate-700 bg-slate-900/60 p-8"
        >
          <h2 className="text-xl font-bold text-slate-100">How to Report an Issue</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              { step: '1', title: 'Describe', desc: 'Tell us what the issue is' },
              { step: '2', title: 'Locate', desc: 'Pin the issue location on the map' },
              { step: '3', title: 'Submit', desc: 'Upload photos and submit' },
            ].map((item) => (
              <div key={item.step} className="rounded-lg bg-slate-800/50 p-4">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-white font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-100">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default Dashboard;
