const AutomationError = require('../models/AutomationError');

const MAKE_URL = process.env.MAKE_COMPLAINT_CREATED_WEBHOOK_URL;
const MAKE_API_KEY = process.env.MAKE_WEBHOOK_API_KEY;

/**
 * Sends a raw payload to Make.com via server-to-server POST request.
 * Automatically aborts if request exceeds MAKE_REQUEST_TIMEOUT_MS (default 5000ms).
 */
async function sendToMake(payload, targetUrl = MAKE_URL) {
  const webhookUrl = targetUrl || process.env.MAKE_COMPLAINT_CREATED_WEBHOOK_URL;
  const apiKey = process.env.MAKE_WEBHOOK_API_KEY;

  if (!webhookUrl) {
    throw new Error('Make webhook URL is not configured (MAKE_COMPLAINT_CREATED_WEBHOOK_URL)');
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.MAKE_REQUEST_TIMEOUT_MS || 5000);
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['x-make-apikey'] = apiKey;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseText = await response.text().catch(() => '');

    if (!response.ok) {
      throw new Error(`Make webhook failed: ${response.status} ${responseText}`);
    }

    return {
      success: true,
      status: response.status,
      response: responseText,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Builds standard complaint.created payload using saved complaint and its AI analysis.
 */
function buildComplaintCreatedPayload(complaint) {
  const complaintId = complaint.complaintId || `CIV-${complaint._id.toString()}`;
  const mongoComplaintId = complaint._id ? complaint._id.toString() : '';

  return {
    event: 'complaint.created',
    complaintId,
    mongoComplaintId,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    priority: complaint.priority || 'Medium',
    status: complaint.status || 'Pending',
    location: complaint.location,
    citizen: {
      id: complaint.citizen?._id ? complaint.citizen._id.toString() : undefined,
      name: complaint.citizen?.name || '',
      email: complaint.citizen?.email || '',
    },
    imageUrl: complaint.imageUrl || '',
    aiAnalysis: {
      category: complaint.aiAnalysis?.category || complaint.category,
      priority: complaint.aiAnalysis?.priority || complaint.priority || 'Medium',
      confidence: complaint.aiAnalysis?.confidence ?? 0,
      recommendation: complaint.aiAnalysis?.recommendation || '',
    },
    createdAt: complaint.createdAt,
  };
}

/**
 * Builds standard complaint.status_changed payload for status transition forwarding.
 */
function buildComplaintStatusChangedPayload(complaint, previousStatus) {
  const complaintId = complaint.complaintId || `CIV-${complaint._id.toString()}`;

  return {
    event: 'complaint.status_changed',
    complaintId,
    mongoComplaintId: complaint._id ? complaint._id.toString() : '',
    previousStatus,
    status: complaint.status,
    title: complaint.title,
    category: complaint.category,
    priority: complaint.priority,
    location: complaint.location,
    citizen: {
      name: complaint.citizen?.name || '',
      email: complaint.citizen?.email || '',
    },
    adminNotes: complaint.adminNotes || '',
    updatedAt: complaint.updatedAt,
  };
}

/**
 * Dispatches complaint.created to Make. If delivery fails, logs to AutomationError collection.
 */
async function notifyMakeComplaintCreated(complaint) {
  const payload = buildComplaintCreatedPayload(complaint);

  try {
    const result = await sendToMake(payload);
    console.log(`Complaint ${payload.complaintId} sent to Make successfully`);
    return result;
  } catch (error) {
    console.error(`Failed to send complaint ${payload.complaintId} to Make:`, error.message);

    try {
      await AutomationError.create({
        event: 'complaint.created',
        complaintId: payload.complaintId,
        failedModule: 'Make complaint webhook',
        errorMessage: error.message,
        payload,
      });
    } catch (dbErr) {
      console.error('Failed to log automation error to database:', dbErr.message);
    }
  }
}

/**
 * Dispatches complaint.status_changed to Make (uses MAKE_STATUS_WEBHOOK_URL or default).
 */
async function notifyMakeStatusChanged(complaint, previousStatus) {
  const payload = buildComplaintStatusChangedPayload(complaint, previousStatus);
  const statusWebhookUrl =
    process.env.MAKE_STATUS_WEBHOOK_URL || process.env.MAKE_COMPLAINT_CREATED_WEBHOOK_URL;

  try {
    const result = await sendToMake(payload, statusWebhookUrl);
    console.log(`Complaint ${payload.complaintId} status update sent to Make successfully`);
    return result;
  } catch (error) {
    console.error(`Failed to send status change for ${payload.complaintId} to Make:`, error.message);

    try {
      await AutomationError.create({
        event: 'complaint.status_changed',
        complaintId: payload.complaintId,
        failedModule: 'Make status webhook',
        errorMessage: error.message,
        payload,
      });
    } catch (dbErr) {
      console.error('Failed to log automation error to database:', dbErr.message);
    }
  }
}

module.exports = {
  sendToMake,
  buildComplaintCreatedPayload,
  buildComplaintStatusChangedPayload,
  notifyMakeComplaintCreated,
  notifyMakeStatusChanged,
};
