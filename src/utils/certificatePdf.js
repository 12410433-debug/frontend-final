import { jsPDF } from 'jspdf';

function displayDate(value) {
  if (!value) return 'Tanggal tidak tersedia';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar',
  }).format(date);
}

function hexToRgb(value) {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value || '');
  return match ? match.slice(1).map((part) => Number.parseInt(part, 16)) : [30, 58, 138];
}

export function buildCertificatePdf(certificate) {
  const { student, event, certificateNumber, issuedAt } = certificate || {};
  if (!student?.name || !student?.nim || !event?.title || !event?.date || !certificateNumber) {
    throw new Error('Data sertifikat belum lengkap untuk dibuat menjadi PDF.');
  }

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const width = 297;
  const height = 210;
  const center = width / 2;

  pdf.setProperties({
    title: `Sertifikat ${certificateNumber}`,
    subject: `Sertifikat partisipasi ${event.title}`,
    author: 'Fakultas Ilmu Komputer Universitas Klabat',
  });

  const template = certificate.template;
  if (template?.imageDataUrl) {
    const imageFormat = template.mimeType === 'image/png' ? 'PNG' : 'JPEG';
    pdf.addImage(template.imageDataUrl, imageFormat, 0, 0, width, height);
    const [red, green, blue] = hexToRgb(template.nameColor);
    const nameX = width * (Number(template.nameX ?? 50) / 100);
    const nameY = height * (Number(template.nameY ?? 55) / 100);
    pdf.setTextColor(red, green, blue);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(Number(template.fontSize ?? 28));
    pdf.text(student.name, nameX, nameY, { align: 'center', maxWidth: width - 34 });
    return pdf;
  }

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, width, height, 'F');
  pdf.setFillColor(30, 58, 138);
  pdf.rect(0, 0, width, 25, 'F');
  pdf.setFillColor(37, 99, 235);
  pdf.rect(0, 25, width, 2, 'F');

  pdf.setDrawColor(30, 58, 138);
  pdf.setLineWidth(1.2);
  pdf.rect(9, 9, width - 18, height - 18);
  pdf.setDrawColor(191, 219, 254);
  pdf.setLineWidth(0.45);
  pdf.rect(12, 12, width - 24, height - 24);

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(16);
  pdf.text('UNIVERSITAS KLABAT', center, 11, { align: 'center' });
  pdf.setFont('times', 'normal');
  pdf.setFontSize(9);
  pdf.text('FAKULTAS ILMU KOMPUTER', center, 18, { align: 'center' });

  pdf.setTextColor(30, 58, 138);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(27);
  pdf.text('SERTIFIKAT PARTISIPASI', center, 54, { align: 'center' });
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.8);
  pdf.line(91, 60, 206, 60);

  pdf.setTextColor(71, 85, 105);
  pdf.setFont('times', 'italic');
  pdf.setFontSize(13);
  pdf.text('Dengan ini diberikan kepada', center, 72, { align: 'center' });

  pdf.setTextColor(23, 37, 84);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(student.name.length > 32 ? 23 : 28);
  pdf.text(student.name, center, 88, { align: 'center', maxWidth: 230 });
  pdf.setDrawColor(191, 219, 254);
  pdf.setLineWidth(0.5);
  pdf.line(68, 93, 229, 93);

  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(51, 65, 85);
  pdf.text(`NIM ${student.nim}`, center, 101, { align: 'center' });
  pdf.text('Atas partisipasi dan kehadiran dalam kegiatan', center, 116, { align: 'center' });

  pdf.setTextColor(30, 58, 138);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(event.title.length > 52 ? 16 : 19);
  const eventLines = pdf.splitTextToSize(event.title, 225);
  pdf.text(eventLines, center, 128, { align: 'center' });
  const dateY = 128 + (eventLines.length - 1) * 7 + 9;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(51, 65, 85);
  pdf.text(displayDate(event.date), center, dateY, { align: 'center' });

  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.6);
  pdf.circle(40, 163, 11);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(30, 58, 138);
  pdf.text('FILKOM', 40, 162, { align: 'center' });
  pdf.setFont('times', 'normal');
  pdf.setFontSize(5.5);
  pdf.text('UNIVERSITAS KLABAT', 40, 166, { align: 'center' });

  pdf.setDrawColor(148, 163, 184);
  pdf.line(207, 164, 260, 164);
  pdf.setTextColor(51, 65, 85);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(9);
  pdf.text('Fakultas Ilmu Komputer', 233.5, 169, { align: 'center' });
  pdf.setFont('times', 'normal');
  pdf.setFontSize(8);
  pdf.text('Universitas Klabat', 233.5, 174, { align: 'center' });

  pdf.setFontSize(7.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Nomor Sertifikat: ${certificateNumber}`, center, 190, { align: 'center' });
  pdf.text(`Diterbitkan: ${displayDate(issuedAt)}`, center, 195, { align: 'center' });
  return pdf;
}

export function downloadCertificatePdf(certificate) {
  const pdf = buildCertificatePdf(certificate);
  const safeNumber = certificate.certificateNumber.replace(/[^a-zA-Z0-9-]/g, '_');
  pdf.save(`${safeNumber}.pdf`);
}
