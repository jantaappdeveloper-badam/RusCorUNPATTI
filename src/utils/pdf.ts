import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LeaderboardEntry, User, AnswerRecord } from '../types';
import { calculateRussianGrade } from './grade';

// Memory cache for TTF fonts supporting Cyrillic script
let cachedRobotoRegular: string | null = null;
let cachedRobotoBold: string | null = null;

/**
 * Helper to fetch a TTF font and convert to base64
 */
async function fetchFontAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.warn('Failed to load Cyrillic TTF font from:', url, err);
    return null;
  }
}

/**
 * Loads and registers Cyrillic-capable TTF fonts into jsPDF instance
 */
async function prepareCyrillicFonts(doc: jsPDF): Promise<boolean> {
  try {
    if (!cachedRobotoRegular) {
      cachedRobotoRegular =
        (await fetchFontAsBase64('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/static/Roboto-Regular.ttf')) ||
        (await fetchFontAsBase64('https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf'));
    }

    if (!cachedRobotoBold) {
      cachedRobotoBold =
        (await fetchFontAsBase64('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/roboto/static/Roboto-Bold.ttf')) ||
        (await fetchFontAsBase64('https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc9.ttf'));
    }

    let loadedAny = false;

    if (cachedRobotoRegular) {
      doc.addFileToVFS('Roboto-Regular.ttf', cachedRobotoRegular);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      loadedAny = true;
    }

    if (cachedRobotoBold) {
      doc.addFileToVFS('Roboto-Bold.ttf', cachedRobotoBold);
      doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
      loadedAny = true;
    } else if (cachedRobotoRegular) {
      // Fallback bold to regular if bold unavailable
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bold');
    }

    if (loadedAny) {
      doc.setFont('Roboto', 'normal');
      return true;
    }
  } catch (e) {
    console.error('Error preparing Cyrillic fonts in jsPDF:', e);
  }

  return false;
}

/**
 * Preserves text safely for PDF generation without destroying Russian Cyrillic letters
 */
export function cleanPdfText(text: string | null | undefined): string {
  if (!text) return '';
  return text;
}

/**
 * Formats Russian Grade for PDF output
 */
function getPdfGradeText(score: number, totalQuestions: number, timeSeconds: number): string {
  const gradeObj = calculateRussianGrade(score, totalQuestions, timeSeconds);
  return `${gradeObj.grade} (${gradeObj.label})`;
}

/**
 * Download Leaderboard PDF Report
 */
export async function generateLeaderboardPDF(leaderboardData: LeaderboardEntry[]): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const hasCyrillicFont = await prepareCyrillicFonts(doc);
  const fontName = hasCyrillicFont ? 'Roboto' : 'helvetica';

  // Header Background Banner
  doc.setFillColor(30, 27, 75); // Dark Indigo #1E1B4B
  doc.rect(0, 0, 210, 36, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont(fontName, 'bold');
  doc.setFontSize(14);
  doc.text('PAPAN SKOR SIMULASI OLIMPIADE BAHASA RUSIA', 105, 12, { align: 'center' });

  doc.setFont(fontName, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(254, 240, 138); // Yellow-200
  doc.text('Kuis dibuat oleh Russian Corner UNPATTI Ambon, by: Janta A. Imuly', 105, 19, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(224, 231, 255);
  doc.text(`Dicetak Pada: ${new Date().toLocaleString('id-ID')}`, 105, 26, { align: 'center' });

  // Summary Note
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(9);
  doc.setFont(fontName, 'bold');
  doc.text(`Total Peserta Terdaftar: ${leaderboardData.length} Orang`, 14, 43);

  // Table Data Preparation
  const tableRows = leaderboardData.map((entry, index) => {
    const rank = entry.rank || index + 1;
    const gradeText = getPdfGradeText(entry.score, entry.totalQuestions, entry.timeSeconds);
    return [
      rank <= 3 ? `#${rank} (${['Juara 1', 'Juara 2', 'Juara 3'][rank - 1]})` : `${rank}`,
      cleanPdfText(entry.name),
      gradeText,
      `${entry.score} / ${entry.totalQuestions}`,
      `${entry.timeSeconds}s`,
      cleanPdfText(entry.date),
    ];
  });

  // AutoTable
  autoTable(doc, {
    startY: 47,
    head: [['Rank', 'Nama Peserta', 'Nilai (Skala Rusia)', 'Jawaban Benar', 'Waktu', 'Tanggal']],
    body: tableRows,
    theme: 'grid',
    styles: {
      font: fontName,
      fontStyle: 'normal',
    },
    headStyles: {
      font: fontName,
      fontStyle: 'bold',
      fillColor: [30, 27, 75],
      textColor: [255, 255, 255],
      halign: 'center',
      fontSize: 9,
    },
    bodyStyles: {
      font: fontName,
      fontSize: 8.5,
      textColor: [30, 27, 75],
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
      1: { fontStyle: 'bold', cellWidth: 55 },
      2: { halign: 'center', fontStyle: 'bold', cellWidth: 46 },
      3: { halign: 'center', cellWidth: 26 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'right', cellWidth: 23 },
    },
    alternateRowStyles: {
      fillColor: [245, 247, 255],
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Halaman ${i} dari ${pageCount} - Russian Corner UNPATTI Ambon`,
      105,
      288,
      { align: 'center' }
    );
  }

  doc.save(`Papan_Skor_Olimpiade_Rusia_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Download Evaluasi PDF Report for Individual User
 */
export async function generateEvaluasiPDF(
  user: User | null,
  score: number,
  totalQuestions: number,
  elapsedSeconds: number,
  userAnswers: AnswerRecord[],
  categorySummary: Array<{ name: string; correct: number; total: number; percentage: number }>
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const hasCyrillicFont = await prepareCyrillicFonts(doc);
  const fontName = hasCyrillicFont ? 'Roboto' : 'helvetica';

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const gradeText = getPdfGradeText(score, totalQuestions, elapsedSeconds);
  const userName = cleanPdfText(user ? user.namaLengkap : 'Peserta Simulasi');

  // Header Banner
  doc.setFillColor(30, 27, 75); // Dark Indigo
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont(fontName, 'bold');
  doc.setFontSize(13);
  doc.text('LAPORAN HASIL & EVALUASI KESALAHAN SIMULASI', 105, 12, { align: 'center' });

  doc.setFont(fontName, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(254, 240, 138); // Yellow
  doc.text('Kuis dibuat oleh Russian Corner UNPATTI Ambon, by: Janta A. Imuly', 105, 19, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(224, 231, 255);
  doc.text(`Tanggal Selesai: ${new Date().toLocaleString('id-ID')}`, 105, 26, { align: 'center' });

  // Participant & Grade Card Box
  doc.setFillColor(243, 244, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(14, 42, 182, 38, 3, 3, 'FD');

  doc.setTextColor(30, 27, 75);
  doc.setFont(fontName, 'bold');
  doc.setFontSize(10);
  doc.text(`Nama Peserta: ${userName}`, 18, 50);

  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text(`Nilai Rusia (Grade): ${gradeText}`, 18, 57);

  doc.setFontSize(9.5);
  doc.setTextColor(30, 27, 75);
  doc.text(`Skor Benar: ${score} / ${totalQuestions} soal (${percentage}%)`, 18, 64);
  doc.text(`Waktu Pengerjaan: ${elapsedSeconds} detik`, 18, 71);

  let currentY = 85;

  // Category Summary if available
  if (categorySummary.length > 0) {
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 27, 75);
    doc.text('RINGKASAN PER KATEGORI:', 14, currentY);

    const catRows = categorySummary.map((cat) => [
      cleanPdfText(cat.name),
      `${cat.correct} / ${cat.total}`,
      `${cat.percentage}%`,
      cat.percentage >= 80 ? 'Sangat Baik' : cat.percentage >= 50 ? 'Cukup' : 'Perlu Evaluasi',
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Kategori', 'Benar', 'Akurasi', 'Keterangan']],
      body: catRows,
      theme: 'grid',
      styles: {
        font: fontName,
        fontStyle: 'normal',
      },
      headStyles: {
        font: fontName,
        fontStyle: 'bold',
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        halign: 'center',
      },
      bodyStyles: {
        font: fontName,
        fontSize: 8,
        textColor: [30, 27, 75],
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
        1: { halign: 'center', cellWidth: 35 },
        2: { halign: 'center', fontStyle: 'bold', cellWidth: 35 },
        3: { halign: 'center', cellWidth: 42 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Evaluation Questions Table
  doc.setFont(fontName, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 27, 75);
  doc.text('EVALUASI DETAIL JAWABAN & PEMBAHASAN:', 14, currentY);

  const questionRows = userAnswers.map((ans, idx) => [
    `${idx + 1}`,
    cleanPdfText(ans.category || 'Umum'),
    cleanPdfText(ans.question),
    cleanPdfText(ans.selected),
    cleanPdfText(ans.correct),
    ans.isCorrect ? 'BENAR' : 'SALAH',
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['No', 'Kategori', 'Soal Pertanyaan', 'Jawaban Anda', 'Kunci Benar', 'Status']],
    body: questionRows,
    theme: 'grid',
    styles: {
      font: fontName,
      fontStyle: 'normal',
    },
    headStyles: {
      font: fontName,
      fontStyle: 'bold',
      fillColor: [30, 27, 75],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      font: fontName,
      fontSize: 8,
      textColor: [30, 27, 75],
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 28 },
      2: { cellWidth: 62 },
      3: { cellWidth: 32 },
      4: { cellWidth: 32 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 5) {
        if (data.cell.raw === 'BENAR') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        } else {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
        }
      }
    },
  });

  // Footer Page Numbering
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Halaman ${i} dari ${pageCount} - Evaluasi Kuis Russian Corner UNPATTI Ambon`,
      105,
      288,
      { align: 'center' }
    );
  }

  const safeFileName = userName.replace(/\s+/g, '_') || 'Peserta';
  doc.save(`Evaluasi_Kuis_Rusia_${safeFileName}.pdf`);
}

