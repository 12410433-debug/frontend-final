import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

let cachedApiKey = '';
let cachedClient = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY belum disetel. Salin .env.example ke .env lalu isi API key Gemini.');
    error.statusCode = 503;
    throw error;
  }
  if (!apiKey.startsWith('AIzaSy') && !apiKey.startsWith('AQ.')) {
    console.warn(
      '⚠️ PERINGATAN FORMAT API KEY: Kunci GEMINI_API_KEY tidak dikenali.\n' +
      'Google AI Studio key biasanya diawali dengan "AIzaSy" (39 karakter).\n' +
      'Dapatkan kunci API resmi gratis di: https://aistudio.google.com/app/apikey'
    );
  }
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    // Gunakan v1beta agar model Gemini terbaru dapat diakses
    cachedClient = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1beta' } });
  }
  return cachedClient;
}

export async function generateContent(prompt, { responseSchema, systemInstruction } = {}) {
  const client = getClient();
  const configuredModel = process.env.GEMINI_MODEL?.trim();

  // Model publik resmi Google Gemini API
  const primaryModel = configuredModel || 'gemini-3.5-flash-lite';

  const candidateModels = [
    primaryModel,
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
  ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

  let lastCause = null;

  for (const model of candidateModels) {
    try {
      const config = {};
      if (responseSchema) {
        config.responseMimeType = 'application/json';
        config.responseSchema = responseSchema;
      }
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        ...(Object.keys(config).length > 0 ? { config } : {}),
      });
      const result = response.text?.trim();
      if (result) return result;
    } catch (cause) {
      lastCause = cause;
      console.warn(`Percobaan model ${model} gagal:`, cause.message);
      // Jika API Key tidak valid atau autentikasi ditolak, hentikan loop
      if (/API_KEY_INVALID|API key not valid|key not found|invalid api key/i.test(cause.message)) {
        break;
      }
      // Untuk 503 (high demand), 404, rate limit, dsb., coba model berikutnya
      continue;
    }
  }

  const rawDetail = lastCause?.message || '';
  // Redact raw key from error messages
  const detail = rawDetail
    .replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/(AQ\.[A-Za-z0-9_-]+)/g, '[REDACTED_KEY]')
    .replace(/(AIzaSy[A-Za-z0-9_-]{33})/g, '[REDACTED_KEY]');

  console.error('Gemini API request failed final:', detail);

  let message;
  const currentKey = process.env.GEMINI_API_KEY?.trim() || '';
  if (!currentKey.startsWith('AIzaSy') && !currentKey.startsWith('AQ.')) {
    message = 'GEMINI_API_KEY tidak valid. API Key Google AI Studio resmi harus diawali dengan "AIzaSy" (39 karakter). Buat kunci di https://aistudio.google.com/app/apikey lalu simpan di file .env.';
  } else if (/API_KEY_INVALID|API key not valid|key not found|invalid api key/i.test(detail)) {
    message = 'GEMINI_API_KEY tidak valid atau telah dicabut oleh Google. Silakan buat API Key baru di https://aistudio.google.com/app/apikey.';
  } else if (/quota|RESOURCE_EXHAUSTED|rate limit/i.test(detail)) {
    message = 'Batas kuota Gemini API tercapai (Rate limit). Silakan coba lagi beberapa saat.';
  } else {
    message = `Gemini API error (${detail || 'periksa koneksi internet dan API key'}).`;
  }

  const error = new Error(message);
  error.statusCode = 502;
  throw error;
}
