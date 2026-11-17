import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let cachedApiKey = '';
let cachedClient = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY belum disetel. Salin .env.example ke .env lalu isi API key Gemini.');
    error.statusCode = 503;
    throw error;
  }
  if (!apiKey.startsWith('AIzaSy')) {
    console.warn(
      '⚠️ PERINGATAN FORMAT API KEY: Kunci GEMINI_API_KEY Anda tidak diawali dengan "AIzaSy".\n' +
      'Google AI Studio API key resmi selalu diawali dengan "AIzaSy" (39 karakter).\n' +
      'Dapatkan kunci API resmi gratis di: https://aistudio.google.com/app/apikey'
    );
  }
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

export async function generateContent(prompt, { responseSchema } = {}) {
  const client = getClient();
  const configuredModel = process.env.GEMINI_MODEL?.trim();

  // Model publik resmi Google Gemini API
  // 'gemini-3.8-flash' bukan nama model publik Google AI Studio, maka dinormalisasi ke 'gemini-2.5-flash'
  const primaryModel = (!configuredModel || configuredModel === 'gemini-3.8-flash')
    ? 'gemini-2.5-flash'
    : configuredModel;

  const candidateModels = [
    primaryModel,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastCause = null;

  for (const model of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        ...(responseSchema ? { config: { responseMimeType: 'application/json', responseSchema } } : {}),
      });
      const result = response.text?.trim();
      if (result) return result;
    } catch (cause) {
      lastCause = cause;
      console.warn(`Percobaan model ${model} gagal:`, cause.message);
      // Jika model 404 (tidak ditemukan), coba model berikutnya
      if (/not found|404|unsupported|is not supported/i.test(cause.message)) {
        continue;
      }
      // Jika API Key tidak valid atau autentikasi ditolak, hentikan loop
      break;
    }
  }

  const detail = lastCause?.message || '';
  console.error('Gemini API request failed final:', detail);

  let message;
  if (!process.env.GEMINI_API_KEY?.trim()?.startsWith('AIzaSy')) {
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
