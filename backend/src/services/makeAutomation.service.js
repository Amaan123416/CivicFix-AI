const AutomationError = require('../models/AutomationError');

const N8N_COMPLAINT_WEBHOOK_URL =
  process.env.N8N_COMPLAINT_WEBHOOK_URL;

const N8N_STATUS_WEBHOOK_URL =
  process.env.N8N_STATUS_WEBHOOK_URL ||
  process.env.N8N_COMPLAINT_WEBHOOK_URL;

/**
 * Sends a payload to n8n using a server-to-server POST request.
 */
async function sendToN8N(payload, targetUrl) {
  const webhookUrl = targetUrl;

  if (!webhookUrl) {
    throw new Error('n8n webhook URL is not configured');
  }

  const controller = new AbortController();

  const timeoutMs = Number(
    process.env.N8N_REQUEST_TIMEOUT_MS || 5000
  );

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseText = await response.text().catch(() => '');

    if (!response.ok) {
      throw new Error(
        `n8n webhook failed: ${response.status} ${responseText}`
      );
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
 * Builds complaint.created payload.
 */
function buildComplaintCreatedPayload(complaint) {
  const complaintId =
    complaint.complaintId ||
    `CIV-${complaint._id.toString()}`;

  const mongoComplaintId = complaint._id
    ? complaint._id.toString()
    : '';

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
      id: complaint.citizen?._id
        ? complaint.citizen._id.toString()
        : '',
      name: complaint.citizen?.name || '',
      email: complaint.citizen?.email || '',
    },

    imageUrl: complaint.imageUrl || '',

    aiAnalysis: {
      category:
        complaint.aiAnalysis?.category ||
        complaint.category,

      priority:
        complaint.aiAnalysis?.priority ||
        complaint.priority ||
        'Medium',

      confidence:
        complaint.aiAnalysis?.confidence ?? 0,

      recommendation:
        complaint.aiAnalysis?.recommendation || '',
    },

    createdAt: complaint.createdAt,
  };
}

/**
 * Builds complaint.status_changed payload.
 */
function buildComplaintStatusChangedPayload(
  complaint,
  previousStatus
) {
  const complaintId =
    complaint.complaintId ||
    `CIV-${complaint._id.toString()}`;

  return {
    event: 'complaint.status_changed',

    complaintId,

    mongoComplaintId: complaint._id
      ? complaint._id.toString()
      : '',

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
 * Sends complaint.created event to n8n.
 *
 * Function name kept for compatibility with existing controller.
 */
async function notifyMakeComplaintCreated(complaint) {
  const payload =
    buildComplaintCreatedPayload(complaint);

  try {
    const result = await sendToN8N(
      payload,
      N8N_COMPLAINT_WEBHOOK_URL
    );

    console.log(
      `Complaint ${payload.complaintId} sent to n8n successfully`
    );

    return result;
  } catch (error) {
    console.error(
      `Failed to send complaint ${payload.complaintId} to n8n:`,
      error.message
    );

    try {
      await AutomationError.create({
        event: 'complaint.created',
        complaintId: payload.complaintId,
        failedModule: 'n8n complaint webhook',
        errorMessage: error.message,
        payload,
      });
    } catch (dbErr) {
      console.error(
        'Failed to log automation error to database:',
        dbErr.message
      );
    }
  }
}

/**
 * Sends complaint.status_changed event to n8n.
 *
 * Function name kept for compatibility with existing controller.
 */
async function notifyMakeStatusChanged(
  complaint,
  previousStatus
) {
  const payload =
    buildComplaintStatusChangedPayload(
      complaint,
      previousStatus
    );

  try {
    const result = await sendToN8N(
      payload,
      N8N_STATUS_WEBHOOK_URL
    );

    console.log(
      `Complaint ${payload.complaintId} status update sent to n8n successfully`
    );

    return result;
  } catch (error) {
    console.error(
      `Failed to send status change for ${payload.complaintId} to n8n:`,
      error.message
    );

    try {
      await AutomationError.create({
        event: 'complaint.status_changed',
        complaintId: payload.complaintId,
        failedModule: 'n8n status webhook',
        errorMessage: error.message,
        payload,
      });
    } catch (dbErr) {
      console.error(
        'Failed to log automation error to database:',
        dbErr.message
      );
    }
  }
}

module.exports = {
  sendToN8N,
  buildComplaintCreatedPayload,
  buildComplaintStatusChangedPayload,
  notifyMakeComplaintCreated,
  notifyMakeStatusChanged,
};