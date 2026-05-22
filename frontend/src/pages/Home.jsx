import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import IssueCard from '../components/IssueCard';
import {
  Sparkles,
  ShieldAlert,
  HeartHandshake,
  MapPin,
  TrendingUp,
  Star,
  MessageSquare,
  ArrowRight,
  Layers,
} from 'lucide-react';

const featurePanels = [
  {
    title: 'Smart Issue Categorization',
    description: 'Issues are automatically categorized to help teams act faster with the right department already notified.',
    icon: ShieldAlert,
  },
  {
    title: 'Community Voice',
    description: 'Citizens can support issues they care about, vote for priorities, and share local impact instantly.',
    icon: HeartHandshake,
  },
  {
    title: 'Live City Map',
    description: 'Every report appears on a city map so teams can see where to deploy resources in real time.',
    icon: MapPin,
  },
  {
    title: 'For Everyone',
    description: 'A simple platform for residents, volunteers, and city leaders working together.',
    icon: Layers,
  },
];

const faqs = [
  {
    question: 'How do I report an issue?',
    answer: 'Tap “Report a civic issue”, describe the problem, attach a photo, and share the location. We help guide it to the right team.',
  },
  {
    question: 'Can I follow updates for my report?',
    answer: 'Yes — once an issue is filed, you can watch its status and see when the city marks it as in progress or resolved.',
  },
  {
    question: 'Will this help urgent problems move faster?',
    answer: 'The system highlights emergencies and routes them to the right department for faster attention.',
  },
];

const Home = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(0);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/issues');
      setIssues(res.data || []);
    } catch (err) {
      console.error('Home fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueUpdate = (updatedIssue) => {
    setIssues((current) => current.map((issue) => (issue._id === updatedIssue._id ? updatedIssue : issue)));
  };

  const handleIssueDelete = (deletedId) => {
    setIssues((current) => current.filter((issue) => issue._id !== deletedId));
  };

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((issue) => issue.status === 'resolved').length;
  const highPriority = issues.filter((issue) => issue.priority === 'high').length;
  const liveMapIssues = issues.filter((issue) => issue.location?.lat && issue.location?.lng);
  const categories = [...new Set(issues.map((issue) => issue.category))].slice(0, 4);

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,107,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(78,205,196,0.18),_transparent_26%)] opacity-70" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary animate-pulse-color">
              <MapPin size={16} /> Report civic issues, track progress
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
              Report Issues, Improve Your City
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Civic Eye makes it easy to report problems in your community. Share locations, photos, and details so city teams can respond quickly and residents stay informed.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              {user?.role !== 'admin' && (
                <Link to="/submit" className="btn-glow">
                  Report This Issue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
              <Link to="/#live-map" className="inline-flex items-center justify-center rounded-3xl border border-slate-700 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900">
                Explore Live Map
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <p className="text-sm uppercase tracking-[0.24em] text-primary/80">Total Reports</p>
                <p className="mt-4 text-4xl font-semibold text-slate-50">{totalIssues}</p>
                <p className="mt-2 text-sm text-slate-400">Reported by citizens across your city.</p>
              </div>
              <div className="glass-card p-6 bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20">
                <p className="text-sm uppercase tracking-[0.24em] text-secondary/80">Resolved faster</p>
                <p className="mt-4 text-4xl font-semibold text-slate-50">{resolvedIssues}</p>
                <p className="mt-2 text-sm text-slate-400">Issues already marked complete by civic teams.</p>
              </div>
              <div className="glass-card p-6 bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
                <p className="text-sm uppercase tracking-[0.24em] text-accent/80">Priority flags</p>
                <p className="mt-4 text-4xl font-semibold text-slate-50">{highPriority}</p>
                <p className="mt-2 text-sm text-slate-400">High urgency issues that need attention.</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="glass-card overflow-hidden"
          >
            <div className="relative h-[420px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800">
              <div className="absolute inset-x-0 top-6 px-6">
                <div className="inline-flex items-center gap-3 rounded-full bg-slate-950/80 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-200 shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Live city pulse
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-slate-100">
                <div className="space-y-3 rounded-[28px] border border-white/10 bg-slate-950/80 p-6 backdrop-blur-xl shadow-[0_20px_60px_-35px_rgba(0,0,0,0.8)]">
                  <p className="text-sm uppercase tracking-[0.28em] text-sky-300/80">Interactive map</p>
                  <h2 className="text-3xl font-semibold">See all reported issues in real-time.</h2>
                  <p className="max-w-xl text-slate-300">The map shows all issues, helping city teams coordinate response and residents track what's being fixed.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="glass-card p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-100">Simple and effective issue reporting.</h2>
            </div>
            <div className="rounded-3xl bg-secondary/10 px-4 py-3 text-secondary border border-secondary/20">Easy to use</div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {featurePanels.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition-all duration-300 hover:border-primary/20 hover:bg-primary/5 hover:scale-105 hover:shadow-lg">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-100">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div id="live-map" className="glass-card p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Live map</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-100">Real-time civic visibility</h2>
            </div>
            <div className="rounded-3xl bg-accent/10 px-4 py-3 text-sm text-accent border border-accent/20">
              {user?.role === 'admin' ? issues.filter(issue => issue.location?.lat && issue.location?.lng).length : liveMapIssues.length} mapped reports
            </div>
          </div>

          <div className="mt-8 h-[420px] overflow-hidden rounded-[32px] border border-white/10 shadow-[0_20px_68px_-36px_rgba(0,0,0,0.7)]">
            {loading ? (
              <div className="flex h-full items-center justify-center bg-slate-950 text-slate-400">Loading map…</div>
            ) : (
              <MapComponent issues={user?.role === 'admin' ? issues.filter(issue => issue.location?.lat && issue.location?.lng) : liveMapIssues} />
            )}
          </div>
        </div>
      </section>

      <section className="glass-card p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Community spotlight</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-100">Recent reports and citizen momentum.</h2>
          </div>
          {user?.role !== 'admin' && (
            <Link to="/submit" className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg">
              Share a new issue
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-[360px]" />
            ))
          ) : issues.length ? (
            issues.slice(0, 4).map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onUpdate={handleIssueUpdate}
                onDelete={handleIssueDelete}
              />
            ))
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center text-slate-300">
              <p className="text-xl font-semibold text-slate-100">No reports yet.</p>
              <p className="mt-4 text-sm text-slate-400">Be the first citizen to report a civic issue and make your street safer.</p>
              {user?.role !== 'admin' && (
                <Link to="/submit" className="mt-8 inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-semibold text-sky-200 hover:border-sky-400">
                  Report This Issue
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="glass-card p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-primary/80">Why CivicEye works</p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-100">Built to feel human, not robotic.</h2>
        <p className="mt-4 max-w-2xl text-slate-400">Every interaction is designed so residents feel heard, city teams stay in control, and meaningful change happens with less friction.</p>

        <div className="mt-10 space-y-4">
          {faqs.map((faq, index) => (
            <button
              key={faq.question}
              onClick={() => setActiveFaq(index)}
              className="w-full rounded-[28px] border border-white/10 bg-slate-900/90 px-6 py-5 text-left transition-all duration-300 hover:border-secondary/30 hover:bg-secondary/5 hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-50">{faq.question}</p>
                  <p className="mt-2 text-sm text-slate-400">{activeFaq === index ? faq.answer : faq.answer.slice(0, 60) + '...'}</p>
                </div>
                <span className="text-secondary transition-colors duration-300">{activeFaq === index ? '−' : '+'}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <footer className="rounded-[32px] border border-white/10 bg-slate-950/70 p-10 text-center text-slate-400 shadow-[0_24px_90px_-50px_rgba(15,23,42,0.85)]">
        <p className="text-sm">CivicEye AI+ is a premium civic issue platform inspired by modern city operations and human-centered design.</p>
        <p className="mt-3 text-xs text-slate-500">Built for residents, city teams, and changemakers who want faster, more meaningful impact.</p>
      </footer>
    </div>
  );
};

export default Home;
