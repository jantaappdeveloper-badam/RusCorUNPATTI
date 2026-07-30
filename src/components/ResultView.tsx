import React, { useState, useEffect, useMemo } from 'react';
import { User, AnswerRecord, ViewMode } from '../types';
import { soundEngine } from '../utils/audio';
import { calculateRussianGrade } from '../utils/grade';
import { generateEvaluasiPDF } from '../utils/pdf';
import confetti from 'canvas-confetti';
import { Award, Download, RotateCcw, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, Sparkles, Printer, FolderCheck, FileText } from 'lucide-react';

interface ResultViewProps {
  currentUser: User | null;
  score: number;
  totalQuestions: number;
  elapsedSeconds: number;
  userAnswers: AnswerRecord[];
  onRestartQuiz: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  currentUser,
  score,
  totalQuestions,
  elapsedSeconds,
  userAnswers,
  onRestartQuiz,
  onNavigate,
}) => {
  const [showReview, setShowReview] = useState(false);

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const russianGrade = useMemo(
    () => calculateRussianGrade(score, totalQuestions, elapsedSeconds),
    [score, totalQuestions, elapsedSeconds]
  );

  // Calculate breakdown per category
  const categorySummary = useMemo(() => {
    const map: { [catName: string]: { correct: number; total: number } } = {};
    userAnswers.forEach((ans) => {
      const cat = ans.category || 'Umum';
      if (!map[cat]) map[cat] = { correct: 0, total: 0 };
      map[cat].total += 1;
      if (ans.isCorrect) map[cat].correct += 1;
    });
    return Object.entries(map).map(([name, stat]) => ({
      name,
      correct: stat.correct,
      total: stat.total,
      percentage: Math.round((stat.correct / stat.total) * 100),
    }));
  }, [userAnswers]);

  // Trigger sound & confetti on load
  useEffect(() => {
    soundEngine.playFanfareSound();

    if (percentage >= 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
      });
    }
  }, [percentage]);

  const handleDownloadTXT = () => {
    soundEngine.playClickSound();

    let content = "========================================================\n";
    content += "   REKAPITULASI RESULT SIMULASI OLIMPIADE BAHASA RUSIA   \n";
    content += "========================================================\n\n";
    content += `Nama Peserta   : ${currentUser ? currentUser.namaLengkap : 'Peserta'}\n`;
    content += `Nilai Rusia    : ${russianGrade.grade} - ${russianGrade.label}\n`;
    content += `Jawaban Benar  : ${score} dari ${totalQuestions} soal (${percentage}%)\n`;
    content += `Waktu Tempuh   : ${elapsedSeconds} detik\n`;
    content += `Tanggal Selesai: ${new Date().toLocaleString('id-ID')}\n`;
    content += "--------------------------------------------------------\n\n";

    if (categorySummary.length > 0) {
      content += "RINGKASAN PER KATEGORI:\n";
      categorySummary.forEach((cat) => {
        content += `  • ${cat.name}: ${cat.correct}/${cat.total} Benar (${cat.percentage}%)\n`;
      });
      content += "\n--------------------------------------------------------\n\n";
    }

    content += "RINCIAN JAWABAN PESERTA:\n\n";
    userAnswers.forEach((ans, idx) => {
      content += `[Soal ${idx + 1}] (${ans.category || 'Umum'}) ${ans.question}\n`;
      content += `  • Jawaban Anda : ${ans.selected} [${ans.isCorrect ? 'BENAR' : 'SALAH'}]\n`;
      content += `  • Jawaban Benar: ${ans.correct}\n\n`;
    });

    content += "========================================================\n";
    content += "     Moskow Russian Language Olympiad Simulation       \n";

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Hasil_Simulasi_Rusia_${currentUser?.namaLengkap.replace(/\s+/g, '_') || 'Peserta'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    soundEngine.playClickSound();
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Result Hero Card - Vibrant Palette Signature White Card */}
      <div className="vibrant-card p-6 md:p-10 text-center relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="relative z-10 max-w-lg mx-auto">
          {/* Trophy Badge */}
          <div className="w-16 h-16 rounded-2xl bg-[#4F46E5] p-1 mx-auto mb-3 shadow-sm">
            <div className="w-full h-full bg-[#4338CA] rounded-[12px] flex items-center justify-center">
              <Award className="w-8 h-8 text-sky-200" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-1">
            Simulasi Selesai!
          </h2>
          <p className="text-xs font-bold text-[#4F46E5] mb-5">
            Olimpiade Bahasa Rusia - Moskow
          </p>

          {/* Big Score Box with Russian Grade */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 mb-5 shadow-2xs">
            {/* Russian Grade Banner */}
            <div className="mb-4 inline-flex flex-col items-center">
              <div className={`px-5 py-2 rounded-xl bg-gradient-to-r ${russianGrade.bgClass} text-white font-black text-2xl md:text-3xl shadow-sm border border-white/30 flex items-center gap-2`}>
                <Sparkles className="w-5 h-5 text-sky-200" />
                <span>NILAI RUSIA: {russianGrade.grade}</span>
              </div>
              <span className="text-xs font-bold text-[#0F172A] mt-2 bg-indigo-50 px-3 py-0.5 rounded-md border border-indigo-100">
                {russianGrade.label}
              </span>
            </div>

            <div className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-1">
              {score} <span className="text-xl text-slate-400 font-semibold">/ {totalQuestions} Soal Benar</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-[#4F46E5] font-bold mb-2">
              AKURASI TOTAL: {percentage}%
            </p>
            <p className="text-xs text-[#64748B] font-medium max-w-md mx-auto mb-3 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
              {russianGrade.description}
            </p>

            <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-3 text-[#0F172A] font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>Waktu Pengerjaan:</span>
              </span>
              <span className="font-mono text-[#0F172A] font-bold">{elapsedSeconds} Detik</span>
            </div>
          </div>

          {/* Category Performance Breakdown */}
          {categorySummary.length > 0 && (
            <div className="bg-white rounded-xl p-4 mb-5 text-left border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 mb-1">
                <FolderCheck className="w-4 h-4 text-[#4F46E5]" />
                <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                  Hasil Berdasarkan Kategori
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categorySummary.map((cat, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-xs text-[#0F172A] truncate max-w-[140px]">
                        {cat.name}
                      </span>
                      <span className="font-bold text-xs text-[#0F172A] bg-slate-200/60 px-2 py-0.5 rounded-md">
                        {cat.correct}/{cat.total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cat.percentage >= 80
                            ? 'bg-emerald-500'
                            : cat.percentage >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 justify-center">
            <button
              onClick={async () => {
                soundEngine.playClickSound();
                await generateEvaluasiPDF(
                  currentUser,
                  score,
                  totalQuestions,
                  elapsedSeconds,
                  userAnswers,
                  categorySummary
                );
              }}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-2.5 px-4 rounded-xl text-xs md:text-sm flex items-center gap-1.5 shadow-sm transition-all"
              id="download-evaluasi-pdf-btn"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Download PDF Evaluasi</span>
            </button>

            <button
              onClick={handleDownloadTXT}
              className="bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-semibold py-2.5 px-4 rounded-xl text-xs md:text-sm flex items-center gap-1.5 border border-slate-200"
              id="download-result-btn"
            >
              <Download className="w-4 h-4 text-[#4F46E5]" />
              <span>Download TXT</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-semibold py-2.5 px-4 rounded-xl text-xs md:text-sm flex items-center gap-1.5 border border-slate-200"
              id="print-result-btn"
            >
              <Printer className="w-4 h-4 text-[#4F46E5]" />
              <span>Cetak</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClickSound();
                onNavigate('leaderboard');
              }}
              className="bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-semibold py-2.5 px-4 rounded-xl text-xs md:text-sm flex items-center gap-1.5 border border-slate-200"
              id="result-leaderboard-btn"
            >
              <Award className="w-4 h-4 text-[#4F46E5]" />
              <span>Papan Skor</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClickSound();
                onRestartQuiz();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs md:text-sm flex items-center gap-1.5 shadow-sm"
              id="restart-quiz-btn"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Answer Breakdown Review Accordion */}
      <div className="vibrant-card overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
        <button
          onClick={() => {
            soundEngine.playClickSound();
            setShowReview(!showReview);
          }}
          className="w-full p-4 md:p-5 flex items-center justify-between text-left text-[#0F172A] font-extrabold text-sm md:text-base hover:bg-slate-50 transition-colors"
          id="toggle-review-btn"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            <span>Tinjau Lembar Jawaban ({userAnswers.length} Soal)</span>
          </div>
          {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showReview && (
          <div className="p-5 pt-0 space-y-2.5 border-t border-slate-100">
            {userAnswers.map((ans, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border ${
                  ans.isCorrect
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1 border border-indigo-100">
                      {ans.category || 'Umum'}
                    </span>
                    <h4 className="font-bold text-[#0F172A] text-xs sm:text-sm">
                      {idx + 1}. {ans.question}
                    </h4>
                  </div>
                  {ans.isCorrect ? (
                    <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Benar
                    </span>
                  ) : (
                    <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Salah
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-0.5 text-[#0F172A] font-medium">
                  <p>
                    <span className="text-[#64748B] font-semibold">Jawaban Anda:</span>{' '}
                    <strong className={ans.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                      {ans.selected}
                    </strong>
                  </p>
                  {!ans.isCorrect && (
                    <p>
                      <span className="text-[#64748B] font-semibold">Jawaban Tepat:</span>{' '}
                      <strong className="text-emerald-700">{ans.correct}</strong>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
