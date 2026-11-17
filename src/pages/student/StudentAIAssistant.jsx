import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import Alert from '../../components/Alert';
import Button from '../../components/Button';
import Card from '../../components/Card';
import aiAssistantService from '../../services/aiAssistantService';

const INTERESTS = [
  'UI/UX Design',
  'Web Development',
  'Cyber Security',
  'Artificial Intelligence',
  'Networking',
  'Graphic Design',
  'Data Science',
];

const QUICK_QUESTIONS = [
  'Event apa yang akan datang?',
  'Apakah ada seminar tentang UI/UX?',
  'Bagaimana cara mendaftar event?',
  'Event apa yang masih memiliki kuota?',
  'Apa pengumuman terbaru FILKOM?',
];

function aiFailureMessage(error, fallback) {
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response) return fallback;
  return 'Backend Express tidak dapat dihubungi di http://localhost:5000. Jalankan npm run dev, lalu pastikan GEMINI_API_KEY sudah diisi pada file .env.';
}

function formatEventDate(value) {
  if (!value) return 'Tanggal belum tersedia';
  const date = new Date(value + 'T00:00:00+08:00');
  if (Number.isNaN(date.getTime())) return 'Tanggal belum tersedia';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar',
  });
}

function formatAnnouncementDate(value) {
  if (!value) return 'Tanggal publikasi belum tersedia';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Tanggal publikasi belum tersedia';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar',
  });
}

function EventCard({ event }) {
  const remaining = event.quota == null ? null : Math.max(0, event.quota - (event.registeredCount || 0));
  const schedule = event.startTime || event.endTime
    ? (event.startTime || 'Waktu belum tersedia') + '–' + (event.endTime || 'Waktu belum tersedia') + ' WITA'
    : 'Waktu belum tersedia';

  return (
    <div className="mt-3 rounded-xl border border-blue-100 bg-white p-3 text-left">
      <h4 className="font-bold text-[#172554]">{event.title}</h4>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-blue-900"><CalendarDays className="h-3.5 w-3.5 shrink-0" />{formatEventDate(event.date)} · {schedule}</p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-blue-900"><MapPin className="h-3.5 w-3.5 shrink-0" />{event.location || 'Lokasi belum tersedia'}</p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-blue-900"><Users className="h-3.5 w-3.5 shrink-0" />{event.category || 'Kategori belum tersedia'} · Kuota {event.quota == null ? 'belum tersedia' : event.quota}{remaining == null ? '' : ' · Sisa ' + remaining}</p>
    </div>
  );
}

function AnnouncementCard({ announcement }) {
  return (
    <div className="mt-3 rounded-xl border border-blue-100 bg-white p-3 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-bold text-[#172554]">{announcement.title}</h4>
        <span className="text-[11px] font-semibold text-blue-700">{announcement.category || 'Kategori belum tersedia'}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{announcement.eventTitle ? 'Event: ' + announcement.eventTitle + ' · ' : ''}Dipublikasikan {formatAnnouncementDate(announcement.publishedAt)}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{announcement.content || 'Isi pengumuman belum tersedia.'}</p>
    </div>
  );
}

function ChatMessage({ item }) {
  const assistant = item.role === 'assistant';
  return (
    <div className={'flex ' + (assistant ? 'justify-start' : 'justify-end')}>
      <div className={'max-w-[92%] rounded-2xl p-4 sm:max-w-[84%] ' + (assistant
        ? 'border border-blue-100 bg-[#EFF6FF] text-[#172554]'
        : 'bg-[#2563EB] text-white')}>
        {assistant && <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-blue-800"><Bot className="h-4 w-4" />FILKOM AI Assistant</div>}
        <p className="whitespace-pre-line text-sm leading-relaxed">{item.content}</p>
        {item.events?.map((event) => <EventCard key={event.id} event={event} />)}
        {item.announcements?.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />)}
      </div>
    </div>
  );
}

export default function StudentAIAssistant() {
  const [interests, setInterests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationMessage, setRecommendationMessage] = useState('');
  const [recommendationError, setRecommendationError] = useState('');
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [chatError, setChatError] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, chatLoading]);

  const toggleInterest = (interest) => {
    setInterests((current) => current.includes(interest)
      ? current.filter((item) => item !== interest)
      : [...current, interest]);
    setRecommendations([]);
    setRecommendationMessage('');
  };

  const findRecommendations = async () => {
    setRecommendationError('');
    setRecommendationMessage('');
    if (!interests.length) {
      setRecommendationError('Pilih setidaknya satu minat terlebih dahulu.');
      return;
    }
    setRecommendationLoading(true);
    try {
      const result = await aiAssistantService.recommend(interests);
      setRecommendations(result.recommendations || []);
      setRecommendationMessage(result.message || '');
    } catch (error) {
      setRecommendationError(aiFailureMessage(error, 'Rekomendasi gagal dimuat. Periksa konfigurasi Gemini dan koneksi JSON Server.'));
    } finally {
      setRecommendationLoading(false);
    }
  };

  const sendQuestion = async (value) => {
    const message = String(value || '').trim();
    if (!message || chatLoading) return;
    setQuestion('');
    setChatError('');
    const history = messages.slice(-10).map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setChatLoading(true);
    try {
      const result = await aiAssistantService.chat(message, history);
      setMessages((current) => [...current, {
        role: 'assistant',
        content: result.message || 'Informasi tersebut belum tersedia pada data FILKOM.',
        events: result.events || [],
        announcements: result.announcements || [],
      }]);
    } catch (error) {
      setChatError(aiFailureMessage(error, 'AI Assistant gagal menjawab. Periksa konfigurasi Gemini dan koneksi JSON Server.'));
    } finally {
      setChatLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setChatError('');
    setQuestion('');
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 text-[#172554]">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-[#1D4ED8] to-[#3B82F6] p-6 text-white shadow-xl shadow-blue-200 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <Link to="/student" className="relative inline-flex items-center gap-2 text-xs font-bold text-blue-100 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Kembali ke Dashboard Mahasiswa</Link>
        <div className="relative mt-5 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20"><Sparkles className="h-6 w-6 text-amber-300" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Gemini AI · Data FILKOM Terkini</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">AI Event Assistant</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-100">Temukan event sesuai minat dan tanyakan jadwal, kuota, lokasi, pendaftaran, atau pengumuman berdasarkan data yang dipublikasikan.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <Card className="border border-[#BFDBFE] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Sparkles className="h-5 w-5" /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Rekomendasi Personal</p><h2 className="mt-1 text-lg font-extrabold">Pilih minat Anda</h2><p className="mt-1 text-sm text-slate-600">Gemini mencocokkan minat dengan event Published yang akan datang.</p></div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {INTERESTS.map((interest) => {
              const selected = interests.includes(interest);
              return <button
                key={interest}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleInterest(interest)}
                className={'rounded-full border px-3.5 py-2 text-xs font-bold transition ' + (selected
                  ? 'border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-200'
                  : 'border-blue-200 bg-white text-blue-900 hover:bg-blue-50')}
              >{interest}</button>;
            })}
          </div>

          {recommendationError && <div className="mt-4"><Alert type="error" message={recommendationError} onClose={() => setRecommendationError('')} /></div>}
          <Button className="mt-5 w-full sm:w-auto" icon={Sparkles} isLoading={recommendationLoading} disabled={recommendationLoading} onClick={findRecommendations}>Cari Rekomendasi</Button>
          {recommendationMessage && <p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">{recommendationMessage}</p>}

          {recommendations.length > 0 && <div className="mt-5 space-y-3">
            {recommendations.map((event) => <article key={event.id} className="rounded-2xl border border-[#BFDBFE] p-4 transition hover:border-blue-400 hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-extrabold">{event.title}</h3><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800">{event.category || 'Lainnya'}</span></div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-blue-900"><CalendarDays className="h-3.5 w-3.5" />{formatEventDate(event.date)} · {event.startTime || 'Waktu belum tersedia'}{event.endTime ? '–' + event.endTime : ''} WITA</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-blue-900"><MapPin className="h-3.5 w-3.5" />{event.location || 'Lokasi belum tersedia'}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{event.reason}</p>
            </article>)}
          </div>}
        </Card>

        <Card className="flex min-h-[640px] flex-col border border-[#BFDBFE] bg-white p-0 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-blue-100 p-4 sm:p-5">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><MessageCircle className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Tanya Jawab</p><h2 className="font-extrabold">Chat FILKOM</h2></div></div>
            <Button variant="ghost" size="sm" icon={Trash2} disabled={!messages.length && !chatError} onClick={clearConversation}>Hapus</Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5" aria-live="polite">
            {messages.length === 0 ? <div className="flex min-h-40 flex-col items-center justify-center text-center">
              <Bot className="h-10 w-10 text-blue-300" />
              <p className="mt-3 text-sm font-bold">Halo! Ada yang ingin Anda ketahui?</p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-600">Jawaban memakai event dan pengumuman Published terbaru dari JSON Server.</p>
            </div> : messages.map((item, index) => <ChatMessage key={item.role + '-' + index} item={item} />)}
            {chatLoading && <div className="flex items-center gap-2 text-xs font-semibold text-blue-800"><span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />Membaca data FILKOM dan menyiapkan jawaban...</div>}
            <div ref={chatEndRef} />
          </div>

          {chatError && <div className="px-4 sm:px-5"><Alert type="error" message={chatError} onClose={() => setChatError('')} /></div>}
          <div className="border-t border-blue-100 p-4 sm:p-5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-blue-800">Pertanyaan cepat</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((item) => <button
                key={item}
                type="button"
                disabled={chatLoading}
                onClick={() => sendQuestion(item)}
                className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-left text-[11px] font-semibold text-blue-900 transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
              >{item}</button>)}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); sendQuestion(question); }} className="flex items-end gap-2">
              <label className="sr-only" htmlFor="ai-question">Tulis pertanyaan</label>
              <textarea
                id="ai-question"
                rows={2}
                maxLength={1200}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendQuestion(question);
                  }
                }}
                placeholder="Tanyakan event, pengumuman, lokasi, jadwal, atau kuota..."
                className="min-w-0 flex-1 resize-none rounded-xl border border-[#BFDBFE] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" aria-label="Kirim pertanyaan" icon={Send} disabled={!question.trim() || chatLoading} isLoading={chatLoading} />
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
