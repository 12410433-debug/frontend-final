import fs from 'fs';
import path from 'path';
import { generateContent } from './gemini.js';
import { OFFICIAL_EVENTS, EVENT_KNOWLEDGE_BASE } from '../src/data/eventKnowledgeBase.js';

const ALLOWED_INTERESTS = [
  'UI/UX Design',
  'Web Development',
  'Cyber Security',
  'Artificial Intelligence',
  'Networking',
  'Graphic Design',
  'Data Science',
];

const recommendationSchema = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      eventId: { type: 'STRING' },
      reason: { type: 'STRING' },
    },
    required: ['eventId', 'reason'],
  },
};

const chatResponseSchema = {
  type: 'OBJECT',
  properties: {
    answer: { type: 'STRING' },
    eventIds: { type: 'ARRAY', items: { type: 'STRING' } },
    announcementIds: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['answer', 'eventIds', 'announcementIds'],
};

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function cleanText(value, limit = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function isPublished(item) {
  return String(item?.status || '').trim().toLowerCase() === 'published';
}

async function fetchCollection(name) {
  const baseUrl = (process.env.JSON_SERVER_URL || 'http://localhost:3001').replace(/\/+$/, '');
  try {
    const response = await fetch(baseUrl + '/' + name, { signal: AbortSignal.timeout(4000) });
    if (response.ok) {
      const rows = await response.json();
      if (Array.isArray(rows)) return rows;
    }
  } catch {
    // fallback directly to db.json
  }

  try {
    const dbPath = path.resolve(process.cwd(), 'db.json');
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (Array.isArray(data[name])) return data[name];
    }
  } catch {
    // ignore
  }

  throw httpError(503, 'JSON Server tidak dapat dihubungi. Pastikan server berjalan di port 3001.');
}

function witaToday() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type)?.value || '';
  return value('year') + '-' + value('month') + '-' + value('day');
}

export async function loadPublishedContext() {
  const [eventRows, announcementRows] = await Promise.all([
    fetchCollection('events'),
    fetchCollection('announcements'),
  ]);

  const events = eventRows
    .filter((event) => isPublished(event) && event.id != null && cleanText(event.title, 200))
    .map((event) => ({
      id: String(event.id),
      title: cleanText(event.title, 200),
      description: cleanText(event.description, 3000),
      category: cleanText(event.category, 100),
      date: cleanText(event.date, 40),
      startTime: cleanText(event.startTime, 20),
      endTime: cleanText(event.endTime, 20),
      location: cleanText(event.location, 300),
      fee: Number(event.registrationFee || event.price) > 0
        ? `Rp ${new Intl.NumberFormat('id-ID').format(Number(event.registrationFee || event.price))}`
        : 'Gratis',
      quota: event.quota == null || event.quota === '' || !Number.isFinite(Number(event.quota))
        ? null
        : Number(event.quota),
      registeredCount: Number.isFinite(Number(event.registeredCount)) ? Number(event.registeredCount) : 0,
    }))
    .slice(0, 100);

  const eventById = new Map(events.map((event) => [event.id, event]));

  const announcements = announcementRows
    .filter((item) => isPublished(item) && item.id != null && cleanText(item.title, 200))
    .filter((item) => !item.eventId || eventById.has(String(item.eventId)))
    .map((item) => ({
      id: String(item.id),
      title: cleanText(item.title, 200),
      content: cleanText(item.content, 5000),
      eventId: item.eventId ? String(item.eventId) : null,
      eventTitle: item.eventId ? eventById.get(String(item.eventId))?.title || '' : '',
      publishedAt: cleanText(item.publishedAt, 50),
    }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 100);

  return { events, announcements };
}

let cachedKbContext = null;

function getKnowledgeBaseContext() {
  if (cachedKbContext) return cachedKbContext;

  const categories = [...new Set(EVENT_KNOWLEDGE_BASE.map((f) => f.category))];
  const formattedCategories = categories.map((cat) => {
    const items = EVENT_KNOWLEDGE_BASE.filter((f) => f.category === cat);
    const qas = items.map((f) => `Tanya: ${f.question}\nJawab: ${f.answer}`).join('\n\n');
    return `[KATEGORI: ${cat}]\n${qas}`;
  }).join('\n\n---\n\n');

  const formattedEvents = OFFICIAL_EVENTS.map((e) => [
    `* ID: ${e.id} | ${e.title}`,
    `  Tanggal: ${e.formattedDate} (${e.date})`,
    `  Waktu: ${e.startTime} - ${e.endTime} ${e.timeZone}`,
    `  Lokasi: ${e.location}`,
    `  Biaya: ${e.feeLabel} (${e.fee === 0 ? 'Gratis' : 'Rp ' + Number(e.fee).toLocaleString('id-ID')})`,
    `  Kuota: Total ${e.quota} peserta, terdaftar ${e.registeredCount}, sisa kuota ${e.remainingQuota} kursi`,
    `  Penyelenggara: ${e.organizer}`,
    `  Kategori: ${e.category}`,
    `  Deskripsi: ${e.description}`,
    `  Persyaratan: ${e.requirements.join(', ')}`,
    `  Manfaat: ${e.benefits.join(', ')}`,
  ].join('\n')).join('\n\n');

  cachedKbContext = { formattedCategories, formattedEvents };
  return cachedKbContext;
}

async function generateJson(prompt, schema, systemInstruction) {
  const responseText = await generateContent(prompt, { responseSchema: schema, systemInstruction });
  try {
    return JSON.parse(responseText.trim());
  } catch {
    throw httpError(502, 'Jawaban terstruktur dari Gemini tidak dapat dibaca.');
  }
}

export async function recommendEvents(interests) {
  if (!Array.isArray(interests) || interests.length < 1 || interests.length > ALLOWED_INTERESTS.length
    || interests.some((interest) => !ALLOWED_INTERESTS.includes(interest))) {
    throw httpError(400, 'Pilih satu atau lebih minat yang tersedia.');
  }

  const { events } = await loadPublishedContext();
  const upcomingEvents = events.filter((event) => event.date && event.date >= witaToday());
  if (!upcomingEvents.length) {
    return { recommendations: [], message: 'Belum ada event Published mendatang yang cocok untuk direkomendasikan.' };
  }

  const prompt = [
    'Anda memilih rekomendasi event FILKOM berdasarkan minat mahasiswa.',
    'Pilih hanya ID event yang topik atau deskripsinya relevan dengan minat.',
    'Jangan membuat ID, alasan, jadwal, lokasi, kuota, atau detail baru yang tidak didukung data.',
    'Alasan harus singkat dan menghubungkan minat dengan topik yang tertulis dalam event.',
    'Jika tidak ada yang cocok, hasilkan array kosong.',
    'Konteks: ' + JSON.stringify({ interests, events: upcomingEvents }),
  ].join('\n');

  let result;
  try {
    result = await generateJson(prompt, recommendationSchema);
    if (!Array.isArray(result)) result = [];
  } catch (cause) {
    console.warn('Gemini rekomendasi offline/error, menggunakan pencocokan minat data lokal:', cause.message);
    const keywords = interests.flatMap((interest) => interest.toLowerCase().split(/\s+/));
    result = upcomingEvents
      .filter((event) => {
        const text = `${event.title} ${event.category} ${event.description}`.toLowerCase();
        return keywords.some((kw) => kw.length > 2 && text.includes(kw));
      })
      .map((event) => ({
        eventId: event.id,
        reason: `Event ini direkomendasikan karena topik "${event.category}" sesuai dengan minat yang Anda pilih (${interests.join(', ')}).`,
      }));
  }

  const eventById = new Map(upcomingEvents.map((event) => [event.id, event]));
  const seen = new Set();
  const recommendations = result
    .filter((item) => item && typeof item.eventId === 'string' && typeof item.reason === 'string')
    .map((item) => {
      const event = eventById.get(item.eventId);
      const reason = cleanText(item.reason, 450);
      if (!event || !reason || seen.has(event.id)) return null;
      seen.add(event.id);
      return { ...event, reason };
    })
    .filter(Boolean)
    .slice(0, 5);

  return {
    recommendations,
    message: recommendations.length ? '' : 'Belum ada event Published mendatang yang cocok dengan minat tersebut.',
  };
}

function normalizeHistory(history) {
  if (history == null) return [];
  if (!Array.isArray(history) || history.length > 12) {
    throw httpError(400, 'Riwayat percakapan tidak valid atau terlalu panjang.');
  }
  return history.map((entry) => {
    if (!entry || !['user', 'assistant'].includes(entry.role)
      || typeof entry.content !== 'string' || entry.content.length > 1500) {
      throw httpError(400, 'Format riwayat percakapan tidak valid.');
    }
    return { role: entry.role, content: entry.content.trim() };
  });
}

export async function answerStudentQuestion(question, history = []) {
  if (typeof question !== 'string' || !question.trim() || question.trim().length > 1200) {
    throw httpError(400, 'Pertanyaan wajib diisi dan maksimal 1200 karakter.');
  }
  const normalizedHistory = normalizeHistory(history);
  const { events, announcements } = await loadPublishedContext();
  const { formattedCategories, formattedEvents } = getKnowledgeBaseContext();

  const systemInstruction = [
    'Anda adalah AI Event Assistant Resmi Fakultas Ilmu Komputer (FILKOM) Universitas Klabat (UNKLAB).',
    'Tugas Anda adalah melayani dan menjawab pertanyaan mahasiswa seputar event kampus, pendaftaran, jadwal, lokasi, kuota, biaya, sertifikat, rekomendasi event, dan pengumuman dengan ramah, natural, sopan, dan 100% AKURAT.',
    '',
    '=== ATURAN UTAMA JAWABAN (SYSTEM INSTRUCTIONS KETAT) ===',
    '1. BAHASA & GAYA KOMUNIKASI:',
    '   - Selalu gunakan Bahasa Indonesia yang ramah, sopan, hangat, dan natural.',
    '   - Pahami bahasa formal maupun informal, termasuk istilah sehari-hari dan singkatan umum mahasiswa (misal: "min", "kpn", "dmn", "brp", "bsk", "ga", "figma gratis ga", "bisa batalin ga", dll).',
    '   - Pahami variasi pertanyaan yang memiliki maksud yang sama.',
    '',
    '2. BASIS FAKTA (KNOWLEDGE BASE 230 FAQ & 4 EVENT RESMI):',
    '   - Jawab berdasarkan KNOWLEDGE BASE RESMI (230 FAQ) dan DATA 4 EVENT RESMI yang disediakan di bawah.',
    '   - Prioritaskan jawaban dan detail dari Knowledge Base.',
    '',
    '3. ATURAN ANTI-HALUSINASI:',
    '   - DILARANG KERAS mengarang fakta, jadwal, lokasi, biaya, kuota, narasumber, atau persyaratan baru yang tidak ada pada knowledge base atau pengumuman resmi.',
    '   - Jika informasi TIDAK DITEMUKAN pada knowledge base atau data pengumuman resmi (misalnya: dresscode pakaian khusus yang belum ditentukan, narasumber yang belum dirilis), sampaikan secara jujur dan sopan bahwa informasi tersebut belum tersedia di sistem data resmi FILKOM dan sarankan untuk memantau pengumuman terbaru.',
    '',
    '4. PRIVASI & DATA AKUN MAHASISWA:',
    '   - Chatbot TIDAK terhubung langsung ke database riwayat pendaftaran pribadi akun mahasiswa demi privasi.',
    '   - Jangan pernah mengaku bisa melihat tiket, riwayat pendaftaran, atau status pembayaran akun mahasiswa tertentu.',
    '   - Arahkan mahasiswa untuk melihat tiket dan bukti pendaftaran mereka secara mandiri di menu "Riwayat Pendaftaran".',
    '',
    '5. PENDAFTARAN & PEMBATALAN:',
    '   - Jangan mengaku dapat melakukan pendaftaran atau pembatalan event secara langsung.',
    '   - Jelaskan alur resmi: Mahasiswa login -> masuk ke menu "Jelajahi Event" -> pilih event -> buka detail -> klik tombol "Daftar Event". Untuk pembatalan atau konfirmasi, hubungi panitia BEM FILKOM atau kelola di menu "Riwayat Pendaftaran".',
    '',
    '6. 4 EVENT RESMI UTAMA FILKOM:',
    '   - Workshop Machine Learning dengan Python — 25 November 2026 (Gratis, Lab Komputer FILKOM Lt. 2, Kuota 50, sisa 14).',
    '   - Pelatihan Desain UI/UX dengan Figma — 10 Desember 2026 (Gratis, Ruang Seminar FILKOM Lt. 3, Kuota 40, sisa 1).',
    '   - Malam Apresiasi Mahasiswa FILKOM 2026 — 18 Desember 2026 (Gratis, Gedung Olahraga UNKLAB, Kuota 250, sisa 94).',
    '   - FILKOM Day — 20 November 2026 (Rp 225.000, Lapangan & Gedung FILKOM UNKLAB, Kuota 300, sisa 70).',
    '',
    '7. PERTANYAAN LANJUTAN (FOLLOW-UP):',
    '   - Pertahankan konteks riwayat percakapan sebelumnya untuk memahami pertanyaan lanjutan secara berkesinambungan.',
    '',
    '8. FORMAT JSON:',
    '   - Kembalikan jawaban HANYA dalam JSON format { answer, eventIds, announcementIds }.',
    '   - eventIds: sertakan ID event ("e2", "e4", "e5", "93Z74tr8Cew") yang benar-benar relevan dengan pertanyaan (maksimal 3 eventIds). Kosongkan array jika pertanyaan umum.',
    '   - announcementIds: sertakan ID pengumuman jika relevan. Kosongkan jika tidak ada.',
  ].join('\n');

  const prompt = [
    systemInstruction,
    '',
    '=== DATA 4 EVENT RESMI FILKOM ===',
    formattedEvents,
    '',
    '=== PENGUMUMAN RESMI SISTEM TERBARU ===',
    JSON.stringify(announcements),
    '',
    '=== KNOWLEDGE BASE RESMI FILKOM (230 FAQ LENGKAP DARI 14 KATEGORI) ===',
    formattedCategories,
    '',
    '=== RIWAYAT PERCAKAPAN SEBELUMNYA ===',
    JSON.stringify(normalizedHistory),
    '',
    '=== PERTANYAAN MAHASISWA SAAT INI ===',
    JSON.stringify(question.trim()),
    '',
    'Kembalikan jawaban HANYA dalam format JSON sesuai schema.',
  ].join('\n');

  const eventById = new Map();
  for (const e of OFFICIAL_EVENTS) {
    eventById.set(e.id, {
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      fee: e.feeLabel,
      quota: e.quota,
      registeredCount: e.registeredCount,
    });
  }
  for (const e of events) {
    eventById.set(e.id, e);
  }

  const announcementById = new Map(announcements.map((item) => [item.id, item]));

  let answerText = '';
  let selectedEventIds = [];
  let selectedAnnouncementIds = [];
  try {
    const selection = await generateJson(prompt, chatResponseSchema, systemInstruction);
    if (selection && typeof selection.answer === 'string' && selection.answer.trim()) {
      answerText = selection.answer.trim();
      selectedEventIds = Array.isArray(selection.eventIds) ? selection.eventIds : [];
      selectedAnnouncementIds = Array.isArray(selection.announcementIds) ? selection.announcementIds : [];
    }
  } catch (cause) {
    console.error('Gemini generate response error:', cause.message);
    throw cause;
  }

  // Jika Gemini tidak menghasilkan jawaban terstruktur
  if (!answerText) {
    answerText = 'Mohon maaf, informasi mengenai hal tersebut belum ditemukan pada sistem data resmi event maupun pengumuman FILKOM saat ini. Silakan periksa kembali kata kunci Anda atau pantau pengumuman terbaru.';
  }

  const selectedEvents = [...new Set(selectedEventIds.filter((id) => typeof id === 'string'))]
    .map((id) => eventById.get(id))
    .filter(Boolean)
    .slice(0, 3);

  const selectedAnnouncements = [...new Set(selectedAnnouncementIds.filter((id) => typeof id === 'string'))]
    .map((id) => announcementById.get(id))
    .filter(Boolean)
    .slice(0, 3);

  return {
    message: answerText,
    events: selectedEvents,
    announcements: selectedAnnouncements,
  };
}
