/**
 * Sends a complaint payload to the configured Make.com webhook.
 * This runs entirely on the backend to keep the webhook URL and API key secure.
 */
const sendMakeWebhook = async (complaint) => {
  const webhookUrl = process.env.MAKE_COMPLAINT_CREATED_WEBHOOK_URL;
  if (!webhookUrl) {
    return { skipped: true, reason: 'MAKE_COMPLAINT_CREATED_WEBHOOK_URL not configured' };
  }

  const apiKey = process.env.MAKE_WEBHOOK_API_KEY;
  const mongoId = complaint._id ? complaint._id.toString() : 'mock-id';
  const complaintId = `CIV-${mongoId.slice(-6).toUpperCase()}`;

  const payload = {
    event: 'complaint.created',
    complaintId,
    mongoId,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    priority: complaint.priority || 'Medium',
    status: complaint.status || 'Pending',
    location: complaint.location,
    imageUrl: complaint.imageUrl || '',
    citizen: {
      name: complaint.citizen?.name || 'Citizen User',
      email: complaint.citizen?.email || 'citizen@example.com',
    },
    aiAnalysis: {
      confidence: complaint.aiAnalysis?.confidence ?? 0.88,
      recommendation:
        complaint.aiAnalysis?.recommendation ||
        'Review the report and assign it to the relevant municipal department.',
      category: complaint.aiAnalysis?.category || complaint.category,
      priority: complaint.aiAnalysis?.priority || complaint.priority || 'Medium',
    },
    createdAt: complaint.createdAt
      ? new Date(complaint.createdAt).toISOString()
      : new Date().toISOString(),
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['x-api-key'] = apiKey;
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[Make.com Webhook] Failed with status ${response.status}: ${errorText}`);
      return { success: false, status: response.status, error: errorText };
    }

    console.log(`[Make.com Webhook] Successfully sent complaint ${complaintId} to Make.com`);
    return { success: true, status: response.status };
  } catch (error) {
    console.error('[Make.com Webhook] Network error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendMakeWebhook;
