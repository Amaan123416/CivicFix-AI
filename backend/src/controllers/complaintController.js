const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');
const analyzeComplaint = require('../utils/analyzeComplaint');

const isValidComplaintId = (id) => mongoose.Types.ObjectId.isValid(id);

const getPublicSummary = async (req, res) => {
  try {
    const [complaints, total, resolved] = await Promise.all([
      Complaint.find({}, 'title status priority category createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Resolved' }),
    ]);

    res.json({
      success: true,
      stats: { total, resolved, pending: await Complaint.countDocuments({ status: 'Pending' }) },
      complaints,
    });
  } catch (error) {
    console.error('Fetch public summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to load public summary' });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, priority, imageUrl } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and location are required',
      });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      location,
      priority: priority || 'Medium',
      imageUrl: imageUrl || '',
      citizen: req.user._id,
      aiAnalysis: analyzeComplaint({ title, description, category, priority }),
    });

    const populatedComplaint = await complaint.populate('citizen', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: populatedComplaint,
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
      error: error.message,
    });
  }
};

const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error('Fetch user complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message,
    });
  }
};

const getComplaintById = async (req, res) => {
  try {
    if (!isValidComplaintId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(req.params.id).populate('citizen', 'name email role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (req.user.role !== 'admin' && complaint.citizen._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error('Fetch complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
      error: error.message,
    });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('citizen', 'name email role').sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error('Fetch all complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message,
    });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!isValidComplaintId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint status',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    complaint.status = status;
    if (typeof adminNotes === 'string') {
      complaint.adminNotes = adminNotes.trim();
    }
    await complaint.save();
    await complaint.populate('citizen', 'name email role');

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint,
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message,
    });
  }
};

module.exports = {
  getPublicSummary,
  createComplaint,
  getUserComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
};
