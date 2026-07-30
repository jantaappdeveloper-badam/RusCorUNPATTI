import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, ViewMode, User } from '../types';
import { fetchLeaderboard } from '../utils/csv';
import { calculateRussianGrade } from '../utils/grade';
import { generateLeaderboardPDF } from '../utils/pdf';
import { soundEngine } from '../utils/audio';
import { Trophy, Medal, Search, RefreshCw, ArrowLeft, Download, FileText } from 'lucide-react';

interface LeaderboardViewProps {
  currentUser: User | null;
  onNavigate: (view: ViewMode) => void;
  showBackButton?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  onNavigate,
  showBackButton = true,
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeaderboard();
      setLeaderboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = leaderboardData.filter((entry) => {
    const term = searchTerm.toLowerCase();
    return entry.name.toLowerCase().includes(term);
  });

  const top3 = filtered.slice(0, 3);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Bar */}
      {/* Control Header Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={() => {
                soundEngine.playClickSound();
                if (currentUser) {
                  onNavigate(currentUser.isAdmin ? 'admin' : 'dashboard');
                } else {
                  onNavigate('login');
                }
              }}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0F172A] transition-all"
              title="Kembali"
              id="back-from-leaderboard-btn"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#4F46E5]" />
              <span>Papan Skor Peserta</span>
            </h2>
            <p className="text-xs text-[#64748B] font-medium">
              Peringkat & Nilai Rusia (Оценка) berdasarkan akurasi dan waktu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              soundEngine.playClickSound();
              await generateLeaderboardPDF(leaderboardData);
            }}
            disabled={isLoading || leaderboardData.length === 0}
            className="px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            id="download-leaderboard-pdf-btn"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Download PDF Skor</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClickSound();
              loadData();
            }}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 shadow-sm"
            id="refresh-leaderboard-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#4F46E5] ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Muat Ulang</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards - Compact Slim Layout */}
      {!isLoading && top3.length > 0 && !searchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          {top3.map((entry, idx) => {
            const podiumStyles = [
              {
                bg: 'bg-amber-50/80 border border-amber-200 text-amber-950',
                badgeBg: 'bg-amber-500 text-white',
                medalColor: 'text-amber-500',
                title: 'Juara 1 (1-е место)',
              },
              {
                bg: 'bg-indigo-50/80 border border-indigo-200 text-indigo-950',
                badgeBg: 'bg-[#4F46E5] text-white',
                medalColor: 'text-[#4F46E5]',
                title: 'Juara 2 (2-е место)',
              },
              {
                bg: 'bg-rose-50/80 border border-rose-200 text-rose-950',
                badgeBg: 'bg-rose-500 text-white',
                medalColor: 'text-rose-500',
                title: 'Juara 3 (3-е место)',
              },
            ];

            const style = podiumStyles[idx] || podiumStyles[2];
            const russianGrade = calculateRussianGrade(entry.score, entry.totalQuestions, entry.timeSeconds);

            return (
              <div
                key={idx}
                className={`rounded-xl p-3 border text-left relative overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${style.bg}`}
              >
                {/* Header: Icon + Badge + Name */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-xs shrink-0">
                    <Medal className={`w-4 h-4 ${style.medalColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md ${style.badgeBg}`}>
                        {style.title}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-[#0F172A] text-xs sm:text-sm truncate" title={entry.name}>
                      {entry.name}
                    </h3>
                  </div>
                </div>

                {/* Single Compact Stats Row */}
                <div className="bg-white rounded-lg p-2 border border-slate-200 text-xs flex items-center justify-between font-semibold gap-1 shadow-xs">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold border ${russianGrade.colorClass}`}>
                    Nilai: {russianGrade.grade}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-emerald-600 font-bold">{entry.score} Benar</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[#0F172A] font-mono font-bold">{entry.timeSeconds}s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#4F46E5] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan nama peserta..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[#0F172A] text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all font-medium shadow-sm"
        />
      </div>

      {/* Leaderboard Table (Scrollable beyond row 7 with sticky header) */}
      <div className="vibrant-card overflow-hidden">
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs sm:text-sm text-[#0F172A]">
            <thead className="bg-[#4F46E5] text-white uppercase text-[10px] sm:text-xs sticky top-0 z-10 shadow-sm whitespace-nowrap">
              <tr>
                <th className="px-2.5 sm:px-4 py-3 font-extrabold text-center">Rank</th>
                <th className="px-2.5 sm:px-4 py-3 font-extrabold">Nama Peserta</th>
                <th className="px-2.5 sm:px-4 py-3 font-extrabold text-center">Nilai (Оценка)</th>
                <th className="px-2.5 sm:px-4 py-3 font-extrabold text-center">Benar</th>
                <th className="px-2.5 sm:px-4 py-3 font-extrabold text-center">Waktu</th>
                <th className="px-2.5 sm:px-4 py-3 font-extrabold text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-[#4F46E5] font-semibold text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data papan skor dari server...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-[#64748B] font-semibold text-xs">
                    Tidak ada data peserta yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((entry, index) => {
                  const rank = entry.rank || index + 1;
                  const isCurrentUser =
                    currentUser &&
                    (entry.username.toLowerCase() === currentUser.username.toLowerCase() ||
                      entry.name.toLowerCase() === currentUser.namaLengkap.toLowerCase());

                  const russianGrade = calculateRussianGrade(entry.score, entry.totalQuestions, entry.timeSeconds);

                  return (
                    <tr
                      key={index}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCurrentUser ? 'bg-indigo-50/70 border-l-4 border-[#4F46E5] font-bold' : ''
                      }`}
                    >
                      <td className="px-2.5 sm:px-4 py-2.5 text-center font-extrabold text-[#0F172A] whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-xs font-bold text-[#0F172A] border border-slate-200 shadow-2xs">
                          {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                        </span>
                      </td>

                      <td className="px-2.5 sm:px-4 py-2.5">
                        <div className="font-semibold text-[#0F172A] flex items-center gap-1.5 flex-wrap">
                          <span className="truncate max-w-[140px] sm:max-w-[220px]" title={entry.name}>
                            {entry.name}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[9px] bg-[#4F46E5] text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-2.5 sm:px-4 py-2.5 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-extrabold border ${russianGrade.colorClass}`}>
                          {russianGrade.grade}
                        </span>
                      </td>

                      <td className="px-2.5 sm:px-4 py-2.5 text-center font-extrabold text-emerald-600 whitespace-nowrap">
                        {entry.score} <span className="text-[10px] sm:text-xs text-slate-400 font-medium">/ {entry.totalQuestions}</span>
                      </td>

                      <td className="px-2.5 sm:px-4 py-2.5 text-center font-mono font-bold text-[#0F172A] whitespace-nowrap text-xs sm:text-sm">
                        {entry.timeSeconds}s
                      </td>

                      <td className="px-2.5 sm:px-4 py-2.5 text-right text-[10px] sm:text-xs text-[#64748B] font-medium whitespace-nowrap">
                        {entry.date}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

