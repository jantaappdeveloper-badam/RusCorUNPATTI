import React, { useState, useEffect } from 'react';
import { User, ViewMode, Question, AnswerRecord } from './types';
import { fetchQuestions, shuffleArray } from './utils/csv';
import { calculateRussianGrade } from './utils/grade';
import { soundEngine } from './utils/audio';

import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { QuizView } from './components/QuizView';
import { ResultView } from './components/ResultView';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminView } from './components/AdminView';
import { Modal } from './components/Modal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('login');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [soundMuted, setSoundMuted] = useState(false);

  // Quiz state
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [userAnswers, setUserAnswers] = useState<AnswerRecord[]>([]);

  // GAS Web App URL state
  const [gasWebAppUrl, setGasWebAppUrl] = useState<string>(() => {
    return localStorage.getItem('GAS_WEB_APP_URL') || '';
  });

  // Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  const showModal = (title: string, message: string) => {
    setModalState({ isOpen: true, title, message });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Load questions on mount
  useEffect(() => {
    async function loadQuestionsOnStart() {
      const q = await fetchQuestions();
      setQuestions(q);
    }
    loadQuestionsOnStart();
  }, []);

  const handleToggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.isAdmin) {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleStartQuiz = async () => {
    const rawQuestions = await fetchQuestions();
    
    // Group questions by category and shuffle within each category
    const categoryMap = new Map<string, Question[]>();
    rawQuestions.forEach((q) => {
      const cat = q.category || 'Umum';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push(q);
    });

    let groupedQuestions: Question[] = [];
    categoryMap.forEach((qList) => {
      const shuffledCatQuestions = shuffleArray(qList);
      groupedQuestions = [...groupedQuestions, ...shuffledCatQuestions];
    });

    setQuestions(groupedQuestions);
    setCurrentView('quiz');
  };

  const handleFinishQuiz = (
    finalScore: number,
    totalTimeSeconds: number,
    answers: AnswerRecord[]
  ) => {
    setScore(finalScore);
    setElapsedSeconds(totalTimeSeconds);
    setUserAnswers(answers);
    setCurrentView('result');

    const gradeObj = calculateRussianGrade(finalScore, answers.length, totalTimeSeconds);

    // Automatically send score to Google Sheets if GAS Web App URL is provided and user is not admin
    if (gasWebAppUrl && currentUser && !currentUser.isAdmin) {
      try {
        fetch(gasWebAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'addScore',
            data: {
              peringkat: '-',
              namaLengkap: currentUser.namaLengkap,
              gradeRusia: gradeObj.grade,
              username: currentUser.username,
              benar: finalScore,
              totalSoal: answers.length,
              waktu: totalTimeSeconds,
              status: 'Selesai',
              tanggalSelesai: new Date().toLocaleString('id-ID'),
            },
          }),
        });
      } catch (e) {
        console.error('Gagal mengirim skor ke Google Sheets:', e);
      }
    }
  };

  const handleUpdateGasUrl = (url: string) => {
    setGasWebAppUrl(url);
    localStorage.setItem('GAS_WEB_APP_URL', url);
  };

  return (
    <div className="min-h-screen vibrant-bg text-white p-3 sm:p-5 md:p-8 flex flex-col items-center justify-between font-sans relative overflow-x-hidden selection:bg-amber-400 selection:text-indigo-950">
      {/* Decorative Ambient Glows - Ocean Blue & Cyan Sea Tones */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-sky-400/30 rounded-full opacity-60 blur-3xl pointer-events-none"></div>
      <div className="absolute top-[10%] right-[-100px] w-[450px] h-[450px] bg-cyan-400/25 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-150px] left-[25%] w-[550px] h-[550px] bg-blue-500/20 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl flex-1 flex flex-col justify-start relative z-10">
        {/* Navigation & Header */}
        <Header
          currentUser={currentUser}
          currentView={currentView}
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />

        {/* View Router */}
        <main className="w-full flex-1 flex flex-col justify-center py-2">
          {currentView === 'login' && (
            <LoginView
              onLoginSuccess={handleLoginSuccess}
              onShowModal={showModal}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'dashboard' && currentUser && (
            <DashboardView
              currentUser={currentUser}
              onStartQuiz={handleStartQuiz}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'quiz' && (
            <QuizView
              questions={questions}
              onFinishQuiz={handleFinishQuiz}
              onShowModal={showModal}
            />
          )}

          {currentView === 'result' && (
            <ResultView
              currentUser={currentUser}
              score={score}
              totalQuestions={questions.length}
              elapsedSeconds={elapsedSeconds}
              userAnswers={userAnswers}
              onRestartQuiz={handleStartQuiz}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'leaderboard' && (
            <LeaderboardView
              currentUser={currentUser}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'admin' && (
            <AdminView
              gasWebAppUrl={gasWebAppUrl}
              onUpdateGasUrl={handleUpdateGasUrl}
              onStartQuiz={handleStartQuiz}
              onNavigate={(view) => setCurrentView(view)}
              onShowModal={showModal}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto pt-8 pb-2 text-center text-xs text-white font-medium flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/20 mt-8">
        <div className="text-white">
          © {new Date().getFullYear()} Simulasi Olimpiade Bahasa Rusia di Moskow. Все права защищены.
        </div>
        <div className="flex items-center gap-3 text-white">
          <span className="text-white">Москва, Россия</span>
          <span className="text-white">•</span>
          <span className="text-white">Русский Язык</span>
        </div>
      </footer>

      {/* Global Alert Modal */}
      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onClose={closeModal}
      />
    </div>
  );
}
