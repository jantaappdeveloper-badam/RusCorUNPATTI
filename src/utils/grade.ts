export interface RussianGradeResult {
  grade: string;
  label: string;
  description: string;
  colorClass: string;
  bgClass: string;
}

/**
 * Calculates a Russian school/olympiad grade scale:
 * 5+, 5, 5-, 4+, 4, 4-, 3+, 3, 3-, 2+, 2, 2-, 1+, 1, 1-
 * based on score, total questions, and total completion time.
 */
export function calculateRussianGrade(
  score: number,
  totalQuestions: number,
  timeSeconds: number
): RussianGradeResult {
  const total = totalQuestions > 0 ? totalQuestions : 1;
  const rawPercentage = (score / total) * 100;

  // Average time per question in seconds
  // Standard expected pace is ~15 seconds per question
  const timePerQuestion = timeSeconds / total;

  // Calculate speed adjustment (+5% to -5%)
  let speedAdjustment = 0;
  if (timePerQuestion <= 8) {
    speedAdjustment = 5;
  } else if (timePerQuestion <= 12) {
    speedAdjustment = 3;
  } else if (timePerQuestion <= 15) {
    speedAdjustment = 1;
  } else if (timePerQuestion > 35) {
    speedAdjustment = -4;
  } else if (timePerQuestion > 25) {
    speedAdjustment = -2;
  }

  // Adjusted score percentage
  const effectiveIndex = Math.min(100, Math.max(0, rawPercentage + speedAdjustment));

  let grade = '1';
  let label = 'Плохо (Sangat Kurang)';
  let description = 'Coba lagi dan pelajari kembali tata bahasa dasar.';
  let colorClass = 'text-rose-800 border-rose-300 bg-rose-50';
  let bgClass = 'from-rose-500 to-red-600';

  if (effectiveIndex >= 97) {
    grade = '5+';
    label = 'Отлично! (Sangat Sempurna)';
    description = 'Luar biasa! Akurasi tinggi dengan waktu penyelesaian sangat cepat.';
    colorClass = 'text-amber-900 border-amber-300 bg-amber-100/80';
    bgClass = 'from-amber-400 via-yellow-400 to-amber-500';
  } else if (effectiveIndex >= 91) {
    grade = '5';
    label = 'Отлично (Sangat Baik)';
    description = 'Sangat baik! Penguasaan Bahasa Rusia yang cemerlang.';
    colorClass = 'text-emerald-900 border-emerald-300 bg-emerald-100/80';
    bgClass = 'from-emerald-500 to-teal-600';
  } else if (effectiveIndex >= 85) {
    grade = '5-';
    label = 'Отлично (Sangat Baik Minus)';
    description = 'Sangat baik dengan sedikit sekali kesalahan.';
    colorClass = 'text-emerald-800 border-emerald-200 bg-emerald-50';
    bgClass = 'from-emerald-400 to-teal-500';
  } else if (effectiveIndex >= 79) {
    grade = '4+';
    label = 'Хорошо (Baik Plus)';
    description = 'Performa bagus mendekati sempurna.';
    colorClass = 'text-blue-900 border-blue-300 bg-blue-100/80';
    bgClass = 'from-blue-500 to-indigo-600';
  } else if (effectiveIndex >= 73) {
    grade = '4';
    label = 'Хорошо (Baik)';
    description = 'Pemahaman materi yang kuat dan stabil.';
    colorClass = 'text-indigo-900 border-indigo-300 bg-indigo-100/80';
    bgClass = 'from-indigo-500 to-purple-600';
  } else if (effectiveIndex >= 67) {
    grade = '4-';
    label = 'Хорошо (Baik Minus)';
    description = 'Cukup bagus, beberapa konsep perlu dipertajam.';
    colorClass = 'text-indigo-800 border-indigo-200 bg-indigo-50';
    bgClass = 'from-indigo-400 to-purple-500';
  } else if (effectiveIndex >= 61) {
    grade = '3+';
    label = 'Удовлетворительно (Cukup Plus)';
    description = 'Di atas standar minimal kelulusan.';
    colorClass = 'text-amber-900 border-yellow-300 bg-yellow-100/80';
    bgClass = 'from-yellow-500 to-amber-600';
  } else if (effectiveIndex >= 54) {
    grade = '3';
    label = 'Удовлетворительно (Cukup)';
    description = 'Memenuhi batas standar kelulusan minimal.';
    colorClass = 'text-amber-800 border-yellow-200 bg-yellow-50';
    bgClass = 'from-amber-400 to-orange-500';
  } else if (effectiveIndex >= 47) {
    grade = '3-';
    label = 'Удовлетворительно (Cukup Minus)';
    description = 'Lulus di ambang batas minimal.';
    colorClass = 'text-amber-700 border-amber-200 bg-amber-50';
    bgClass = 'from-orange-400 to-amber-500';
  } else if (effectiveIndex >= 40) {
    grade = '2+';
    label = 'Неудовлетворительно (Kurang Plus)';
    description = 'Hampir memenuhi batas minimum, perlu pengulangan.';
    colorClass = 'text-orange-900 border-orange-300 bg-orange-100/80';
    bgClass = 'from-orange-500 to-rose-600';
  } else if (effectiveIndex >= 32) {
    grade = '2';
    label = 'Неудовлетворительно (Kurang)';
    description = 'Belum memenuhi batas lulus. Silakan pelajari kembali.';
    colorClass = 'text-rose-900 border-rose-300 bg-rose-100/80';
    bgClass = 'from-rose-500 to-red-600';
  } else if (effectiveIndex >= 25) {
    grade = '2-';
    label = 'Неудовлетворительно (Kurang Minus)';
    description = 'Banyak jawaban yang perlu diperbaiki.';
    colorClass = 'text-rose-900 border-rose-300 bg-rose-50';
    bgClass = 'from-rose-600 to-red-700';
  } else if (effectiveIndex >= 15) {
    grade = '1+';
    label = 'Плохо (Sangat Kurang Plus)';
    description = 'Perlu bimbingan intensif dari dasar.';
    colorClass = 'text-red-900 border-red-300 bg-red-100/80';
    bgClass = 'from-red-600 to-rose-800';
  } else if (effectiveIndex >= 8) {
    grade = '1';
    label = 'Плохо (Sangat Kurang)';
    description = 'Pemahaman awal perlu dibangun dari dasar.';
    colorClass = 'text-red-950 border-red-400 bg-red-100';
    bgClass = 'from-red-700 to-rose-900';
  } else {
    grade = '1-';
    label = 'Плохо (Sangat Kurang Minimal)';
    description = 'Silakan coba lagi dari awal.';
    colorClass = 'text-red-950 border-red-500 bg-red-200/80';
    bgClass = 'from-red-800 to-rose-950';
  }

  return { grade, label, description, colorClass, bgClass };
}
