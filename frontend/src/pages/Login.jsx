// src/pages/Login.jsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Extract user name from token (jwt stored in localStorage)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { jwtDecode } = await import('jwt-decode');
          const decoded = jwtDecode(token);
          const name = decoded?.user?.name || 'User';
          setWelcomeName(name.split(' ')[0]);
        } catch {
          setWelcomeName('User');
        }
      } else {
        setWelcomeName('User');
      }
      setShowWelcome(true);
      // After a short animation, navigate to home page
      setTimeout(() => navigate('/'), 2200);
    } catch (err) {
      setError('We couldn\'t sign you in. Please verify your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center rounded-[32px] border border-white/10 bg-slate-950/90 p-16 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            <CheckCircle2 size={48} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl font-semibold tracking-tight text-slate-100"
          >
            Welcome back, {welcomeName}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-4 flex items-center gap-2 text-lg text-slate-400"
          >
            <Sparkles size={18} className="text-sky-300" /> Preparing your dashboard…
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.3, duration: 1.8, ease: 'easeInOut' }}
            className="mt-8 h-1 max-w-xs rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr]"
      >
        <section className="rounded-[32px] border border-white/10 bg-slate-950/90 p-10 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.28em] text-sky-300/80">Secure access</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-100">Welcome back to CivicEye AI+</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
            Sign in to manage reports, review community issues, and keep the city response engine moving.
          </p>
          <div className="mt-10 grid gap-4 rounded-[28px] border border-slate-800/80 bg-slate-900/90 p-6 text-slate-300 shadow-inner shadow-black/20">
            <div className="flex items-start gap-4">
              <div className="mt-1 grid h-12 w-12 place-items-center rounded-3xl bg-sky-500/10 text-sky-300">✓</div>
              <div>
                <p className="font-semibold text-slate-100">Fast entry</p>
                <p className="mt-1 text-sm text-slate-400">Get straight to the reports and issues that matter most.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 grid h-12 w-12 place-items-center rounded-3xl bg-emerald-500/10 text-emerald-300">⚡</div>
              <div>
                <p className="font-semibold text-slate-100">Modern dashboard</p>
                <p className="mt-1 text-sm text-slate-400">Experience a smooth admin workflow designed for civic teams.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-[32px] border border-white/10 bg-slate-950/60 p-8 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Login</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-100">Sign in to your city command center.</h2>
          </div>
          {error && (
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block text-sm font-semibold text-slate-300">
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-4 text-slate-100 outline-none transition focus:border-sky-400/70"
                placeholder="name@domain.com"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-300">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-4 text-slate-100 outline-none transition focus:border-sky-400/70"
                placeholder="Enter your password"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-sky-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Login to CivicEye AI+'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-400">
            New to CivicEye?{' '}
            <Link to="/register" className="font-semibold text-sky-300 hover:text-sky-200">
              Create an account
            </Link>
          </p>
        </section>
      </motion.div>
    </div>
  );
};

export default Login;
