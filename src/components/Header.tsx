import React from 'react';
import { User, ViewMode } from '../types';
import { Volume2, VolumeX, Shield, Award, LogOut, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  currentUser: User | null;
  currentView: ViewMode;
  soundMuted: boolean;
  onToggleSound: () => void;
  onNavigate: (view: ViewMode) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentView,
  soundMuted,
  onToggleSound,
  onNavigate,
  onLogout,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto mb-6">
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 border border-slate-200 shadow-sm">
        {/* Brand & Logo */}
        <div 
          onClick={() => {
            soundEngine.playClickSound();
            if (currentUser) {
              onNavigate(currentUser.isAdmin ? 'admin' : 'dashboard');
            } else {
              onNavigate('login');
            }
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-[#4F46E5] p-0.5 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#4338CA] rounded-[10px] flex items-center justify-center font-black text-sm text-white">
              RU
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-[#0F172A] text-base tracking-tight leading-none group-hover:text-[#4F46E5] transition-colors">
                Olimpiade Bahasa Rusia
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                Moskow
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium flex flex-wrap items-center gap-1 mt-0.5">
              <span>Kuis oleh <strong className="text-[#4F46E5] font-semibold">Russian Corner UNPATTI</strong>, by: <strong className="text-[#0F172A]">Janta A. Imuly</strong></span>
            </p>
          </div>
        </div>

        {/* Action Controls & User Info */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              soundEngine.playClickSound();
              onToggleSound();
            }}
            title={soundMuted ? "Aktifkan Suara" : "Matikan Suara"}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#64748B] hover:text-[#0F172A] transition-all"
            id="sound-toggle-btn"
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          {/* Navigation Links */}
          {currentUser && currentView !== 'quiz' && (
            <>
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  onNavigate('leaderboard');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  currentView === 'leaderboard'
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#64748B] border border-slate-200 hover:text-[#0F172A]'
                }`}
                id="header-leaderboard-btn"
              >
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Papan Skor</span>
              </button>

              {currentUser.isAdmin && (
                <button
                  onClick={() => {
                    soundEngine.playClickSound();
                    onNavigate('admin');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    currentView === 'admin'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-[#64748B] border border-slate-200 hover:text-[#0F172A]'
                  }`}
                  id="header-admin-btn"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={() => {
                  soundEngine.playClickSound();
                  onLogout();
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-[#64748B] hover:text-rose-600 border border-slate-200 transition-all"
                title="Keluar"
                id="header-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Guest indicator if logged in */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#4F46E5]">
              <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span className="truncate max-w-[120px]">
                {currentUser.namaLengkap}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
