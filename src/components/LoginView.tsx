import React, { useState } from 'react';
import { User, ViewMode } from '../types';
import { authenticateUser } from '../utils/csv';
import { soundEngine } from '../utils/audio';
import { LeaderboardView } from './LeaderboardView';
import { Sparkles, ArrowRight, BookOpen, Award, Lock } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onShowModal: (title: string, message: string) => void;
  onNavigate?: (view: ViewMode) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onShowModal, onNavigate }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (overrideUsername?: string) => {
    soundEngine.playClickSound();
    const targetUsername = overrideUsername !== undefined ? overrideUsername : usernameInput;

    if (!targetUsername.trim()) {
      onShowModal('Login Diperlukan', 'Silakan masukkan username Anda terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await authenticateUser(targetUsername);

      if (user) {
        onLoginSuccess(user);
      } else {
        onShowModal(
          'Username Tidak Ditemukan',
          'Username tidak terdaftar dalam database peserta. Silakan periksa kembali username Anda.'
        );
      }
    } catch (err) {
      console.error(err);
      onShowModal('Gangguan Koneksi', 'Gagal memverifikasi data peserta. Menggunakan mode peserta umum.');
      onLoginSuccess({
        username: targetUsername.toLowerCase().trim(),
        namaLengkap: `Peserta (${targetUsername})`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Hero Banner Card - Slim & Eye-Catching */}
      <div className="vibrant-card p-5 sm:p-6 md:p-8 text-center relative overflow-hidden">
        {/* Background Decorative Cyrillic Motifs */}
        <div className="absolute top-2 right-4 text-5xl md:text-6xl font-serif text-indigo-900/5 font-black pointer-events-none tracking-widest select-none">
          РОССИЯ
        </div>

        {/* Emblem & Badge */}
        <div className="relative z-10 inline-flex flex-col items-center mb-3">
          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#4F46E5] p-0.5 shadow-md mb-2 group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#4338CA] rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden text-white">
              <span className="text-lg md:text-xl font-black text-sky-200">
                MOW
              </span>
              <span className="text-[8px] uppercase tracking-widest text-indigo-200 font-bold">
                МОСКВА
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-[#4F46E5] border border-indigo-100 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#4F46E5]" />
            Simulasi Olimpiade Bahasa Rusia di Moskow
          </span>
        </div>

        {/* Title & Description */}
        <div className="relative z-10 max-w-xl mx-auto mb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-1">
            Olimpiade Bahasa Rusia
          </h2>
          <p className="text-[#64748B] text-xs md:text-sm leading-relaxed font-medium">
            Masukkan username terdaftar Anda untuk memulai pengerjaan kuis.
          </p>
        </div>

        {/* Form Input Box */}
        <div className="relative z-10 max-w-md mx-auto space-y-2.5">
          <div className="relative">
            <input
              type="text"
              id="username-input"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
              placeholder="Masukkan Username Anda..."
              className="w-full bg-slate-50 border border-slate-200 text-[#0F172A] placeholder-slate-400 rounded-xl px-4 py-3 text-center text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] shadow-sm transition-all font-semibold"
            />
            {usernameInput && (
              <button
                type="button"
                onClick={() => setUsernameInput('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs bg-slate-200/60 rounded-full w-5 h-5 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => handleLogin()}
            disabled={isLoading}
            id="login-submit-btn"
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold py-3 px-5 rounded-xl text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Memeriksa Akun...</span>
              </>
            ) : (
              <>
                <span>Masuk Portal Ujian</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded Papan Skor on Front Page */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-300" />
            <span>Papan Skor Peserta Utama</span>
          </h3>
          <span className="text-xs text-sky-100 font-medium bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm shadow-sm">
            Terhubung Secara Langsung
          </span>
        </div>
        <LeaderboardView
          currentUser={null}
          onNavigate={onNavigate || (() => {})}
          showBackButton={false}
        />
      </div>

      {/* Features Overview Grid - Slim & Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F172A] text-xs sm:text-sm mb-0.5">Soal Standar Moskow</h3>
            <p className="text-[11px] text-[#64748B] leading-snug font-medium">
              Materi mencakup Tata Bahasa (Падежи), Kosakata, Aspek Kata Kerja, dan Kebudayaan Rusia.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F172A] text-xs sm:text-sm mb-0.5">Sistem Pengawasan</h3>
            <p className="text-[11px] text-[#64748B] leading-snug font-medium">
              Perpindahan tab dan aksi salin-tempel terdeteksi secara otomatis untuk menjaga integritas simulasi.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F172A] text-xs sm:text-sm mb-0.5">Papan Skor & Rekap</h3>
            <p className="text-[11px] text-[#64748B] leading-snug font-medium">
              Hasil kuis tercatat secara langsung dan dapat diunduh sebagai sertifikat rekapitulasi ujian.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
