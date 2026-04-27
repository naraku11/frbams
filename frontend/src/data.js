// data.js — mock data for FRBAMS

const FIRST = ["Maya","Liam","Zara","Noah","Aisha","Ethan","Sana","Kai","Ines","Theo","Yara","Omar","Leo","Mira","Eli","Ana","Ravi","Iris","Jude","Niko","Soren","Lila","Arjun","Hana"];
const LAST = ["Park","Okafor","Singh","Bennett","Hassan","Müller","Tanaka","Romero","Chen","Pereira","Khoury","Almeida","Lindqvist","Vogel","Patel","Ito","Costa","Novak","Rao","Holm"];
export const COURSES = ["Calculus II","Org Chem","World Lit","Linear Algebra","Macro Econ","Intro CS","French III","Modern Art","Genetics","Stat Methods"];
export const GRADES = ["10A","10B","11A","11B","12A","12B"];

function pseudo(seed) {
  let x = seed;
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
}

export const STUDENTS = (() => {
  const r = pseudo(7);
  return Array.from({length: 36}, (_, i) => {
    const f = FIRST[Math.floor(r()*FIRST.length)];
    const l = LAST[Math.floor(r()*LAST.length)];
    const id = "S" + String(2400 + i).padStart(4, "0");
    const rate = 0.78 + r() * 0.21;
    const grade = GRADES[Math.floor(r()*GRADES.length)];
    return { id, name: f + " " + l, first: f, last: l, grade, rate, hue: Math.floor(r()*360) };
  });
})();

export const TODAY_LOG = (() => {
  const r = pseudo(11);
  const out = [];
  for (let i = 0; i < 14; i++) {
    const s = STUDENTS[i];
    const hour = 7 + Math.floor(r()*2);
    const min = Math.floor(r()*60);
    const status = r() < 0.78 ? "present" : (r() < 0.6 ? "late" : "absent");
    out.push({
      id: s.id, name: s.name, grade: s.grade,
      time: `${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}`,
      status,
      course: COURSES[i % COURSES.length],
      conf: 0.92 + r()*0.07,
    });
  }
  return out.sort((a,b) => a.time.localeCompare(b.time));
})();

export const WEEK_BARS = [
  { d: "Mon", v: 92 }, { d: "Tue", v: 88 }, { d: "Wed", v: 94 },
  { d: "Thu", v: 86 }, { d: "Fri", v: 79 }, { d: "Sat", v: 0, off: true }, { d: "Sun", v: 0, off: true },
];

export const MONTH_BARS = Array.from({length: 30}, (_, i) => ({
  d: i+1, v: 65 + Math.floor(Math.sin(i*0.7)*10) + Math.floor((i*7)%18),
}));

export function makeMonth(seed) {
  const r = pseudo(seed);
  return Array.from({length: 30}, (_, i) => {
    const dow = (i + 3) % 7;
    if (dow === 5 || dow === 6) return "weekend";
    if (i > 23) return "future";
    const v = r();
    return v < 0.82 ? "present" : v < 0.92 ? "late" : "absent";
  });
}

export const NOTIFICATIONS = [
  { type: "late", who: "Noah Bennett", text: "arrived 18 min late to Calculus II", time: "2 min ago", id: "S2401" },
  { type: "absent", who: "Aisha Hassan", text: "marked absent — 3rd consecutive day", time: "12 min ago", id: "S2404" },
  { type: "leave", who: "Theo Lindqvist", text: "submitted a leave request for Apr 28", time: "34 min ago", id: "S2409" },
  { type: "system", who: "Camera 02 — North Wing", text: "lighting drop detected, recalibrating", time: "1 hr ago" },
  { type: "ok", who: "Class 11A", text: "100% on-time attendance today", time: "2 hr ago" },
];

export const LEAVE = [
  { name: "Theo Lindqvist", grade: "11B", reason: "Family travel — return Mon", date: "Apr 28 – Apr 30", status: "pending" },
  { name: "Maya Park", grade: "10A", reason: "Medical appointment", date: "Apr 27", status: "pending" },
  { name: "Omar Almeida", grade: "12A", reason: "Debate tournament (school approved)", date: "May 2 – May 4", status: "approved" },
  { name: "Iris Vogel", grade: "10B", reason: "Sick", date: "Apr 24", status: "approved" },
];
