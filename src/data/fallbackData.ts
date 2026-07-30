import { Question, LeaderboardEntry } from '../types';

export const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Manakah bentuk Genitiv (родительный падеж) tunggal yang benar untuk kata 'Москва'?",
    correct: "Москвы",
    wrong: ["Москве", "Москву", "Москвой"],
    category: "Tata Bahasa & Tata Kasus (Грамматика)"
  },
  {
    id: 2,
    question: "Kata benda 'Книга' dalam bahasa Rusia termasuk jenis kelamin (род):",
    correct: "Женский род",
    wrong: ["Мужской род", "Средний род", "Общий род"],
    category: "Tata Bahasa & Tata Kasus (Грамматика)"
  },
  {
    id: 3,
    question: "Bentuk plural (множественное число) dari kata 'Студент' adalah:",
    correct: "Студенты",
    wrong: ["Студента", "Студентам", "Студентов"],
    category: "Tata Bahasa & Tata Kasus (Грамматика)"
  },
  {
    id: 4,
    question: "Manakah bentuk Предложный падеж (Prepositional case) dari 'Россия' dalam frasa 'в ...'?",
    correct: "в России",
    wrong: ["в Россию", "в Россией", "в Россия"],
    category: "Tata Bahasa & Tata Kasus (Грамматика)"
  },
  {
    id: 5,
    question: "Lengkapi kalimat: 'Мы ждём ... на станции метро.' (Akusatif / Винительный)",
    correct: "друга",
    wrong: ["друг", "другу", "другом"],
    category: "Tata Bahasa & Tata Kasus (Грамматика)"
  },
  {
    id: 6,
    question: "Lengkapi kalimat berikut: 'Я изучаю русский язык ..., чтобы поехать в Россию.'",
    correct: "усердно",
    wrong: ["усердный", "усердная", "усердные"],
    category: "Kata Kerja & Konjugasi (Глаголы)"
  },
  {
    id: 7,
    question: "Manakah pasangan kata kerja (глагол) beraspek imperfektif dan perfektif yang benar untuk 'Membaca'?",
    correct: "Читать / Прочитать",
    wrong: ["Писать / Написать", "Говорить / Сказать", "Учить / Изучить"],
    category: "Kata Kerja & Konjugasi (Глаголы)"
  },
  {
    id: 8,
    question: "Konjugasi kata kerja 'говорить' untuk subjek 'Мы' adalah:",
    correct: "говорим",
    wrong: ["говорю", "говоришь", "говорят"],
    category: "Kata Kerja & Konjugasi (Глаголы)"
  },
  {
    id: 9,
    question: "Apa arti dari ungkapan bahasa Rusia 'Здравствуйте'?",
    correct: "Halo / Semoga Anda Sehat (Salam Formal)",
    wrong: ["Selamat Tinggal", "Terima Kasih Banyak", "Selamat Pagi Pertama"],
    category: "Kosakata & Frasa Sehari-hari (Лексика)"
  },
  {
    id: 10,
    question: "Apa sinonim kata 'Красивый' dalam bahasa Rusia?",
    correct: "Прекрасный",
    wrong: ["Плохой", "Быстрый", "Маленький"],
    category: "Kosakata & Frasa Sehari-hari (Лексика)"
  },
  {
    id: 11,
    question: "Apa sebutan untuk huruf-huruf abjad yang digunakan dalam bahasa Rusia?",
    correct: "Кириллица (Cyrillic)",
    wrong: ["Латиница (Latin)", "Глаголица", "Арабский"],
    category: "Kosakata & Frasa Sehari-hari (Лексика)"
  },
  {
    id: 12,
    question: "Di kota manakah Olimpiade Bahasa Rusia tingkat internasional ini secara historis berpusat?",
    correct: "Москва",
    wrong: ["Санкт-Петербург", "Казань", "Новосибирск"],
    category: "Kebudayaan & Sejarah Rusia (Культура)"
  },
  {
    id: 13,
    question: "Siapakah penyair nasional legendaris Rusia yang dianggap sebagai bapak Bahasa Rusia Modern?",
    correct: "Александр Пушкин",
    wrong: ["Лев Толстой", "Фёдор Достоевский", "Антон Чехов"],
    category: "Kebudayaan & Sejarah Rusia (Культура)"
  },
  {
    id: 14,
    question: "Nama bangunan bersejarah dan istana benteng utama di pusat kota Moskow adalah:",
    correct: "Московский Кремль",
    wrong: ["Эрмитаж", "Петергоф", "Большой театр"],
    category: "Kebudayaan & Sejarah Rusia (Культура)"
  },
  {
    id: 15,
    question: "Bangunan gereja terkenal di Красная площадь (Red Square) dengan kubah berwarna-warni adalah:",
    correct: "Собор Василия Блаженного",
    wrong: ["Храм Христа Спасителя", "Исаакиевский собор", "Казанский собор"],
    category: "Kebudayaan & Sejarah Rusia (Культура)"
  }
];

export const FALLBACK_LEADERBOARD: LeaderboardEntry[] = [];
