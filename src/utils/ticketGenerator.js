import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

/**
 * Menghasilkan Data URL gambar QR Code dari string tiket
 * @param {string} text - Kode tiket / data payload
 * @returns {Promise<string>} Data URL base64 image
 */
export async function generateQRCodeDataUrl(text) {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1E3A8A', // Dark Blue
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Gagal generate QR Code:', error);
    throw error;
  }
}

/**
 * Menghasilkan file PDF E-Ticket resmi FILKOM UNKLAB dan otomatis mengunduhnya
 * @param {Object} ticketData
 */
export async function downloadTicketPDF(ticketData) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5', // Ukuran tiket formal A5 (148 x 210 mm)
    });

    const qrDataUrl = await generateQRCodeDataUrl(
      ticketData.ticketCode || 'FILKOM-EVENT-PASS'
    );

    // 1. Header Banner Biru
    doc.setFillColor(30, 58, 138); // #1E3A8A Dark Blue
    doc.rect(0, 0, 148, 38, 'F');

    // Teks Header Universitas & Fakultas
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('UNIVERSITAS KLABAT', 74, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('FAKULTAS ILMU KOMPUTER (FILKOM)', 74, 22, { align: 'center' });

    doc.setFontSize(8);
    doc.text('OFFICIAL EVENT E-TICKET & PASS', 74, 29, { align: 'center' });

    // 2. Garis Aksen Emas / Biru Terang
    doc.setFillColor(37, 99, 235); // #2563EB Primary Blue
    doc.rect(0, 38, 148, 3, 'F');

    // 3. Nama Event
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    const eventTitle = ticketData.eventName || 'FILKOM Event';
    const splitTitle = doc.splitTextToSize(eventTitle, 128);
    doc.text(splitTitle, 74, 52, { align: 'center' });

    // 4. Kategori Event
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(37, 99, 235);
    doc.text(ticketData.category || 'Kegiatan Mahasiswa', 74, 62, {
      align: 'center',
    });

    // 5. Container Box Detail Peserta
    doc.setDrawColor(226, 232, 240); // Border slate-200
    doc.setFillColor(248, 250, 252); // Background slate-50
    doc.roundedRect(12, 68, 124, 48, 3, 3, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('NAMA PESERTA', 18, 76);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('helvetica', 'bold');
    doc.text(ticketData.userName || 'Mahasiswa FILKOM', 18, 81);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('NIM / IDENTITAS', 18, 90);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(ticketData.userNim || '10502210001', 18, 95);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TANGGAL & WAKTU', 76, 76);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`${ticketData.date || '20 Nov 2026'}`, 76, 81);
    doc.setFontSize(8);
    doc.text(`${ticketData.time || '09:00 WITA'}`, 76, 86);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('LOKASI KEGIATAN', 76, 94);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    const splitLocation = doc.splitTextToSize(
      ticketData.location || 'Auditorium Pioneer Chapel',
      56
    );
    doc.text(splitLocation, 76, 99);

    // 6. QR Code Section
    doc.addImage(qrDataUrl, 'PNG', 49, 120, 50, 50);

    // Kode Tiket Text
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text(ticketData.ticketCode || 'TECHFEST-2026-001', 74, 175, {
      align: 'center',
    });

    // 7. Security / Instructions Notice
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Tunjukkan tiket ini kepada panitia saat presensi di lokasi. Tiket berlaku untuk 1 orang.',
      74,
      182,
      { align: 'center' }
    );
    doc.text(
      `Diterbitkan oleh Sistem Informasi FILKOM UNKLAB - ${new Date().toLocaleDateString(
        'id-ID'
      )}`,
      74,
      186,
      { align: 'center' }
    );

    // Simpan file
    const safeCode = (ticketData.ticketCode || 'Tiket-FILKOM').replace(
      /[^a-zA-Z0-9_-]/g,
      '_'
    );
    doc.save(`E-Ticket_${safeCode}.pdf`);
  } catch (error) {
    console.error('Error saat membuat PDF E-Ticket:', error);
    throw error;
  }
}
