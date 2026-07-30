import React from 'react';
import { User, ViewMode } from '../types';
import { soundEngine } from '../utils/audio';
import { Play, Award, Volume2, ShieldAlert, CheckCircle2, FileText, Info, Compass } from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  onStartQuiz: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onStartQuiz,
  onNavigate,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Card - Vibrant Palette Signature White Card */}
      <div className="vibrant-card p-6 md:p-8 relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                Peserta Terverifikasi
              </span>
              <span className="text-xs font-mono font-bold text-[#4F46E5]">@{currentUser.username}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A]">
              Добро пожаловать! Selamat Datang,{' '}
              <span className="text-[#4F46E5]">
                {currentUser.namaLengkap}
              </span>
            </h2>
          </div>

          {/* Test Audio Button */}
          <button
            onClick={() => soundEngine.playCorrectSound()}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-semibold text-xs flex items-center gap-2 border border-slate-200 shadow-2xs transition-all"
            title="Uji Efek Suara Soal"
            id="test-sound-btn"
          >
            <Volume2 className="w-4 h-4 text-[#4F46E5]" />
            <span>Tes Audio Ujian</span>
          </button>
        </div>

        {/* Two Column Layout: Rules vs Launch Box */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Rules & Guidelines */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Petunjuk & Aturan Simulasi Ujian:</span>
            </div>

            <ul className="space-y-2.5 text-xs md:text-sm text-[#0F172A] font-medium">
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-[#0F172A]">Soal & Opsi Diacak:</strong> Setiap peserta menerima urutan soal dan pilihan ganda yang unik.
                </span>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-[#0F172A]">Sistem Anti-Kecurangan:</strong> Dilarang berpindah tab atau meminimalkan browser.
                </span>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-[#0F172A]">Efek Suara Audio:</strong> Gunakan headset/earphone untuk mendengar indikator suara.
                </span>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-[#0F172A]">Waktu Tempuh Dihitung:</strong> Timer berjalan dari detik pertama hingga soal terakhir.
                </span>
              </li>
            </ul>
          </div>

          {/* Launch Quiz Action Card */}
          <div className="flex flex-col justify-between bg-[#4F46E5] p-6 rounded-2xl text-center relative overflow-hidden shadow-sm text-white">
            <div className="mb-6 space-y-2.5">
              <div className="w-12 h-12 rounded-xl bg-white/10 text-sky-200 mx-auto flex items-center justify-center border border-white/20">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-white">Sistem Simulasi Siap</h3>
              <p className="text-xs text-indigo-100 font-medium leading-relaxed max-w-xs mx-auto">
                Klik tombol di bawah ini untuk memulai pengerjaan kuis.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  onStartQuiz();
                }}
                className="w-full bg-white hover:bg-slate-50 text-[#4F46E5] font-extrabold py-3.5 px-5 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-sm"
                id="start-quiz-btn"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Simulasi Kuis</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  onNavigate('leaderboard');
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-white/20 transition-all"
                id="dashboard-leaderboard-btn"
              >
                <Award className="w-4 h-4 text-sky-200" />
                <span>Lihat Papan Skor Peserta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
