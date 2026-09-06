const dotenv = require('dotenv');
const { sendToMake, buildComplaintCreatedPayload } = require('../src/services/makeAutomation.service');

dotenv.config();

const runTest = async () => {
  const webhookUrl = process.env.MAKE_COMPLAINT_CREATED_WEBHOOK_URL;
  const apiKey = process.env.MAKE_WEBHOOK_API_KEY;

  console.log('--- Make.com Webhook Test Trigger ---');
  if (!webhookUrl) {
    console.error('❌ Error: MAKE_COMPLAINT_CREATED_WEBHOOK_URL is not defined in backend/.env');
    console.log('\nPlease add your Make webhook configuration to backend/.env:');
    console.log('MAKE_COMPLAINT_CREATED_WEBHOOK_URL=https://hook.make.com/your-webhook-url');
    console.log('MAKE_WEBHOOK_API_KEY=your-make-webhook-key');
    console.log('MAKE_REQUEST_TIMEOUT_MS=5000\n');
    return;
  }

  console.log(`📡 Destination: ${webhookUrl}`);
  console.log(`🔑 x-make-apikey: ${apiKey ? apiKey : 'Not set'}`);
  console.log(`⏱️ Timeout: ${process.env.MAKE_REQUEST_TIMEOUT_MS || 5000}ms`);

  const sampleComplaint = {
    _id: '68c7401d8e12bfa93a105c89',
    complaintId: 'CIV-68C7401D8E12BFA93A105C89',
    title: 'Street light is not working',
    description: 'The street light near the main road is broken and dark at night.',
    category: 'Streetlight',
    priority: 'High',
    status: 'Pending',
    location: 'Main Road',
    imageUrl: '',
    citizen: {
      _id: '6a9bf429fe5c52d43568ee22',
      name: 'Citizen Name',
      email: 'citizen@example.com',
    },
    aiAnalysis: {
      confidence: 0.88,
      recommendation: 'Electrical maintenance inspection required',
      category: 'Streetlight',
      priority: 'High',
    },
    createdAt: new Date(),
  };

  const payload = buildComplaintCreatedPayload(sampleComplaint);

  console.log('\n📦 Sending payload to Make.com:');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const result = await sendToMake(payload);
    console.log(`\n✅ SUCCESS: Make.com accepted the payload (HTTP status: ${result.status})`);
    console.log('🎉 Check your Make.com scenario: the Webhook module should show the execution log and data.');
  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}`);
  }
};

runTest();
