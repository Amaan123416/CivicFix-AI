const Complaint = require('../models/Complaint');
const User = require('../models/User');
const analyzeComplaint = require('../utils/analyzeComplaint');

const getComplaintInput = (payload) => {
  const data = payload.data || payload.complaint || payload;

  return {
    title: data.title || data.subject,
    description: data.description || data.details,
    category: data.category || 'Other',
    priority: data.priority || 'Medium',
    location: data.location || data.address,
    imageUrl: data.imageUrl || data.image || '',
    citizenId: data.citizenId || data.userId || payload.userId,
    email: data.email || data.userEmail || payload.userEmail,
  };
};

const createComplaintFromWebhook = async (req, res, source) => {
  try {
    const input = getComplaintInput(req.body || {});

    if (!input.title || !input.description || !input.location) {
      return res.status(400).json({
        success: false,
        message: 'Complaint title, description, and location are required',
      });
    }

    const citizen = input.citizenId
      ? await User.findById(input.citizenId)
      : input.email
        ? await User.findOne({ email: input.email.toLowerCase().trim() })
        : null;

    if (!citizen) {
      return res.status(400).json({
        success: false,
        message: 'A registered citizenId or email is required to submit a complaint',
      });
    }

    const complaint = await Complaint.create({
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      location: input.location,
      imageUrl: input.imageUrl,
      citizen: citizen._id,
      aiAnalysis: analyzeComplaint(input),
    });

    const mongoComplaintId = complaint._id.toString();
    const complaintId = `CIV-${mongoComplaintId}`;
    const confirmationMessage = `Your complaint has been submitted successfully. Your complaint ID is ${complaintId}. You can use this ID to track your complaint.`;

    console.log(`${source} complaint created: ${complaintId}`);
    return res.status(201).json({
      success: true,
      message: confirmationMessage,
      confirmationMessage,
      complaintId,
      mongoComplaintId,
      complaint,
    });
  } catch (error) {
    console.error(`${source} webhook processing error:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create complaint from chatbot request',
    });
  }
};

const handleBotpressWebhook = async (req, res) => {
  return createComplaintFromWebhook(req, res, 'Botpress');
};

const handleN8nWebhook = async (req, res) => {
  return createComplaintFromWebhook(req, res, 'n8n');
};

module.exports = {
  handleBotpressWebhook,
  handleN8nWebhook,
};
