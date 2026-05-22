import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, MapPin, Calendar, User, Edit2, Trash2, Bookmark, BookmarkMinus, CheckCircle2, Mail, Share2, Star, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function IssueCard({ issue, onUpdate, onDelete, showAdmin = false }) {
  const { token, user } = useContext(AuthContext);
  const [currentIssue, setCurrentIssue] = useState(issue);
  const [isUpvoted, setIsUpvoted] = useState(issue.upvotes?.includes(user?.id) || false);
  const [upvoteCount, setUpvoteCount] = useState(issue.upvotes?.length || 0);
  const [showImage, setShowImage] = useState(!!issue.imageUrl);
  const [bookmarked, setBookmarked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(issue.status);
  const [newPriority, setNewPriority] = useState(issue.priority);
  const [sendingEmail, setSendingEmail] = useState(false);

  // States for Rating & Sharing
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewVal, setReviewVal] = useState('');
  const [submittingRate, setSubmittingRate] = useState(false);

  useEffect(() => {
    setCurrentIssue(issue);
    setIsUpvoted(issue.upvotes?.includes(user?.id) || false);
    setUpvoteCount(issue.upvotes?.length || 0);
  }, [issue, user]);

  const isIssueCreator = user && currentIssue.createdBy && (
    String(user.id) === String(currentIssue.createdBy._id) || String(user.id) === String(currentIssue.createdBy)
  );

  const getBadgeTone = (status) => {
    if (status === 'resolved') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    if (status === 'in-progress') return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
  };

  const getPriorityTone = (priority) => {
    if (priority === 'high') return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
    if (priority === 'medium') return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  };

  const handleUpvote = async () => {
    if (!user) return window.alert('Login to support this report.');
    try {
      const response = await axios.put(`http://localhost:5000/api/issues/upvote/${issue._id}`, {}, {
        headers: { 'x-auth-token': token },
      });
      setIsUpvoted(!isUpvoted);
      setUpvoteCount(response.data?.length ?? (isUpvoted ? upvoteCount - 1 : upvoteCount + 1));
      if (onUpdate) onUpdate({ ...issue, upvotes: response.data });
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/issues/${issue._id}`,
        { status: newStatus, priority: newPriority },
        { headers: { 'x-auth-token': token } },
      );
      setIsEditing(false);
      if (onUpdate) onUpdate(response.data);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Clear this issue from the city feed?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/issues/${issue._id}`, {
        headers: { 'x-auth-token': token },
      });
      if (onDelete) onDelete(issue._id);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleResolve = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/issues/${issue._id}`,
        { status: 'resolved', priority: newPriority },
        { headers: { 'x-auth-token': token } },
      );
      setNewStatus('resolved');
      setIsEditing(false);
      if (onUpdate) onUpdate(response.data);
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  const handleSendResolutionEmail = async () => {
    if (!window.confirm('Send a thank you email to the issue reporter?')) return;
    setSendingEmail(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/issues/${issue._id}/send-resolution-email`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      alert('Thank you email sent successfully!');
    } catch (err) {
      console.error('Email send error:', err);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRate(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/issues/${currentIssue._id}/rate`,
        { rating: ratingVal, review: reviewVal },
        { headers: { 'x-auth-token': token } }
      );
      setCurrentIssue(response.data);
      setShowRateForm(false);
      alert('Thank you for your rating and review!');
      if (onUpdate) onUpdate(response.data);
    } catch (err) {
      console.error('Rating error:', err);
      alert(err.response?.data?.msg || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRate(false);
    }
  };

  const handleShare = (platform) => {
    const shareUrl = `${window.location.origin}/map`;
    const text = `Check out this civic issue: "${currentIssue.title}" on CivicEye! Together we can make our city better.`;
    
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    } else {
      if (navigator.share) {
        navigator.share({
          title: currentIssue.title,
          text: text,
          url: shareUrl
        }).catch(err => console.error(err));
        return;
      } else {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        return;
      }
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card overflow-hidden border border-white/10"
    >
      <div className="relative overflow-hidden bg-slate-950/70">
        {issue.imageUrl ? (
          <img
            src={`http://localhost:5000${issue.imageUrl}`}
            alt={issue.title}
            className="h-64 w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-64 items-center justify-center bg-slate-900 text-slate-400">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Photo unavailable</p>
          </div>
        )}

        <div className="absolute inset-x-0 top-4 px-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <span className={`badge-soft border ${getBadgeTone(issue.status)}`}>{issue.status.replace('-', ' ')}</span>
            <span className={`badge-soft border ${getPriorityTone(issue.priority)}`}>{issue.priority} priority</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">{issue.category}</p>
            <h3 className="text-xl font-semibold text-slate-100">{issue.title}</h3>
          </div>
          <button
            onClick={() => setBookmarked((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/80 text-slate-200 transition hover:bg-slate-900"
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark issue'}
          >
            {bookmarked ? <BookmarkMinus size={20} /> : <Bookmark size={20} />}
          </button>
        </div>

        <p className="text-sm leading-7 text-slate-400">{currentIssue.description.length > 160 ? `${currentIssue.description.slice(0, 160)}...` : currentIssue.description}</p>

        {currentIssue.rating && (
          <div className="mt-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 p-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">Citizen Feedback:</span>
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < currentIssue.rating ? "#fbbf24" : "none"}
                    className={i < currentIssue.rating ? "text-amber-400" : "text-slate-600"}
                  />
                ))}
              </div>
            </div>
            {currentIssue.review && (
              <p className="mt-2 text-sm italic text-slate-300">
                "{currentIssue.review}"
              </p>
            )}
          </div>
        )}

        <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-3xl bg-slate-900/90 px-4 py-3">
            <MapPin size={16} className="text-secondary" />
            <span>{currentIssue.location?.address || `${currentIssue.location?.lat}, ${currentIssue.location?.lng}`}</span>
          </div>
          <div className="flex items-center gap-2 rounded-3xl bg-slate-900/90 px-4 py-3">
            <User size={16} className="text-slate-300" />
            <span>{currentIssue.createdBy?.name || 'Community member'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-3xl bg-slate-900/90 px-4 py-3">
            <Calendar size={16} className="text-slate-300" />
            <span>
              {(() => {
                const date = currentIssue.createdAt 
                  ? new Date(currentIssue.createdAt) 
                  : (currentIssue._id && currentIssue._id.length === 24 
                      ? new Date(parseInt(currentIssue._id.substring(0, 8), 16) * 1000) 
                      : new Date());
                return date.toLocaleDateString();
              })()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleUpvote}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${isUpvoted ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' : 'bg-slate-900/90 text-slate-100 hover:bg-primary/10 hover:border-primary/20 border border-transparent'}`}
            >
              <ThumbsUp size={18} />
              {upvoteCount} support
            </button>

            {/* Share dropdown button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/15"
              >
                <Share2 size={16} /> Share
              </button>
              
              {showShareMenu && (
                <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[160px] bg-slate-900 border border-slate-700/80 rounded-2xl p-2 shadow-xl flex flex-col gap-1 backdrop-blur-xl">
                  <button
                    onClick={() => { handleShare('whatsapp'); setShowShareMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center gap-2"
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    onClick={() => { handleShare('facebook'); setShowShareMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center gap-2"
                  >
                    🔵 Facebook
                  </button>
                  <button
                    onClick={() => { handleShare('twitter'); setShowShareMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center gap-2"
                  >
                    🐦 Twitter / X
                  </button>
                  <button
                    onClick={() => { handleShare('native'); setShowShareMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition flex items-center gap-2 border-t border-slate-800 mt-1 pt-1"
                  >
                    🔗 Share / Copy Link
                  </button>
                </div>
              )}
            </div>

            {/* Rate & Review button */}
            {isIssueCreator && currentIssue.status === 'resolved' && !currentIssue.rating && !showRateForm && (
              <button
                onClick={() => setShowRateForm(true)}
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15"
              >
                <Star size={16} /> Rate Resolution
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
            {isIssueCreator && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-rose-200 transition hover:bg-rose-500/15"
              >
                <Trash2 size={16} /> Clear report
              </button>
            )}

            {showAdmin && currentIssue.status !== 'resolved' && (
              <button
                onClick={handleResolve}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-emerald-200 transition hover:bg-emerald-500/15"
              >
                <CheckCircle2 size={16} /> Resolve
              </button>
            )}

            {showAdmin && currentIssue.status === 'resolved' && (
              <button
                onClick={handleSendResolutionEmail}
                disabled={sendingEmail}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary transition-all duration-300 hover:bg-primary/20 hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={16} />
                {sendingEmail ? 'Sending...' : 'Send Thank You'}
              </button>
            )}

            {showAdmin && (
              <button
                onClick={() => setIsEditing((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-4 py-2 text-slate-200 transition-all duration-300 hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
              >
                <Edit2 size={16} /> Manage
              </button>
            )}
          </div>
        </div>

        {/* Rating & Review Form */}
        {showRateForm && (
          <form onSubmit={handleRateSubmit} className="mt-6 space-y-4 rounded-[28px] border border-amber-500/20 bg-slate-950/90 p-5">
            <h4 className="text-base font-semibold text-amber-300 flex items-center gap-2">
              <Star size={18} /> Rate & Review Resolution
            </h4>
            
            <div className="space-y-2">
              <span className="text-sm text-slate-300">Rating</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRatingVal(val)}
                    className="p-1 transition-all duration-200 hover:scale-125"
                  >
                    <Star
                      size={24}
                      fill={val <= ratingVal ? "#fbbf24" : "none"}
                      className={val <= ratingVal ? "text-amber-400" : "text-slate-600"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-slate-300">Written Review (Optional)</span>
              <textarea
                value={reviewVal}
                onChange={(e) => setReviewVal(e.target.value)}
                placeholder="Share your feedback about the resolution..."
                rows={3}
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-400/80"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                type="submit" 
                disabled={submittingRate}
                className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
              >
                {submittingRate ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowRateForm(false)} 
                className="rounded-full border border-slate-700/80 px-5 py-2.5 text-sm text-slate-200 transition hover:border-slate-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {isEditing && showAdmin && (
          <div className="mt-6 space-y-4 rounded-[28px] border border-slate-700/70 bg-slate-950/90 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span>Status</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Priority</span>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/80"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleUpdateStatus} className="rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg">
                Save changes
              </button>
              <button onClick={() => setIsEditing(false)} className="rounded-full border border-slate-700/80 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}
