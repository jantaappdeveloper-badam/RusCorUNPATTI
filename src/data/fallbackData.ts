import { Question, LeaderboardEntry } from '../types';

export const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "36. (BAHASA) Вопрос: Падеж для «кто?»? Terjemahan: Kasus apa yang menjawab pertanyaan siapa?",
    correct: "Именительный (Nominatif)",
    wrong: ["Родительный (Genitif)", "Дательный (Datif)", "Винительный (Akusatif)"],
    category: "Tata Bahasa & Tata Kasus (Грамматика)"
  },
  {
    id: 2,
    question: "2. (ARSITEKTUR) Вопрос: Какой собор в Москве известен разноцветными куполами? Terjemahan: Katedral di Moskow dengan kubah warna-warni?",
    correct: "Собор Василия Блаженного (Katedral St. Basil)",
    wrong: ["Храм Христа Спасителя (Katedral Kristus Juru Selamat)", "Успенский собор (Katedral Assumption)", "Благовещенский собор (Katedral Annunciation)"],
    category: "Kebudayaan & Sejarah Rusia (Культура)"
  },
  {
    id: 3,
    question: "48. (BUDAYA) Вопрос: Как называется танец с присядкой? Terjemahan: Tarian rakyat dengan gerakan jongkok?",
    correct: "Камаринская (Kamrinskaya)",
    wrong: ["Вальс (Waltz)", "Полька (Polka)", "Танго (Tango)"],
    category: "Kebudayaan & Sejarah Rusia (Культура)"
  },
  {
    id: 4,
    question: "49. (BUDAYA) Вопрос: Что такое русская баня? Terjemahan: Apa itu pemandian Rusia (banya)?",
    correct: "Парная с вениками (Ruang uap dengan sapu daun birch)",
    wrong: ["Бассейн (Kolam renang)", "Сауна без пара (Sauna tanpa uap)", "Джакузи (Jacuzzi)"],
    category: "Kebudayaan & Sejarah Rusia (Культура)"
  },
  {
    id: 5,
    question: "50. (BUDAYA) Вопрос: Какое дерево — неофициальный символ России? Terjemahan: Pohon symbol tidak resmi Rusia?",
    correct: "Берёза (Pohon birch)",
    wrong: ["Сосна (Pinus)", "Дуб (Oak)", "Кедр (Cedar)"],
    category: "Kebudayaan & Sejarah Rusia (Культура)"
  },
  {
    id: 6,
    question: "397. (TRADISI) Вопрос: Какой обряд сопровождается песнями и плясками на русской свадьбе? Terjemahan: Upacara apa yang diiringi lagu dan tarian di pernikahan Rusia?",
    correct: "Свадебный пир (Pesta pernikahan)",
    wrong: ["Выкуп невесты (Tebusan mempelai)", "Венчание (Pernikahan gereja)", "Каравай (Roti pernikahan)"],
    category: "Kata Kerja & Konjugasi (Глаголы)"
  },
  {
    id: 7,
    question: "398. (TRADISI) Вопрос: Какой салат считается праздничным в России? Terjemahan: Salad apa yang dianggap sebagai hidangan pesta di Rusia?",
    correct: "Оливье (Olivier)",
    wrong: ["Винегрет (Vinaigrette)", "Селедка под шубой (Ikan haring di bawah mantel)", "Греческий (Yunani)"],
    category: "Kata Kerja & Konjugasi (Глаголы)"
  },
  {
    id: 8,
    question: "399. (TRADISI) Вопрос: Какой напиток на Руси пили из самовара? Terjemahan: Minuman apa yang diminum dari samovar di Rus?",
    correct: "Чай (Teh)",
    wrong: ["Кофе (Kopi)", "Квас (Kvass)", "Сбитень (Sbiten)"],
    category: "Kata Kerja & Konjugasi (Глаголы)"
  },
  {
    id: 9,
    question: "400. (TRADISI) Вопрос: Какой праздник в России символизирует проводы зимы? Terjemahan: Hari raya apa di Rusia yang melambangkan perpisahan dengan musim dingin?",
    correct: "Масленица (Maslenitsa)",
    wrong: ["Пасха (Paskah)", "Новый год (Tahun Baru)", "Иван Купала (Ivan Kupala)"],
    category: "Kosakata & Frasa Sehari-hari (Лексика)"
  },
  {
    id: 10,
    question: "12. (GEOGRAFI) Вопрос: Какая река — самая длинная в Европе? Terjemahan: Sungai mana yang terpanjang di Eropa?",
    correct: "Волга (Volga)",
    wrong: ["Дон (Don)", "Днепр (Dnieper)", "Урал (Ural)"],
    category: "Kosakata & Frasa Sehari-hari (Лексика)"
  }
];

export const FALLBACK_LEADERBOARD: LeaderboardEntry[] = [];
