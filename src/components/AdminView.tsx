import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, ViewMode } from '../types';
import { fetchLeaderboard } from '../utils/csv';
import { calculateRussianGrade } from '../utils/grade';
import { soundEngine } from '../utils/audio';
import { Shield, Settings, Trash2, RotateCcw, Play, Code, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

interface AdminViewProps {
  gasWebAppUrl: string;
  onUpdateGasUrl: (url: string) => void;
  onStartQuiz: () => void;
  onNavigate: (view: ViewMode) => void;
  onShowModal: (title: string, message: string) => void;
}

const DEFAULT_GAS_CODE = `const SHEET_ID = '1lz5CSiOdqrJW0YkouWZ8-YvRC4m0J7cauENr-4tzPyQ';

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.action === 'getLeaderboard') {
      var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      var sheet = spreadsheet.getSheetByName('Scoreboard') || spreadsheet.getSheets()[0];
      var data = sheet.getDataRange().getValues();
      return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Simulasi Olimpiade Bahasa Rusia di Moskow')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  } catch(err) {
    return ContentService.createTextOutput("Backend Database Aktif: " + err.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) {
  var response = { status: 'success' };
  try {
    var params = JSON.parse(e.postData.contents);
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadsheet.getSheetByName('Scoreboard') || spreadsheet.getSheets()[0];
    
    if (params.action === 'addScore') {
      var data = sheet.getDataRange().getValues();
      var newUserKey = (params.data.username || params.data.namaLengkap || '').toString().toLowerCase().trim();
      var newBenar = parseInt(params.data.benar, 10) || 0;
      var newWaktu = parseInt(params.data.waktu, 10) || 0;
      var foundRowIndex = -1;
      var existingBenar = -1;
      var existingWaktu = 999999;

      for (var i = 1; i < data.length; i++) {
        var rowUserKey = (data[i][3] || data[i][1] || '').toString().toLowerCase().trim();
        if (rowUserKey === newUserKey && rowUserKey !== '') {
          foundRowIndex = i + 1;
          existingBenar = parseInt(data[i][4], 10) || 0;
          existingWaktu = parseInt(data[i][6], 10) || 0;
          break;
        }
      }

      var newRowData = [
        params.data.peringkat || "-",
        params.data.namaLengkap || "-",
        params.data.gradeRusia || "-",
        params.data.username || "-",
        newBenar,
        params.data.totalSoal || 10,
        newWaktu,
        params.data.status || "Selesai",
        params.data.tanggalSelesai || new Date().toLocaleString('id-ID')
      ];

      if (foundRowIndex > -1) {
        if (newBenar > existingBenar || (newBenar === existingBenar && newWaktu < existingWaktu)) {
          sheet.getRange(foundRowIndex, 1, 1, newRowData.length).setValues([newRowData]);
        }
      } else {
        sheet.appendRow(newRowData);
      }
    } else if (params.action === 'deleteRow') {
      sheet.deleteRow(params.rowIndex);
    } else if (params.action === 'resetBoard') {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }
    }
  } catch(err) {
    response.status = 'error';
    response.message = err.toString();
  }
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
};`;

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulasi Olimpiade Bahasa Rusia di Moskow</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React 18 & ReactDOM 18 -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  
  <!-- Babel Standalone for JSX in browser -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- jsPDF & AutoTable for PDF Export -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>

  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <style>
    body {
      background-color: #3b30bd;
      background-image: linear-gradient(135deg, #4f46e5 0%, #3b30bd 50%, #2e2a85 100%);
      min-height: 100vh;
      color: white;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useMemo } = React;

    // --- DATA SOAL OLIMPIADE BAHASA RUSIA ---
    const QUESTIONS = [
      { id: 1, question: "Manakah bentuk Genitiv (родительный падеж) tunggal yang benar untuk kata 'Москва'?", correct: "Москвы", wrong: ["Москве", "Москву", "Москвой"], category: "Tata Bahasa & Tata Kasus" },
      { id: 2, question: "Kata benda 'Книга' dalam bahasa Rusia termasuk jenis kelamin (род):", correct: "Женский род", wrong: ["Мужской род", "Средний род", "Общий род"], category: "Tata Bahasa & Tata Kasus" },
      { id: 3, question: "Bentuk plural (множественное число) dari kata 'Студент' adalah:", correct: "Студенты", wrong: ["Студента", "Студентам", "Студентов"], category: "Tata Bahasa & Tata Kasus" },
      { id: 4, question: "Manakah bentuk Предложный падеж (Prepositional case) dari 'Россия' dalam frasa 'в ...'?", correct: "в России", wrong: ["в Россию", "в Россией", "в Россия"], category: "Tata Bahasa & Tata Kasus" },
      { id: 5, question: "Lengkapi kalimat: 'Мы ждём ... на станции метро.' (Akusatif / Винительный)", correct: "друга", wrong: ["друг", "другу", "другом"], category: "Tata Bahasa & Tata Kasus" },
      { id: 6, question: "Lengkapi kalimat berikut: 'Я изучаю русский язык ..., чтобы поехать в Россию.'", correct: "усердно", wrong: ["усердный", "усердная", "усердные"], category: "Kata Kerja & Konjugasi" },
      { id: 7, question: "Manakah pasangan kata kerja (глагол) beraspek imperfektif dan perfektif yang benar untuk 'Membaca'?", correct: "Читать / Прочитать", wrong: ["Писать / Написать", "Говорить / Сказать", "Учить / Изучить"], category: "Kata Kerja & Konjugasi" },
      { id: 8, question: "Konjugasi kata kerja 'говорить' untuk subjek 'Мы' adalah:", correct: "говорим", wrong: ["говорю", "говоришь", "говорят"], category: "Kata Kerja & Konjugasi" },
      { id: 9, question: "Apa arti dari ungkapan bahasa Rusia 'Здравствуйте'?", correct: "Halo / Semoga Anda Sehat (Salam Formal)", wrong: ["Selamat Tinggal", "Terima Kasih Banyak", "Selamat Pagi Pertama"], category: "Kosakata & Frasa Sehari-hari" },
      { id: 10, question: "Apa sinonim kata 'Красивый' dalam bahasa Rusia?", correct: "Прекрасный", wrong: ["Плохой", "Быстрый", "Маленький"], category: "Kosakata & Frasa Sehari-hari" },
      { id: 11, question: "Apa sebutan untuk huruf-huruf abjad yang digunakan dalam bahasa Rusia?", correct: "Кириллица (Cyrillic)", wrong: ["Латиница (Latin)", "Глаголица", "Арабский"], category: "Kosakata & Frasa Sehari-hari" },
      { id: 12, question: "Di kota manakah Olimpiade Bahasa Rusia tingkat internasional ini secara historis berpusat?", correct: "Москва", wrong: ["Санкт-Петербург", "Казань", "Новосибирск"], category: "Kebudayaan & Sejarah Rusia" },
      { id: 13, question: "Siapakah penyair nasional legendaris Rusia yang dianggap sebagai bapak Bahasa Rusia Modern?", correct: "Александр Пушкин", wrong: ["Лев Толстой", "Фёдор Достоевский", "Антон Чехов"], category: "Kebudayaan & Sejarah Rusia" },
      { id: 14, question: "Nama bangunan bersejarah dan istana benteng utama di pusat kota Moskow adalah:", correct: "Московский Кремль", wrong: ["Эрмитаж", "Петергоф", "Большой театр"], category: "Kebudayaan & Sejarah Rusia" },
      { id: 15, question: "Bangunan gereja terkenal di Красная площадь (Red Square) dengan kubah berwarna-warni adalah:", correct: "Собор Василия Блаженного", wrong: ["Храм Христа Спасителя", "Исаакиевский собор", "Казанский собор"], category: "Kebudayaan & Sejarah Rusia" }
    ];

    // --- GRADING RUSIA ---
    function calculateGrade(score, total) {
      const pct = Math.round((score / total) * 100);
      if (pct >= 90) return { grade: "5+", label: "Sangat Sempurna (Отлично с плюсом)" };
      if (pct >= 80) return { grade: "5", label: "Sangat Baik (Отлично)" };
      if (pct >= 65) return { grade: "4", label: "Baik (Хорошо)" };
      if (pct >= 50) return { grade: "3", label: "Cukup (Удовлетворительно)" };
      return { grade: "2", label: "Kurang / Tidak Lulus (Неудовлетворительно)" };
    }

    // --- MAIN APP ---
    function App() {
      const [view, setView] = useState('login');
      const [user, setUser] = useState({ nama: '', email: '' });
      const [currentQIndex, setCurrentQIndex] = useState(0);
      const [answers, setAnswers] = useState({});

      // Login Screen
      if (view === 'login') {
        return (
          <div className="min-h-screen p-4 flex flex-col items-center justify-center max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <span className="bg-white/10 text-xs px-3 py-1 rounded-full border border-white/20 mb-3 inline-block font-semibold">
                🇷🇺 Moskow, Rusia • 2026
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold mb-2 text-white">
                Simulasi Olimpiade Bahasa Rusia
              </h1>
              <p className="text-xs md:text-sm text-sky-100/90 font-medium">
                Pusat Studi Bahasa Rusia UNPATTI Ambon • Ref: Janta A. Imuly
              </p>
            </div>

            <div className="bg-white text-slate-800 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl mb-8 border border-white/20">
              <h2 className="text-lg font-bold mb-4 text-center text-slate-900">Registrasi Peserta Ujian</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={user.nama}
                    onChange={(e) => setUser({ ...user, nama: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Username / ID</label>
                  <input
                    type="text"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    placeholder="Username atau NIK/NPM"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={() => {
                    if (user.nama.trim()) setView('quiz');
                    else alert('Silakan masukkan nama lengkap Anda terlebih dahulu.');
                  }}
                  className="w-full py-3 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg text-sm"
                >
                  Mulai Simulasi Kuis
                </button>
              </div>
            </div>

            {/* Slim 3 Cards Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-8">
              <div className="bg-white text-slate-800 rounded-xl p-3 border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
                  <i className="fa-solid fa-book text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5">Soal Standar Moskow</h3>
                  <p className="text-[11px] text-slate-500 leading-snug font-medium">
                    Materi mencakup Tata Bahasa (Падежи), Kosakata, Aspek Kata Kerja, dan Kebudayaan Rusia.
                  </p>
                </div>
              </div>

              <div className="bg-white text-slate-800 rounded-xl p-3 border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 mt-0.5">
                  <i className="fa-solid fa-lock text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5">Sistem Pengawasan</h3>
                  <p className="text-[11px] text-slate-500 leading-snug font-medium">
                    Perpindahan tab dan aksi salin-tempel terdeteksi secara otomatis untuk menjaga integritas simulasi.
                  </p>
                </div>
              </div>

              <div className="bg-white text-slate-800 rounded-xl p-3 border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                  <i className="fa-solid fa-trophy text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5">Papan Skor & Rekap</h3>
                  <p className="text-[11px] text-slate-500 leading-snug font-medium">
                    Hasil kuis tercatat secara langsung dan dapat diunduh sebagai sertifikat rekapitulasi ujian.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - White text */}
            <footer className="w-full pt-6 pb-2 text-center text-xs text-white font-medium flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/20">
              <div className="text-white">
                © 2026 Simulasi Olimpiade Bahasa Rusia di Moskow. Все права защищены.
              </div>
              <div className="flex items-center gap-3 text-white">
                <span className="text-white">Москва, Россия</span>
                <span className="text-white">•</span>
                <span className="text-white">Русский Язык</span>
              </div>
            </footer>
          </div>
        );
      }

      // Quiz Screen
      if (view === 'quiz') {
        const q = QUESTIONS[currentQIndex];
        const options = [q.correct, ...q.wrong].sort(() => 0.5 - Math.random());

        return (
          <div className="min-h-screen p-4 flex flex-col items-center justify-center max-w-2xl mx-auto">
            <div className="w-full flex items-center justify-between py-3 mb-4 text-xs font-bold border-b border-white/20">
              <span className="bg-white/10 px-3 py-1 rounded-lg">Soal {currentQIndex + 1} / {QUESTIONS.length}</span>
              <span className="bg-amber-400 text-slate-900 px-3 py-1 rounded-lg">{q.category}</span>
            </div>

            <div className="bg-white text-slate-900 p-6 md:p-8 rounded-2xl w-full shadow-2xl mb-6">
              <h2 className="text-base md:text-lg font-bold mb-6 text-slate-900 leading-relaxed">{q.question}</h2>
              <div className="space-y-3">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                    className={
                      answers[q.id] === opt
                        ? "w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition bg-[#4F46E5] text-white border-indigo-600 shadow-md"
                        : "w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between w-full">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(currentQIndex - 1)}
                className="px-4 py-2 bg-white/20 text-white rounded-xl text-xs font-bold disabled:opacity-30"
              >
                Sebelumnya
              </button>

              {currentQIndex < QUESTIONS.length - 1 ? (
                <button
                  onClick={() => setCurrentQIndex(currentQIndex + 1)}
                  className="px-5 py-2.5 bg-amber-400 text-slate-900 font-extrabold rounded-xl text-xs shadow-md hover:bg-amber-300"
                >
                  Selanjutnya
                </button>
              ) : (
                <button
                  onClick={() => setView('result')}
                  className="px-6 py-2.5 bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md hover:bg-emerald-600"
                >
                  Selesai & Kumpulkan
                </button>
              )}
            </div>
          </div>
        );
      }

      // Result Screen
      if (view === 'result') {
        let score = 0;
        QUESTIONS.forEach((q) => {
          if (answers[q.id] === q.correct) score++;
        });
        const g = calculateGrade(score, QUESTIONS.length);

        return (
          <div className="min-h-screen p-4 flex flex-col items-center justify-center max-w-md mx-auto text-center">
            <div className="bg-white text-slate-900 p-8 rounded-3xl w-full shadow-2xl">
              <h2 className="text-xl font-black mb-1">Hasil Evaluasi Kuis</h2>
              <p className="text-xs text-slate-500 mb-6">Simulasi Olimpiade Bahasa Rusia di Moskow</p>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                <div className="text-4xl font-black text-indigo-600 mb-1">{score} / {QUESTIONS.length}</div>
                <div className="text-xs text-slate-500 mb-3 font-semibold">Jawaban Benar</div>
                <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-900 font-black text-sm rounded-full">
                  Nilai Skala Rusia: {g.grade}
                </div>
                <div className="text-xs text-slate-600 mt-2 font-medium">{g.label}</div>
              </div>

              <button
                onClick={() => setView('login')}
                className="w-full py-3 bg-[#4F46E5] text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition"
              >
                Ulangi Ujian Kuis
              </button>
            </div>
          </div>
        );
      }

      return null;
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;

export const AdminView: React.FC<AdminViewProps> = ({
  gasWebAppUrl,
  onUpdateGasUrl,
  onStartQuiz,
  onNavigate,
  onShowModal,
}) => {
  const [inputUrl, setInputUrl] = useState(gasWebAppUrl);
  const [leaderboardRows, setLeaderboardRows] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'gs' | 'html'>('gs');

  const loadAdminLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeaderboard();
      setLeaderboardRows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminLeaderboard();
  }, []);

  const handleSaveGasUrl = () => {
    soundEngine.playClickSound();
    onUpdateGasUrl(inputUrl.trim());
    onShowModal('Konfigurasi Disimpan', 'URL Google Apps Script telah diperbarui!');
  };

  const handleDeleteRow = async (entry: LeaderboardEntry, idx: number) => {
    soundEngine.playClickSound();

    const targetName = entry.name || entry.username || `Baris ${idx + 1}`;

    if (window.confirm(`Yakin ingin menghapus peserta "${targetName}" dari papan skor?`)) {
      // Remove from local storage
      try {
        const saved = localStorage.getItem('LOCAL_LEADERBOARD');
        if (saved) {
          let localEntries: LeaderboardEntry[] = JSON.parse(saved);
          const targetKey = (entry.username || entry.name || '').toLowerCase().trim();
          localEntries = localEntries.filter(
            (e) => (e.username || e.name || '').toLowerCase().trim() !== targetKey
          );
          localStorage.setItem('LOCAL_LEADERBOARD', JSON.stringify(localEntries));
        }
      } catch (e) {
        console.error('Error updating local storage:', e);
      }

      // If GAS URL is configured, send request to Google Sheets as well
      if (inputUrl.trim()) {
        try {
          const rowIndex = entry.rowIndex || idx + 2;
          await fetch(inputUrl.trim(), {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'deleteRow', rowIndex }),
          });
          onShowModal('Data Dihapus', `Data "${targetName}" berhasil dihapus dari penyimpanan lokal dan Google Sheets.`);
        } catch (e) {
          console.error(e);
          onShowModal('Data Dihapus', `Data "${targetName}" berhasil dihapus dari papan skor lokal.`);
        }
      } else {
        onShowModal('Data Dihapus', `Data "${targetName}" berhasil dihapus dari papan skor.`);
      }

      setTimeout(loadAdminLeaderboard, 300);
    }
  };

  const handleResetBoard = async () => {
    soundEngine.playClickSound();

    if (
      window.confirm(
        'PERINGATAN! Yakin ingin MENGHAPUS SEMUA data papan skor? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      // Clear local storage
      localStorage.removeItem('LOCAL_LEADERBOARD');

      // If GAS URL is configured, send reset request to Google Sheets
      if (inputUrl.trim()) {
        try {
          await fetch(inputUrl.trim(), {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'resetBoard' }),
          });
          onShowModal('Papan Skor Dibersihkan', 'Semua data papan skor telah berhasil dihapus dari penyimpanan lokal dan Google Sheets.');
        } catch (e) {
          console.error(e);
          onShowModal('Papan Skor Dibersihkan', 'Semua data papan skor lokal berhasil dibersihkan.');
        }
      } else {
        onShowModal('Papan Skor Dibersihkan', 'Semua data papan skor berhasil dibersihkan.');
      }

      setTimeout(loadAdminLeaderboard, 300);
    }
  };

  const handleCopyCode = () => {
    const codeToCopy = activeCodeTab === 'gs' ? DEFAULT_GAS_CODE : DEFAULT_INDEX_HTML;
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner - Vibrant Palette Signature White Card */}
      <div className="vibrant-card p-5 md:p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center border border-indigo-100">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-[#0F172A]">Panel Administrator Utama</h2>
            <p className="text-xs text-[#64748B] font-medium">
              Kelola server Google Apps Script, konfigurasi papan skor, dan lakukan pengujian kuis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClickSound();
              onStartQuiz();
            }}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            id="admin-test-quiz-btn"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Mainkan Kuis (Tes)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClickSound();
              onNavigate('leaderboard');
            }}
            className="bg-slate-50 hover:bg-slate-100 text-[#0F172A] px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 transition-all"
            id="admin-view-leaderboard-btn"
          >
            Papan Skor
          </button>
        </div>
      </div>

      {/* GAS Web App Configuration Card */}
      <div className="vibrant-card p-5 md:p-6 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#0F172A] font-extrabold text-sm md:text-base">
            <Settings className="w-4 h-4 text-[#4F46E5]" />
            <span>Konfigurasi Integration Google Apps Script (GAS)</span>
          </div>

          <button
            onClick={() => setShowCodeModal(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-100 text-xs font-bold flex items-center gap-1 transition-colors"
            id="admin-view-script-code-btn"
          >
            <Code className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Lihat Script Code.gs</span>
          </button>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed font-medium">
          Masukkan URL Web App hasil deploy Google Apps Script untuk menghubungkan fitur tulis database (Hapus Baris, Reset Skor, Simpan Hasil) secara permanen ke Google Sheets.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#0F172A] text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] font-mono font-medium"
          />

          <button
            onClick={handleSaveGasUrl}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2 rounded-xl font-bold text-xs md:text-sm shrink-0 shadow-sm"
            id="admin-save-gas-url-btn"
          >
            Simpan URL
          </button>
        </div>
      </div>

      {/* Leaderboard Management Table */}
      <div className="vibrant-card p-5 md:p-6 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base">Manajemen Papan Skor Google Sheets</h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClickSound();
                loadAdminLeaderboard();
              }}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#0F172A] border border-slate-200"
              title="Refresh Table"
              id="admin-refresh-table-btn"
            >
              <RefreshCw className={`w-4 h-4 text-[#4F46E5] ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleResetBoard}
              className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              id="admin-reset-board-btn"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset Semua Skor</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-[#0F172A]">
            <thead className="bg-[#4F46E5] text-white uppercase text-[10px]">
              <tr>
                <th className="px-3.5 py-2.5 font-extrabold">Baris</th>
                <th className="px-3.5 py-2.5 font-extrabold">Nama Peserta</th>
                <th className="px-3.5 py-2.5 text-center font-extrabold">Nilai (Оценка)</th>
                <th className="px-3.5 py-2.5 text-center font-extrabold">Benar</th>
                <th className="px-3.5 py-2.5 text-center font-extrabold">Waktu</th>
                <th className="px-3.5 py-2.5 text-right font-extrabold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-[#4F46E5] font-semibold">
                    Memuat data...
                  </td>
                </tr>
              ) : leaderboardRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-[#64748B] font-semibold">
                    Papan skor kosong.
                  </td>
                </tr>
              ) : (
                leaderboardRows.map((row, idx) => {
                  const russianGrade = calculateRussianGrade(row.score, row.totalQuestions, row.timeSeconds);
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3.5 py-2 font-bold text-slate-400">{row.rowIndex || idx + 2}</td>
                      <td className="px-3.5 py-2 font-semibold text-[#0F172A]">
                        <div>{row.name}</div>
                      </td>
                      <td className="px-3.5 py-2 text-center font-bold">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${russianGrade.colorClass}`}>
                          {russianGrade.grade}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 text-center text-emerald-600 font-extrabold">{row.score}</td>
                      <td className="px-3.5 py-2 text-center text-[#0F172A] font-mono font-bold">{row.timeSeconds}s</td>
                      <td className="px-3.5 py-2 text-right">
                        <button
                          onClick={() => handleDeleteRow(row, idx)}
                          className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200 cursor-pointer"
                          title="Hapus Peserta Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="vibrant-card p-6 md:p-8 max-w-2xl w-full text-[#1E1B4B] space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-indigo-100 pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                <span>Source Code Google Apps Script</span>
              </h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-indigo-400 hover:text-indigo-900 text-sm bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  setActiveCodeTab('gs');
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeCodeTab === 'gs'
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Code.gs (Backend & Database)
              </button>
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  setActiveCodeTab('html');
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeCodeTab === 'html'
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                index.html (Tampilan Web App)
              </button>
            </div>

            <p className="text-xs text-indigo-900/80 font-medium">
              {activeCodeTab === 'gs'
                ? 'Salin isi Code.gs berikut ke Google Apps Script untuk menghubungkan fitur tulis/baca database Google Sheets.'
                : 'Salin isi index.html berikut ke file index.html di Google Apps Script agar tampilan web app muncul sempurna.'}
            </p>

            <div className="relative">
              <pre className="bg-indigo-950 p-4 rounded-2xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-72 border border-indigo-900">
                {activeCodeTab === 'gs' ? DEFAULT_GAS_CODE : DEFAULT_INDEX_HTML}
              </pre>

              <button
                onClick={handleCopyCode}
                className="absolute top-3 right-3 btn-vibrant-yellow px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin!' : `Salin ${activeCodeTab === 'gs' ? 'Code.gs' : 'index.html'}`}</span>
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-indigo-100 hover:bg-indigo-200 font-extrabold text-xs text-indigo-950"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
