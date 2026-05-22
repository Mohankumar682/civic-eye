const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Issue = require('../models/Issue');

// Get analytics data (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const issues = await Issue.find();

    // Status breakdown
    const statusCounts = {
      pending: issues.filter(i => i.status === 'pending').length,
      'in-progress': issues.filter(i => i.status === 'in-progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length
    };

    // Category breakdown
    const categoryCounts = {};
    issues.forEach(i => {
      categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
    });

    // Priority breakdown
    const priorityCounts = {
      high: issues.filter(i => i.priority === 'high').length,
      medium: issues.filter(i => i.priority === 'medium').length,
      low: issues.filter(i => i.priority === 'low').length
    };

    // Average resolution time (in hours)
    const resolvedIssues = issues.filter(i => i.status === 'resolved' && i.resolvedAt);
    let avgResolutionTime = 0;
    if (resolvedIssues.length > 0) {
      const totalMs = resolvedIssues.reduce((sum, i) => {
        const created = i.createdAt || i._id.getTimestamp();
        return sum + (new Date(i.resolvedAt) - new Date(created));
      }, 0);
      avgResolutionTime = Math.round((totalMs / resolvedIssues.length) / (1000 * 60 * 60)); // hours
    }

    // Most upvoted issues (top 5)
    const topUpvoted = [...issues]
      .sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))
      .slice(0, 5)
      .map(i => ({ _id: i._id, title: i.title, upvotes: i.upvotes?.length || 0, status: i.status }));

    // Issues per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentIssues = issues.filter(i => new Date(i.createdAt || i._id.getTimestamp()) >= thirtyDaysAgo);
    
    const issuesPerDay = {};
    recentIssues.forEach(i => {
      const day = new Date(i.createdAt || i._id.getTimestamp()).toISOString().split('T')[0];
      issuesPerDay[day] = (issuesPerDay[day] || 0) + 1;
    });

    // Department suggestion based on category
    const departmentMap = {
      'Garbage': 'Sanitation Department',
      'Roads': 'Public Works Department',
      'Streetlights': 'Electrical Department',
      'Water': 'Water Supply Board',
      'Drainage': 'Municipal Engineering',
      'Other': 'General Municipal Office'
    };

    // Calculate department counts
    const departmentCounts = {};
    issues.forEach(i => {
      const dept = departmentMap[i.category] || 'General Municipal Office';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    // Recent activity (latest 5 issues)
    const recentActivity = [...issues]
      .sort((a, b) => new Date(b.createdAt || b._id.getTimestamp()) - new Date(a.createdAt || a._id.getTimestamp()))
      .slice(0, 5)
      .map(i => ({
        label: i.title,
        status: i.status,
        timestamp: i.createdAt || i._id.getTimestamp()
      }));

    res.json({
      total: issues.length,
      statusCounts,
      categoryCounts,
      priorityCounts,
      avgResolutionTime,
      topUpvoted,
      issuesPerDay,
      departmentMap,
      departmentCounts,
      recentActivity,
      resolvedCount: resolvedIssues.length,
      resolutionRate: issues.length > 0 ? Math.round((resolvedIssues.length / issues.length) * 100) : 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
