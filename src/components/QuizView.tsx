import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Question, Option, AnswerRecord } from '../types';
import { shuffleArray } from '../utils/csv';
import { soundEngine } from '../utils/audio';
import { Clock, AlertTriangle, CheckCircle, XCircle, Sparkles, FolderCheck, ArrowRight, Award } from 'lucide-react';

interface QuizViewProps {
  questions: Question[];
  onFinishQuiz: (score: number, elapsedSeconds: number, userAnswers: AnswerRecord[]) => void;
  onShowModal: (title: string, message: string) => void;
}

interface CategoryModalData {
  completedCategoryName: string;
  categoryScore: number;
  categoryTotal: number;
  nextCategoryName: string;
  nextIndex: number;
}

const CYRILLIC_LABELS = ['А', 'Б', 'В', 'Г'];

export const QuizView: React.FC<QuizViewProps> = ({
  questions,
  onFinishQuiz,
  onShowModal,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState<Option[]>([]);
  const [selectedOptionText, setSelectedOptionText] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [userAnswers, setUserAnswers] = useState<AnswerRecord[]>([]);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [categoryModal, setCategoryModal] = useState<CategoryModalData | null>(null);

  const cheatWarningsRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const elapsedSecondsRef = useRef(elapsedSeconds);
  elapsedSecondsRef.current = elapsedSeconds;

  const userAnswersRef = useRef(userAnswers);
  userAnswersRef.current = userAnswers;

  // Compute category information across all questions
  const categoriesList = useMemo(() => {
    const list: { name: string; startIndex: number; totalQuestions: number }[] = [];
    let currentCat = '';

    questions.forEach((q, idx) => {
      const catName = q.category || 'Umum';
      if (catName !== currentCat) {
        currentCat = catName;
        list.push({ name: catName, startIndex: idx, totalQuestions: 1 });
      } else {
        list[list.length - 1].totalQuestions += 1;
      }
    });
    return list;
  }, [questions]);

  // Current category metadata
  const currentCatInfo = useMemo(() => {
    if (!questions[currentIndex]) {
      return {
        categoryName: 'Umum',
        catNumber: 1,
        totalCats: 1,
        inCatIndex: 1,
        inCatTotal: 1,
      };
    }
    const currentQCat = questions[currentIndex].category || 'Umum';
    const catIndex = categoriesList.findIndex((c) => c.name === currentQCat);
    const catObj = categoriesList[catIndex] || categoriesList[0];

    const inCatIndex = currentIndex - (catObj ? catObj.startIndex : 0) + 1;

    return {
      categoryName: currentQCat,
      catNumber: (catIndex >= 0 ? catIndex : 0) + 1,
      totalCats: categoriesList.length || 1,
      inCatIndex,
      inCatTotal: catObj ? catObj.totalQuestions : 1,
    };
  }, [currentIndex, questions, categoriesList]);

  // Setup current question options with shuffling
  const loadQuestion = useCallback((index: number) => {
    if (index >= questions.length) return;
    const q = questions[index];

    const opts: Option[] = [
      { text: q.correct, isCorrect: true, russianLabel: '' },
      ...q.wrong.map((w) => ({ text: w, isCorrect: false, russianLabel: '' })),
    ];

    const shuffled = shuffleArray(opts);
    shuffled.forEach((opt, idx) => {
      opt.russianLabel = CYRILLIC_LABELS[idx] || `${idx + 1}`;
    });

    setCurrentOptions(shuffled);
    setSelectedOptionText(null);
    setIsAnswering(false);
  }, [questions]);

  // Handle Quiz Completion
  const finishQuizInternal = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    onFinishQuiz(scoreRef.current, elapsedSecondsRef.current, userAnswersRef.current);
  }, [onFinishQuiz]);

  // Anti-cheat visibility listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const next = cheatWarningsRef.current + 1;
        cheatWarningsRef.current = next;
        setCheatWarnings(next);

        if (next === 1) {
          onShowModal(
            'Peringatan Pengawasan',
            'Terdeteksi berpindah halaman/tab! Pelanggaran berikutnya akan menghentikan simulasi kuis secara otomatis.'
          );
        } else if (next >= 2) {
          onShowModal(
            'Diskualifikasi Kuis',
            'Pelanggaran berulang terdeteksi (keluar tab/aplikasi). Kuis otomatis dihentikan dan skor dikirim.'
          );
          finishQuizInternal();
        }
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', 'Aktivitas salin-tempel dilarang selama kuis!');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onShowModal, finishQuizInternal]);

  // Start Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Initial load
  useEffect(() => {
    if (questions.length > 0) {
      loadQuestion(0);
    }
  }, [questions, loadQuestion]);

  // Answer handler
  const handleSelectOption = (opt: Option) => {
    if (isAnswering) return;
    setIsAnswering(true);
    setSelectedOptionText(opt.text);

    const q = questions[currentIndex];
    const isCorrect = opt.isCorrect;

    if (isCorrect) {
      soundEngine.playCorrectSound();
      setScore((prev) => prev + 1);
    } else {
      soundEngine.playWrongSound();
    }

    const record: AnswerRecord = {
      question: q.question,
      selected: opt.text,
      correct: q.correct,
      isCorrect,
      category: q.category || 'Umum',
    };

    const updatedAnswers = [...userAnswers, record];
    setUserAnswers(updatedAnswers);

    // Delay for clear visual feedback so user can see correct (green) & wrong (red)
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < questions.length) {
        const nextQ = questions[nextIndex];
        const currentCatName = q.category || 'Umum';

        // Check if moving to a new category
        if (nextQ.category && nextQ.category !== currentCatName) {
          const catAnswers = updatedAnswers.filter((a) => (a.category || 'Umum') === currentCatName);
          const catScore = catAnswers.filter((a) => a.isCorrect).length;

          soundEngine.playFanfareSound();
          setCategoryModal({
            completedCategoryName: currentCatName,
            categoryScore: catScore,
            categoryTotal: catAnswers.length,
            nextCategoryName: nextQ.category,
            nextIndex,
          });
        } else {
          setCurrentIndex(nextIndex);
          loadQuestion(nextIndex);
        }
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        onFinishQuiz(score + (isCorrect ? 1 : 0), elapsedSeconds, updatedAnswers);
      }
    }, 900);
  };

  const handleContinueToNextCategory = () => {
    if (!categoryModal) return;
    soundEngine.playClickSound();
    const nextIdx = categoryModal.nextIndex;
    setCategoryModal(null);
    setCurrentIndex(nextIdx);
    loadQuestion(nextIdx);
  };

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const progressPercentage = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 quiz-protected animate-fade-in">
      {/* Top Status & Proctoring Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Stepper counter & Category Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-indigo-50 px-3 py-1.5 rounded-xl text-[#4F46E5] font-extrabold text-xs md:text-sm flex items-center gap-1.5 border border-indigo-100">
            <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            <span>SOAL {currentIndex + 1} / {questions.length}</span>
          </div>

          <div className="bg-slate-50 px-3 py-1.5 rounded-xl text-[#0F172A] font-semibold text-xs flex items-center gap-1.5 border border-slate-200">
            <FolderCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Kategori {currentCatInfo.catNumber}/{currentCatInfo.totalCats}</span>
          </div>

          {cheatWarnings > 0 && (
            <div className="px-3 py-1 rounded-xl bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 animate-pulse shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Peringatan Tab #{cheatWarnings}</span>
            </div>
          )}
        </div>

        {/* Live Timer */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 font-mono text-xs md:text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#4F46E5]" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div
          className="bg-[#4F46E5] h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Main Question Card - Vibrant Palette Signature White Card */}
      <div className="vibrant-card p-6 md:p-8 relative overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
        {/* Category Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <span className="text-[#4F46E5] font-extrabold text-xs uppercase bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100 flex items-center gap-1.5">
            <FolderCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>{currentCatInfo.categoryName}</span>
          </span>

          <span className="text-xs font-semibold text-[#64748B] bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            Soal {currentCatInfo.inCatIndex} dari {currentCatInfo.inCatTotal} (Kategori Ini)
          </span>
        </div>

        {/* Cyrillic decorative watermark placed at bottom-right away from headers */}
        <div className="absolute bottom-2 right-4 text-6xl md:text-7xl font-serif text-slate-100/50 font-black pointer-events-none select-none z-0">
          № {currentIndex + 1}
        </div>

        <div className="min-h-[90px] flex items-center my-2 relative z-10">
          <h2 className="text-[#0F172A] text-lg md:text-xl font-extrabold leading-snug tracking-tight">
            {currentQ.question}
          </h2>
        </div>

        {/* Vibrant Option Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 relative z-10">
          {currentOptions.map((opt, idx) => {
            const isSelected = selectedOptionText === opt.text;

            let btnStyle = 'bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-50 hover:border-slate-300';
            let badgeStyle = 'bg-indigo-50 text-[#4F46E5] border border-indigo-100';

            if (isAnswering) {
              if (isSelected) {
                if (opt.isCorrect) {
                  btnStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-sm font-bold';
                  badgeStyle = 'bg-emerald-500 text-white';
                } else {
                  btnStyle = 'bg-rose-50 border-2 border-rose-500 text-rose-950 shadow-sm font-bold';
                  badgeStyle = 'bg-rose-500 text-white';
                }
              } else if (opt.isCorrect) {
                // Also highlight correct answer in GREEN if user picked wrong option
                btnStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-sm font-bold animate-pulse';
                badgeStyle = 'bg-emerald-500 text-white';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswering}
                className={`p-4 rounded-xl text-left transition-all flex items-center gap-3.5 ${btnStyle} shadow-2xs group`}
                id={`option-btn-${idx}`}
              >
                {/* Option Badge */}
                <div
                  className={`w-9 h-9 ${badgeStyle} rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 transition-transform`}
                >
                  {opt.russianLabel}
                </div>

                <span className="flex-1 font-semibold text-sm leading-snug">
                  {opt.text}
                </span>

                {isAnswering && (
                  <span className="shrink-0">
                    {opt.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    ) : null}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Transition Milestone Modal */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 bg-indigo-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="vibrant-card p-6 md:p-8 max-w-lg w-full text-center relative shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-400 p-1 mx-auto shadow-xl">
              <div className="w-full h-full bg-indigo-950 rounded-[20px] flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-300" />
              </div>
            </div>

            <div>
              <span className="inline-block bg-indigo-100 text-indigo-900 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mb-2">
                Pencapaian Kategori 🎉
              </span>
              <h3 className="text-2xl font-black text-[#1E1B4B]">
                Kategori Selesai!
              </h3>
              <p className="text-sm font-bold text-indigo-600 mt-1">
                "{categoryModal.completedCategoryName}"
              </p>
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 shadow-inner">
              <div className="text-4xl font-black text-indigo-950 mb-1">
                {categoryModal.categoryScore} <span className="text-lg text-indigo-500 font-bold">/ {categoryModal.categoryTotal}</span>
              </div>
              <p className="text-xs uppercase tracking-widest font-extrabold text-indigo-600">
                Jawaban Benar Dalam Kategori Ini
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold text-indigo-900/80 mb-4">
                Siap melanjutkan ke kategori berikutnya?
              </p>

              <button
                onClick={handleContinueToNextCategory}
                className="w-full btn-vibrant-yellow font-black py-4 px-6 rounded-2xl text-sm md:text-base flex items-center justify-center gap-2 shadow-xl transform active:scale-98 transition-all"
                id="next-category-btn"
              >
                <span>Masuk Kategori: {categoryModal.nextCategoryName}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

