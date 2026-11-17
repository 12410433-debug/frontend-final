import { jsPDF } from 'jspdf';

function money(value) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(value) || 0);
}

function dateTime(value) {
  if (!value) return 'Belum tersedia';
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Makassar',
  });
}

function eventDate(event) {
  if (!event?.date) return 'Belum tersedia';
  const date = new Date(event.date + 'T12:00:00');
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Makassar',
  }).format(date);
}

function drawField(pdf, label, value, y) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  pdf.text(label, 26, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(23, 37, 84);
  const lines = pdf.splitTextToSize(String(value || 'Belum tersedia'), 126);
  pdf.text(lines, 76, y);
  return y + Math.max(8, lines.length * 5);
}

export function downloadPaymentReceiptPdf(registration, student) {
  if (registration?.paymentStatus !== 'paid' || !registration?.receiptNumber) {
    throw new Error('Kwitansi baru tersedia setelah pembayaran dikonfirmasi oleh Admin/BEM.');
  }

  const event = registration.event || {};
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const width = 210;
  pdf.setProperties({
    title: 'Kwitansi ' + registration.receiptNumber,
    subject: 'Bukti pembayaran pendaftaran event FILKOM',
    author: 'Fakultas Ilmu Komputer Universitas Klabat',
  });

  pdf.setFillColor(30, 58, 138);
  pdf.rect(0, 0, width, 40, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text('UNIVERSITAS KLABAT', width / 2, 15, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('FAKULTAS ILMU KOMPUTER (FILKOM)', width / 2, 23, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text('FILKOM EVENT MANAGEMENT', width / 2, 31, { align: 'center' });

  pdf.setDrawColor(191, 219, 254);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(14, 49, width - 28, 232, 3, 3);
  pdf.setTextColor(23, 37, 84);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('KWITANSI PEMBAYARAN', 26, 64);
  pdf.setFillColor(220, 252, 231);
  pdf.roundedRect(156, 54, 28, 10, 3, 3, 'F');
  pdf.setTextColor(22, 101, 52);
  pdf.setFontSize(8);
  pdf.text('LUNAS', 170, 60.5, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text('Nomor Kwitansi', 26, 73);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 58, 138);
  pdf.text(String(registration.receiptNumber), 26, 79);

  let y = 94;
  const section = (title, top) => {
    pdf.setFillColor(239, 246, 255);
    pdf.roundedRect(23, top - 5, 164, 9, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 58, 138);
    pdf.text(title, 27, top + 1);
  };

  section('IDENTITAS PEMBAYAR', y);
  y += 12;
  y = drawField(pdf, 'Nama', student?.name || registration.studentName, y);
  y = drawField(pdf, 'NIM', student?.nim || registration.studentNim, y);
  y = drawField(pdf, 'Email', student?.email || registration.studentEmail, y);

  y += 2;
  section('DETAIL EVENT DAN PEMBAYARAN', y);
  y += 12;
  y = drawField(pdf, 'Nama event', event.title || 'Event FILKOM', y);
  y = drawField(pdf, 'Tanggal event', eventDate(event), y);
  y = drawField(pdf, 'Waktu', event.startTime ? event.startTime + (event.endTime ? ' - ' + event.endTime : '') : 'Belum tersedia', y);
  y = drawField(pdf, 'Lokasi', event.location, y);
  y = drawField(pdf, 'Jumlah dibayar', money(registration.registrationFee), y);
  y = drawField(pdf, 'Metode', registration.paymentMethod === 'transfer' ? 'Transfer bank' : 'Cash', y);
  y = drawField(pdf, 'Dikonfirmasi', dateTime(registration.paymentVerifiedAt), y);

  if (registration.paymentMethod === 'transfer' && registration.paymentAccountNumber) {
    y = drawField(pdf, 'Tujuan transfer', (registration.paymentBankName || '') + ' ' + registration.paymentAccountNumber + ' a.n. ' + (registration.paymentAccountName || ''), y);
  }
  if (registration.mealChoice || registration.shirtSize) {
    y += 2;
    section('PILIHAN PENGAMBILAN', y);
    y += 12;
    if (registration.mealChoice) y = drawField(pdf, 'Makanan', registration.mealChoice, y);
    if (registration.shirtSize) y = drawField(pdf, 'Ukuran baju', registration.shirtSize, y);
  }

  const footerY = Math.min(Math.max(y + 6, 258), 270);
  pdf.setDrawColor(191, 219, 254);
  pdf.line(26, footerY - 5, 184, footerY - 5);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text('Tunjukkan kwitansi ini kepada panitia saat mengambil konsumsi atau baju.', width / 2, footerY, { align: 'center', maxWidth: 158 });
  pdf.setFontSize(7);
  pdf.text('Dokumen digital FILKOM Event Management - Universitas Klabat', width / 2, 276, { align: 'center' });

  const safeNumber = String(registration.receiptNumber).replace(/[^a-zA-Z0-9-]/g, '_');
  pdf.save('Kwitansi_' + safeNumber + '.pdf');
}
