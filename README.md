# CB350 QuizHub — Setup Guide

Live quiz platform for **CB350 Building Materials & Testing**  
Dr. Mohammed Rady · Construction and Building Engineering

---

## What's in this project

```
cb350_quizhub/
├── src/
│   ├── config.js          ← ✅ Supabase credentials already filled in
│   ├── TutorPortal.jsx    ← Tutor interface (AI questions via built-in proxy)
│   ├── StudentPortal.jsx  ← Student interface
│   ├── tutor-main.jsx     ← Entry point for tutor page
│   └── student-main.jsx   ← Entry point for student page
├── tutor.html             ← Tutor page
├── student.html           ← Student page
├── SCHEMA.sql             ← Run this once in Supabase
├── vite.config.js
├── package.json
└── README.md
```

> ℹ️ **No Anthropic API key needed.** Question generation uses a built-in Claude proxy — nothing is exposed to students.

---

## Step 1 — Run the database schema (one-time)

1. Go to **https://supabase.com** and open your project dashboard
2. Click **SQL Editor** (left sidebar) → **New Query**
3. Open `SCHEMA.sql`, copy everything, paste it in
4. Click **Run** — you should see "Success. No rows returned."

---

## Step 2 — Install & run locally

Make sure you have **Node.js 18+** installed, then:

```bash
npm install
npm run dev
```

Vite will start a local server:
- **Tutor portal:** http://localhost:5173/tutor.html
- **Student portal:** http://localhost:5173/student.html

---

## Step 3 — Deploy (optional)

### Option A — Netlify (easiest, free)
```bash
npm run build
# Drag the dist/ folder to https://app.netlify.com/drop
```

### Option B — Vercel
```bash
npm install -g vercel
vercel
```

---

## How it works in the classroom

### Tutor flow
1. Open **tutor.html**
2. Click a topic → Claude AI generates 6 questions
3. Share the **6-character room code** with students
4. Click **Launch Quiz** when everyone is in
5. Timer counts down, live bar chart shows answers
6. Click **Reveal Answer** → **Next Question**
7. View the **Final Leaderboard** at the end

### Student flow
1. Open **student.html** on phone or laptop
2. Enter name + room code → join lobby
3. Quiz appears automatically when tutor launches
4. Tap an answer (faster = bonus points)
5. See instant feedback, score, streak counter
6. Final leaderboard when done

---

## Topics covered

| Topic | Key concepts |
|-------|-------------|
| Steel & Stress-Strain | σ=P/A, ε=ΔL/L₀, E=200GPa, yield point, ductility, corrosion |
| Aggregates | Coarse/fine classification, crushing/impact/abrasion tests, sieve analysis |
| Cement | C₃S/C₂S/C₃A/C₄AF, flash vs false set, setting times, grades |
| Water & W/C Ratio | Hydration needs, capillary pores, bleeding, seawater |
| Admixtures | Water reducers, retarders, accelerators, silica fume, fly ash |
| Fresh Concrete | Slump cone test, true/shear/collapse slump, workability |

---

## Troubleshooting

**"Room not found" error when joining:**  
→ Make sure you ran `SCHEMA.sql` successfully in Supabase

**Questions not generating (falls back to defaults):**  
→ The built-in AI proxy requires the app to be opened via Claude.ai or a Claude-powered environment. If running standalone, the fallback questions are used automatically — they cover all topics perfectly.

**Students can't join from other devices:**  
→ For local dev, they need the same WiFi network and your machine's IP (e.g. `http://192.168.1.x:5173/student.html`)  
→ Or deploy to Netlify/Vercel for public access

**Realtime updates not working:**  
→ Make sure you ran the `alter publication supabase_realtime add table ...` lines in `SCHEMA.sql`

---

Built with React + Vite + Supabase + Claude AI
