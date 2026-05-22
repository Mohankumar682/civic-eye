const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { sendResolutionEmail } = require('../services/emailService');
const multer = require('multer');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// AI Category classification from description
const classifyCategory = (description) => {
  const lower = description.toLowerCase();
  if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') || lower.includes('dump') || lower.includes('litter') || lower.includes('rubbish')) {
    return 'Garbage';
  } else if (lower.includes('pothole') || lower.includes('road') || lower.includes('crack') || lower.includes('pavement') || lower.includes('bump')) {
    return 'Roads';
  } else if (lower.includes('light') || lower.includes('dark') || lower.includes('lamp') || lower.includes('bulb') || lower.includes('street light')) {
    return 'Streetlights';
  } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('flood') || lower.includes('drain')) {
    return 'Water';
  } else if (lower.includes('sewer') || lower.includes('drainage') || lower.includes('clog') || lower.includes('overflow')) {
    return 'Drainage';
  }
  return 'Other';
};

// AI Priority classification from description
const classifyPriority = (description) => {
  const lower = description.toLowerCase();
  const highKeywords = ['urgent', 'emergency', 'dangerous', 'hazard', 'accident', 'collapse', 'flood', 'broken main', 'sinkhole', 'fire'];
  const lowKeywords = ['minor', 'small', 'slight', 'cosmetic', 'aesthetic'];
  
  if (highKeywords.some(k => lower.includes(k))) return 'high';
  if (lowKeywords.some(k => lower.includes(k))) return 'low';
  return 'medium';
};

// Suggest responsible department
const suggestDepartment = (category) => {
  const map = {
    'Garbage': 'Sanitation Department',
    'Roads': 'Public Works Department',
    'Streetlights': 'Electrical Department',
    'Water': 'Water Supply Board',
    'Drainage': 'Municipal Engineering',
    'Other': 'General Municipal Office'
  };
  return map[category] || 'General Municipal Office';
};

// Get all issues with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, sort } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    let sortObj = { createdAt: -1 };
    if (sort === 'upvotes') sortObj = {}; // We'll sort after populate
    if (sort === 'oldest') sortObj = { createdAt: 1 };

    let issues = await Issue.find(filter).sort(sortObj).populate('createdBy', 'name email');
    
    // Sort by upvote count if requested
    if (sort === 'upvotes') {
      issues.sort((a, b) => b.upvotes.length - a.upvotes.length);
    }
    
    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single issue
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('createdBy', 'name email');
    if (!issue) return res.status(404).json({ msg: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create new issue
router.post('/', [auth, upload.single('image')], async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ msg: 'Admins are not allowed to submit new issues' });
    }
    const { title, description, category, priority, lat, lng, address } = req.body;
    
    // Auto-classify category with AI if 'auto' is passed
    let finalCategory = category;
    if (finalCategory === 'auto') {
      finalCategory = classifyCategory(description);
    }

    // Auto-classify priority if 'auto' is passed
    let finalPriority = priority;
    if (finalPriority === 'auto') {
      finalPriority = classifyPriority(description);
    }

    const department = suggestDepartment(finalCategory);

    const newIssue = new Issue({
      title,
      description,
      category: finalCategory,
      priority: finalPriority || 'medium',
      location: { lat: parseFloat(lat), lng: parseFloat(lng), address },
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      createdBy: req.user.id
    });

    const issue = await newIssue.save();
    const populated = await Issue.findById(issue._id).populate('createdBy', 'name email');

    res.json({ ...populated.toObject(), suggestedDepartment: department });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update issue status (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { status, priority } = req.body;
    const issueFields = {};
    if (status) issueFields.status = status;
    if (priority) issueFields.priority = priority;
    if (status === 'resolved') {
      issueFields.resolvedAt = Date.now();
    }

    let issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ msg: 'Issue not found' });

    const oldStatus = issue.status;

    issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: issueFields },
      { new: true }
    ).populate('createdBy', 'name email');

    // Create notification for the issue creator if status changed
    if (status && status !== oldStatus) {
      const statusLabels = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'resolved': 'Resolved ✅'
      };
      await Notification.create({
        userId: issue.createdBy._id,
        issueId: issue._id,
        message: `Your issue "${issue.title}" has been updated to ${statusLabels[status] || status}.`,
        type: 'status_change'
      });
    }

    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Send resolution email to issue reporter (Admin only)
router.post('/:id/send-resolution-email', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const issue = await Issue.findById(req.params.id).populate('createdBy', 'name email');
    if (!issue) return res.status(404).json({ msg: 'Issue not found' });

    if (issue.status !== 'resolved') {
      return res.status(400).json({ msg: 'Issue must be resolved before sending thank you email' });
    }

    if (!issue.createdBy?.email) {
      return res.status(400).json({ msg: 'User email not found' });
    }

    const emailResult = await sendResolutionEmail(
      issue.createdBy.email,
      issue.createdBy.name,
      issue.title,
      issue.category
    );

    if (emailResult.success) {
      // Create a notification for the user as well
      await Notification.create({
        userId: issue.createdBy._id,
        issueId: issue._id,
        message: `Thank you for reporting "${issue.title}"! Your issue has been resolved and we've sent you a confirmation email.`,
        type: 'resolution_email_sent'
      });

      res.json({
        msg: 'Resolution email sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        msg: 'Failed to send email',
        error: emailResult.error
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Upvote an issue
router.put('/upvote/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ msg: 'Issue not found' });

    // Check if user already upvoted — toggle
    const upvoted = issue.upvotes.some(vote => vote.toString() === req.user.id);
    if (upvoted) {
      issue.upvotes = issue.upvotes.filter(vote => vote.toString() !== req.user.id);
    } else {
      issue.upvotes.push(req.user.id);

      // Notify issue creator of upvote (only if not self-upvote)
      if (issue.createdBy.toString() !== req.user.id) {
        await Notification.create({
          userId: issue.createdBy,
          issueId: issue._id,
          message: `Someone upvoted your issue "${issue.title}". It now has ${issue.upvotes.length} upvotes!`,
          type: 'upvote'
        });
      }
    }
    
    await issue.save();
    res.json(issue.upvotes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete issue (Reported person only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ msg: 'Issue not found' });

    // Only the user who reported the issue can clear it
    if (issue.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized - Only the reporting user can clear this issue' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Issue removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Submit rating and review for a resolved issue (creator only)
router.put('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ msg: 'Please provide a rating between 1 and 5' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ msg: 'Issue not found' });

    // Verify status is resolved
    if (issue.status !== 'resolved') {
      return res.status(400).json({ msg: 'You can only rate resolved issues' });
    }

    // Verify ownership
    if (issue.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized - Only the creator of this issue can submit a rating and review' });
    }

    issue.rating = rating;
    issue.review = review || '';
    await issue.save();

    const populated = await Issue.findById(issue._id).populate('createdBy', 'name email');
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
