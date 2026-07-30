import { Question, LeaderboardEntry, User } from '../types';
import { FALLBACK_QUESTIONS, FALLBACK_LEADERBOARD } from '../data/fallbackData';

export const URL_SOAL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQA8Vh5sNXeyrWWlyakCGmSh6kOTQtvZSqaeFsseQZnl_c94tV94FB1JzZKQLZkOM-KDjYHKq2cchgm/pub?gid=836970893&single=true&output=csv';
export const URL_USER = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnNONV9fkXnMSixcPPf353VevOiHlaAek_EL43LGH4DnFWCVSYoPR4BSTgfO1zmRPocmS3pjejFJSP/pub?gid=673330511&single=true&output=csv';
export const URL_LEADERBOARD = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQA8Vh5sNXeyrWWlyakCGmSh6kOTQtvZSqaeFsseQZnl_c94tV94FB1JzZKQLZkOM-KDjYHKq2cchgm/pub?gid=1371157370&single=true&output=csv';

export const ADMIN_USERNAME = 'jantaimuly310467';

export function parseCSV(str: string): string[][] {
  const arr: string[][] = [];
  let quote = false;
  let col = 0, row = 0;

  for (let c = 0; c < str.length; c++) {
    const cc = str[c];
    const nc = str[c + 1];

    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';

    if (cc === '"' && quote && nc === '"') {
      arr[row][col] += cc;
      c++;
      continue;
    }
    if (cc === '"') {
      quote = !quote;
      continue;
    }
    if (cc === ',' && !quote) {
      col++;
      continue;
    }
    if (cc === '\r' && nc === '\n' && !quote) {
      row++;
      col = 0;
      c++;
      continue;
    }
    if (cc === '\n' && !quote) {
      row++;
      col = 0;
      continue;
    }
    if (cc === '\r' && !quote) {
      row++;
      col = 0;
      continue;
    }
    arr[row][col] += cc;
  }
  return arr;
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function assignCategory(qText: string, explicitCategory?: string, index?: number): string {
  if (explicitCategory && explicitCategory.trim().length > 0) {
    return explicitCategory.trim();
  }
  const text = qText.toLowerCase();
  if (text.includes('падеж') || text.includes('родительный') || text.includes('винительный') || text.includes('предложный') || text.includes('род') || text.includes('множественное') || text.includes('касус') || text.includes('kasus')) {
    return 'Tata Bahasa & Tata Kasus (Грамматика)';
  }
  if (text.includes('глагол') || text.includes('говорить') || text.includes('читать') || text.includes('изучаю') || text.includes('конжугаси') || text.includes('соверш')) {
    return 'Kata Kerja & Konjugasi (Глаголы)';
  }
  if (text.includes('кремль') || text.includes('москва') || text.includes('пушкин') || text.includes('собор') || text.includes('истори') || text.includes('город') || text.includes('красная')) {
    return 'Kebudayaan & Sejarah Rusia (Культура)';
  }
  if (text.includes('красивый') || text.includes('здравствуйте') || text.includes('кириллица') || text.includes('значение') || text.includes('слово') || text.includes('означает')) {
    return 'Kosakata & Frasa Sehari-hari (Лексика)';
  }

  // Fallback bucket by index chunk if no keywords match
  const idx = index || 1;
  const bucket = Math.floor((idx - 1) / 4) % 4;
  const categories = [
    'Tata Bahasa & Tata Kasus (Грамматика)',
    'Kata Kerja & Konjugasi (Глаголы)',
    'Kosakata & Frasa Sehari-hari (Лексика)',
    'Kebudayaan & Sejarah Rusia (Культура)'
  ];
  return categories[bucket];
}

export async function fetchQuestions(): Promise<Question[]> {
  try {
    const res = await fetch(URL_SOAL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network response not ok');
    const text = await res.text();
    const parsed = parseCSV(text);

    const questions: Question[] = [];
    for (let i = 1; i < parsed.length; i++) {
      const row = parsed[i];
      if (row && row[0] && row[1]) {
        const qText = row[0].trim();
        const correct = row[1].trim();
        const wrong = [row[2], row[3], row[4]]
          .filter((val) => val && val.trim().length > 0)
          .map((v) => v.trim());
        const rawCat = row[5] ? row[5].trim() : '';

        if (qText && correct && wrong.length > 0) {
          questions.push({
            id: i,
            question: qText,
            correct,
            wrong,
            category: assignCategory(qText, rawCat, i),
          });
        }
      }
    }

    if (questions.length > 0) {
      return questions;
    }
    return FALLBACK_QUESTIONS;
  } catch (error) {
    console.warn('Could not fetch questions from CSV, using fallback questions:', error);
    return FALLBACK_QUESTIONS;
  }
}

export async function authenticateUser(inputUsername: string): Promise<User | null> {
  const trimmed = inputUsername.trim();
  if (!trimmed) return null;

  if (trimmed === ADMIN_USERNAME) {
    return {
      username: ADMIN_USERNAME,
      namaLengkap: 'Administrator Utama',
      isAdmin: true,
    };
  }

  // Handle specific fallback override
  if (trimmed.toLowerCase() === 'rut110599') {
    return {
      username: 'rut110599',
      namaLengkap: 'Rut Inriyani Manalu',
    };
  }

  try {
    const res = await fetch(URL_USER, { cache: 'no-store' });
    if (!res.ok) throw new Error('User CSV fetch failed');
    const text = await res.text();
    const rows = parseCSV(text);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      // 1. Exact match in any cell
      const matchedCell = row.find(
        (cell) => cell && cell.toLowerCase().trim() === trimmed.toLowerCase()
      );
      if (matchedCell) {
        const possibleName = row.find((c) => c && c.length > 3 && isNaN(Number(c))) || trimmed;
        return {
          username: trimmed,
          namaLengkap: possibleName.trim(),
        };
      }

      // 2. Combo Name + Date check (e.g., Rut Inriyani Manalu + 11/05/1999 -> rut110599)
      const dateCell = row.find((cell) => cell && cell.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/));
      const nameCell = row.find((cell) => cell && cell.length > 3 && !cell.match(/\d/));

      if (dateCell && nameCell) {
        const firstName = nameCell.trim().split(/\s+/)[0].toLowerCase();
        const dateNumbers = dateCell.match(/\d+/g);

        if (dateNumbers && dateNumbers.length >= 3) {
          const dd = dateNumbers[0].padStart(2, '0');
          const mm = dateNumbers[1].padStart(2, '0');
          const yy = dateNumbers[2].slice(-2);
          const generatedUsername = `${firstName}${dd}${mm}${yy}`;

          if (generatedUsername === trimmed.toLowerCase()) {
            return {
              username: trimmed,
              namaLengkap: nameCell.trim(),
            };
          }
        }
      }
    }
  } catch (error) {
    console.warn('Error fetching user CSV, checking local guest format:', error);
  }

  // Allow practice guest mode for any custom username if they enter something friendly
  if (trimmed.length >= 3) {
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    return {
      username: trimmed.toLowerCase().replace(/\s+/g, '_'),
      namaLengkap: `Peserta (${capitalized})`,
    };
  }

  return null;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${URL_LEADERBOARD}&t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Leaderboard fetch failed');
    const text = await res.text();
    const rows = parseCSV(text);

    if (rows.length <= 1) {
      return FALLBACK_LEADERBOARD;
    }

    const entries: LeaderboardEntry[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || (!row[1] && !row[3])) continue;

      const name = row[1] || row[3] || 'Peserta';
      const username = row[3] || row[1] || 'user';
      const score = parseInt(row[4], 10) || 0;
      const totalQuestions = parseInt(row[5], 10) || 10;
      const timeSeconds = parseInt(row[6], 10) || 0;
      const date = row[8] || new Date().toLocaleDateString('id-ID');

      entries.push({
        rowIndex: i + 1,
        name,
        username,
        score,
        totalQuestions,
        timeSeconds,
        date,
      });
    }

    if (entries.length === 0) {
      return FALLBACK_LEADERBOARD;
    }

    // Sort descending by score, then ascending by time
    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });

    return entries.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  } catch (error) {
    console.warn('Leaderboard CSV fetch error, returning fallback leaderboard:', error);
    return FALLBACK_LEADERBOARD;
  }
}
