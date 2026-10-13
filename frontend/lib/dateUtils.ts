import NepaliDate from 'nepali-date-converter';

// ─── Nepali Month & Day Definitions ─────────────────────────────────────────

export interface NepaliMonthMeta {
  index: number;
  enName: string;
  npName: string;
  adEquivalent: string;
  season: string;
  seasonNp: string;
  notableFestivals: string;
}

export const NEPALI_MONTHS: NepaliMonthMeta[] = [
  { index: 0, enName: 'Baishakh', npName: 'बैशाख', adEquivalent: 'Apr – May', season: 'Summer', seasonNp: 'ग्रीष्म', notableFestivals: 'Nepali New Year, Bisket Jatra' },
  { index: 1, enName: 'Jestha', npName: 'जेठ', adEquivalent: 'May – Jun', season: 'Summer', seasonNp: 'ग्रीष्म', notableFestivals: 'Buddha Jayanti, Ubhauli' },
  { index: 2, enName: 'Ashadh', npName: 'असार', adEquivalent: 'Jun – Jul', season: 'Monsoon', seasonNp: 'वर्षा', notableFestivals: 'Ropai Diwas (Asar 15)' },
  { index: 3, enName: 'Shrawan', npName: 'साउन', adEquivalent: 'Jul – Aug', season: 'Monsoon', seasonNp: 'वर्षा', notableFestivals: 'Saun Sankranti, Raksha Bandhan' },
  { index: 4, enName: 'Bhadra', npName: 'भदौ', adEquivalent: 'Aug – Sep', season: 'Autumn', seasonNp: 'शरद', notableFestivals: 'Krishna Janmashtami, Teej, Gai Jatra' },
  { index: 5, enName: 'Ashwin', npName: 'असोज', adEquivalent: 'Sep – Oct', season: 'Autumn', seasonNp: 'शरद', notableFestivals: 'Dashain (Bada Dashain), Indrajatra' },
  { index: 6, enName: 'Kartik', npName: 'कात्तिक', adEquivalent: 'Oct – Nov', season: 'Pre-Winter', seasonNp: 'हेमन्त', notableFestivals: 'Tihar, Chhath, Bhai Tika' },
  { index: 7, enName: 'Mangsir', npName: 'मंसिर', adEquivalent: 'Nov – Dec', season: 'Pre-Winter', seasonNp: 'हेमन्त', notableFestivals: 'Udhauli Parva, Bala Chaturdashi' },
  { index: 8, enName: 'Poush', npName: 'पुस', adEquivalent: 'Dec – Jan', season: 'Winter', seasonNp: 'शिशिर', notableFestivals: 'Tamu Lhosar, Christmas' },
  { index: 9, enName: 'Magh', npName: 'माघ', adEquivalent: 'Jan – Feb', season: 'Winter', seasonNp: 'शिशिर', notableFestivals: 'Maghe Sankranti, Sonam Lhosar' },
  { index: 10, enName: 'Falgun', npName: 'फागुन', adEquivalent: 'Feb – Mar', season: 'Spring', seasonNp: 'वसन्त', notableFestivals: 'Maha Shivaratri, Fagu Purnima (Holi)' },
  { index: 11, enName: 'Chaitra', npName: 'चैत', adEquivalent: 'Mar – Apr', season: 'Spring', seasonNp: 'वसन्त', notableFestivals: 'Ghode Jatra, Chaite Dashain' },
];

export const NEPALI_DAYS = [
  { index: 0, enName: 'Sunday', npName: 'आइतबार', shortNp: 'आइत' },
  { index: 1, enName: 'Monday', npName: 'सोमबार', shortNp: 'सोम' },
  { index: 2, enName: 'Tuesday', npName: 'मंगलबार', shortNp: 'मंगल' },
  { index: 3, enName: 'Wednesday', npName: 'बुधबार', shortNp: 'बुध' },
  { index: 4, enName: 'Thursday', npName: 'बिहिबार', shortNp: 'बिहि' },
  { index: 5, enName: 'Friday', npName: 'शुक्रबार', shortNp: 'शुक्र' },
  { index: 6, enName: 'Saturday', npName: 'शनिबार', shortNp: 'शनि' },
];

/** Convert Western Arabic numerals (0-9) to Devanagari numerals (०-९) */
export function toNepaliNumerals(num: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, d => nepaliDigits[Number(d)] || d);
}

// ─── Safe BS <-> AD Converters ───────────────────────────────────────────────

export interface BSConversionResult {
  bsYear: number;
  bsMonth: number; // 1-12
  bsDate: number;  // 1-32
  bsDayNameEn: string;
  bsDayNameNp: string;
  bsMonthNameEn: string;
  bsMonthNameNp: string;
  bsFormattedEn: string;      // e.g. "Tuesday 27, Ashwin 2083"
  bsFormattedNp: string;      // e.g. "मंगलबार २७, आश्विन २०८३"
  bsStandardIso: string;      // "2083-06-27"
  bsDevanagariIso: string;    // "२०८३-०६-२७"
  adYear: number;
  adMonth: number; // 1-12
  adDate: number;  // 1-31
  adFormatted: string;        // "Tuesday, October 13, 2026"
  adStandardIso: string;      // "2026-10-13"
  jsDate: Date;
}

export function convertADtoBS(adDate: Date): BSConversionResult {
  const nepali = new NepaliDate(adDate);
  const bs = nepali.getBS();
  const ad = nepali.getAD();
  const dayIdx = nepali.getDay();

  const monthMeta = NEPALI_MONTHS[bs.month] || NEPALI_MONTHS[0];
  const dayMeta = NEPALI_DAYS[dayIdx] || NEPALI_DAYS[0];

  const bsMonthPadded = String(bs.month + 1).padStart(2, '0');
  const bsDatePadded = String(bs.date).padStart(2, '0');

  const adMonthPadded = String(ad.month + 1).padStart(2, '0');
  const adDatePadded = String(ad.date).padStart(2, '0');

  return {
    bsYear: bs.year,
    bsMonth: bs.month + 1,
    bsDate: bs.date,
    bsDayNameEn: dayMeta.enName,
    bsDayNameNp: dayMeta.npName,
    bsMonthNameEn: monthMeta.enName,
    bsMonthNameNp: monthMeta.npName,
    bsFormattedEn: `${dayMeta.enName} ${bs.date}, ${monthMeta.enName} ${bs.year}`,
    bsFormattedNp: `${dayMeta.npName} ${toNepaliNumerals(bs.date)}, ${monthMeta.npName} ${toNepaliNumerals(bs.year)}`,
    bsStandardIso: `${bs.year}-${bsMonthPadded}-${bsDatePadded}`,
    bsDevanagariIso: `${toNepaliNumerals(bs.year)}-${toNepaliNumerals(bsMonthPadded)}-${toNepaliNumerals(bsDatePadded)}`,
    adYear: ad.year,
    adMonth: ad.month + 1,
    adDate: ad.date,
    adFormatted: adDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    adStandardIso: `${ad.year}-${adMonthPadded}-${adDatePadded}`,
    jsDate: adDate,
  };
}

export function convertBStoAD(bsYear: number, bsMonth: number, bsDay: number): BSConversionResult {
  // bsMonth is 1-12, NepaliDate expects monthIndex 0-11
  const nepali = new NepaliDate(bsYear, Math.max(0, bsMonth - 1), bsDay);
  const jsDate = nepali.toJsDate();
  return convertADtoBS(jsDate);
}

// ─── Date Difference & Age Calculation ──────────────────────────────────────

export interface DateDiffResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  remainingDays: number;
  totalHours: number;
  totalMinutes: number;
  businessDays: number; // excluding Saturdays (Nepal weekend standard)
  isFuture: boolean;
  summary: string;
}

export function calculateDateDifference(startDate: Date, endDate: Date): DateDiffResult {
  const isFuture = endDate.getTime() >= startDate.getTime();
  const early = isFuture ? new Date(startDate) : new Date(endDate);
  const late = isFuture ? new Date(endDate) : new Date(startDate);

  // Normalize time components to midnight
  early.setHours(0, 0, 0, 0);
  late.setHours(0, 0, 0, 0);

  const diffMs = late.getTime() - early.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  // Working / Business days count (excluding Saturday = day 6)
  let businessDays = 0;
  const cur = new Date(early);
  while (cur < late) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay();
    if (day !== 6) { // In Nepal, Saturday is the official weekend day
      businessDays++;
    }
  }

  // Exact calendar year/month/day calculation
  let years = late.getFullYear() - early.getFullYear();
  let months = late.getMonth() - early.getMonth();
  let days = late.getDate() - early.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(late.getFullYear(), late.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    remainingDays,
    totalHours,
    totalMinutes,
    businessDays,
    isFuture,
    summary: parts.join(', '),
  };
}

// ─── Timezone Offsets Reference ─────────────────────────────────────────────

export interface TimezoneEntry {
  city: string;
  country: string;
  tz: string;
  label: string;
  offset: string;
}

export const POPULAR_TIMEZONES: TimezoneEntry[] = [
  { city: 'Kathmandu', country: 'Nepal', tz: 'Asia/Kathmandu', label: 'Nepal Time (NPT)', offset: 'UTC+5:45' },
  { city: 'New Delhi', country: 'India', tz: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: 'UTC+5:30' },
  { city: 'Dubai', country: 'UAE', tz: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', offset: 'UTC+4:00' },
  { city: 'London', country: 'UK', tz: 'Europe/London', label: 'London (GMT / BST)', offset: 'UTC+0 / +1' },
  { city: 'New York', country: 'USA', tz: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5 / -4' },
  { city: 'San Francisco', country: 'USA', tz: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8 / -7' },
  { city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: 'UTC+9:00' },
  { city: 'Sydney', country: 'Australia', tz: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)', offset: 'UTC+10 / +11' },
];

export function formatInTimezone(date: Date, timeZone: string): { time: string; date: string; full: string } {
  try {
    const time = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);

    const dateStr = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);

    return { time, date: dateStr, full: `${dateStr} · ${time}` };
  } catch {
    return { time: '--:--', date: '----', full: 'Unavailable' };
  }
}
