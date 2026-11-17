import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateContent } from './gemini.js';
import { answerStudentQuestion, recommendEvents } from './aiAssistant.js';
import { notifyCertificateIssued, notifyPaymentApproved, notifyPublishedAnnouncement, notifyPublishedEvent, notifyRegistration, smtpHealth, verifySmtp } from './notificationHandlers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    smtpConfigured: smtpHealth().configured,
    message: 'Backend AI Event Assistant FILKOM berjalan normal',
    timestamp: new Date().toISOString(),
  });
});

function sendError(res, error) {
  const status = Number.isInteger(error.statusCode) ? error.statusCode : 502;
  console.error('AI endpoint error:', error.message);
  return res.status(status).json({
    success: false,
    error: error.message || 'Terjadi kesalahan saat memproses permintaan AI.',
  });
}

app.get('/api/notifications/health', (_req, res) => {
  res.json({ success: true, ...smtpHealth() });
});

app.post('/api/notifications/verify', async (req, res) => {
  try {
    return res.json(await verifySmtp(req.body?.actorId));
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/notifications/payments/approved', async (req, res) => {
  try {
    const result = await notifyPaymentApproved(req.body?.registrationId, req.body?.actorId);
    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/notifications/certificates/issued', async (req, res) => {
  try {
    const result = await notifyCertificateIssued(req.body?.certificateId, req.body?.actorId);
    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/notifications/events/published', async (req, res) => {
  try {
    const result = await notifyPublishedEvent(req.body?.eventId, req.body?.actorId);
    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/notifications/announcements', async (req, res) => {
  try {
    const result = await notifyPublishedAnnouncement(req.body?.announcementId, req.body?.actorId);
    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/notifications/registrations', async (req, res) => {
  try {
    const result = await notifyRegistration(req.body?.registrationId, req.body?.actorId);
    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
});
app.post('/api/gemini/generate', async (req, res) => {
  const prompt = req.body?.prompt;
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 5000) {
    return res.status(400).json({ success: false, error: 'Prompt wajib diisi dan maksimal 5000 karakter.' });
  }

  try {
    const result = await generateContent(prompt.trim());
    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/ai/recommendations', async (req, res) => {
  try {
    const result = await recommendEvents(req.body?.interests);
    return res.json({ success: true, ...result });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const result = await answerStudentQuestion(req.body?.message, req.body?.history);
    return res.json({ success: true, ...result });
  } catch (error) {
    return sendError(res, error);
  }
});

app.listen(PORT, () => {
  console.log('Server Express berjalan pada http://localhost:' + PORT);
});
