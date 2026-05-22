import { Mail, HelpCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Footer = () => {
  const { user } = useContext(AuthContext);
  const email = 'kit27.am29@gmail.com';

  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950/50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Civic Eye</h3>
            <p className="mt-2 text-sm text-slate-400">
              Empowering citizens to report and resolve civic issues in their communities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-slate-200 transition">
                  Home
                </Link>
              </li>
              {user?.role !== 'admin' && (
                <li>
                  <Link to="/submit" className="text-slate-400 hover:text-slate-200 transition">
                    Report Issue
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Support & Report */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100">Support</h4>
            <div className="mt-4 space-y-3">
              <a
                href={`mailto:${email}?subject=Help Request`}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900/60 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition"
              >
                <HelpCircle size={16} />
                Get Help
              </a>
              <a
                href={`mailto:${email}?subject=Report an Issue`}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900/60 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition ml-2"
              >
                <FileText size={16} />
                Report
              </a>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <Mail size={16} />
              <a href={`mailto:${email}`} className="hover:text-slate-200 transition">
                {email}
              </a>
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-slate-800 pt-8">
          <p className="text-center text-sm text-slate-500">
            © 2026 Civic Eye. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
