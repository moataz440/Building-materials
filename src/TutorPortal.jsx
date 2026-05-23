import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON } from "./config.js";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ── Course material summary for AI question generation ─────── */
const MATERIAL = `CB350 Building Materials & Testing. Steel: stress=P/A; strain=ΔL/L₀; E=σ/ε; steel E≈200GPa; yield point is design limit; ductility=% elongation & % area reduction; weakness=corrosion; types=reinforced/hot-rolled/cold-formed. Aggregates: 60-75% of concrete; coarse>4.75mm fine<4.75mm; flaky<0.6×mean elongated>1.8×mean; crushing=strength, impact=toughness(low=tough), abrasion=durability; well-graded best. Cement: crush→1450°C→+5%gypsum; C3S=early strength C2S=late C3A=flash set; flash set=no remix; false set=can remix; initial set 45min-3hrs final≤10hrs; grades 32.5/42.5/52.5MPa. Water: W/C 0.25-0.30 hydration 0.40-0.60 typical; surplus→capillary pores; seawater=chlorides corrode rebar. Admixtures: water-reducers disperse particles; retarder delays initial but DECREASES initial-to-final time; air-entraining=freeze-thaw; silica fume=strength; fly ash=workability; CaCl2 corrodes rebar. Fresh Concrete: slump cone most common; true slump=good; bleeding/segregation reduce homogeneity; Ve-Be=dry; flow table=wet.`;

/* ── Fallback questions per topic ────────────────────────────── */
const SAMPLES = {
  steel:[
    {q:"Formula for engineering stress?",a:"σ = P/A",opts:["σ = P/A","σ = ΔL/L₀","σ = E × ε","σ = P × A"]},
    {q:"Steel's approximate Modulus of Elasticity:",a:"200 GPa",opts:["100 GPa","200 GPa","50 GPa","400 GPa"]},
    {q:"Steel's primary structural weakness:",a:"Corrosion",opts:["Low density","Corrosion","Brittleness","High cost"]},
    {q:"Which point marks the practical design limit?",a:"Yield Point",opts:["Proportional Limit","Elastic Limit","Yield Point","Ultimate Tensile Strength"]},
    {q:"High Modulus of Elasticity means a material is:",a:"Very stiff",opts:["Very flexible","Very stiff","Very ductile","Very weak"]},
    {q:"Ductility is measured by:",a:"% Elongation",opts:["% Elongation","Yield Strength","Modulus of Elasticity","Ultimate Strength"]},
  ],
  aggregates:[
    {q:"Aggregates occupy what % of concrete volume?",a:"60–75%",opts:["20–30%","40–50%","60–75%","85–90%"]},
    {q:"Sieve size separating coarse from fine aggregate:",a:"4.75 mm",opts:["2.36 mm","4.75 mm","9.5 mm","1.18 mm"]},
    {q:"Which test measures aggregate toughness?",a:"Impact Test",opts:["Crushing Test","Impact Test","Abrasion Test","Sieve Analysis"]},
    {q:"Low impact value means the aggregate is:",a:"Tough",opts:["Brittle","Weak","Tough","Flaky"]},
    {q:"Gradation type giving maximum density:",a:"Well-graded",opts:["Poorly graded","Gap graded","Well-graded","Single-sized"]},
    {q:"Flaky aggregate has any dimension less than:",a:"0.6 × mean diameter",opts:["0.4 × mean","0.6 × mean diameter","1.0 × mean","1.8 × mean"]},
  ],
  cement:[
    {q:"Gypsum added during cement grinding:",a:"5%",opts:["2%","5%","10%","15%"]},
    {q:"Compound providing early strength (first 14 days):",a:"C₃S",opts:["C₂S","C₃A","C₃S","C₄AF"]},
    {q:"Portland cement initial setting time range:",a:"45 min – 3 hrs",opts:["5–15 min","45 min – 3 hrs","6–12 hrs","24–48 hrs"]},
    {q:"Flash setting differs from false setting because it:",a:"Cannot be corrected by remixing",opts:["Has no heat","Can be corrected by remixing","Cannot be corrected by remixing","Too much gypsum"]},
    {q:"Temperature for clinker formation in rotary kiln:",a:"1450°C",opts:["800°C","1000°C","1200°C","1450°C"]},
    {q:"Grade 42.5 cement achieves minimum strength after:",a:"28 days",opts:["7 days","14 days","28 days","56 days"]},
  ],
  water:[
    {q:"W/C ratio needed purely for hydration:",a:"0.25–0.30",opts:["0.10–0.15","0.25–0.30","0.40–0.60","0.70–0.90"]},
    {q:"Surplus water creates what in hardened concrete?",a:"Capillary pores",opts:["Extra strength","Capillary pores","Better workability","Faster hydration"]},
    {q:"Seawater is avoided for RC because:",a:"Chlorides corrode steel",opts:["It smells","Makes concrete blue","Chlorides corrode steel","Evaporates fast"]},
    {q:"Bleeding in concrete refers to:",a:"Water rising to the surface",opts:["Cement leaking","Water rising to the surface","Air escaping","Aggregate sinking"]},
    {q:"Potable water is generally:",a:"Suitable for concrete mixing",opts:["Too pure","Suitable for concrete mixing","Too acidic","Unsuitable"]},
    {q:"Higher W/C ratio leads to:",a:"Higher permeability",opts:["Higher strength","Higher permeability","Faster hydration","Darker color"]},
  ],
  admixtures:[
    {q:"Water-reducing admixtures work by:",a:"Dispersing cement particles",opts:["Adding more water","Dispersing cement particles","Accelerating hydration","Creating air bubbles"]},
    {q:"Set retarders decrease time between:",a:"Initial and final set",opts:["Mixing and initial set","Initial and final set","Final set and hardening","Casting and curing"]},
    {q:"Active admixture that most increases strength:",a:"Silica Fume",opts:["Fly Ash","Slag","Silica Fume","Limestone Powder"]},
    {q:"Main risk of calcium chloride as accelerator:",a:"Corrosion of reinforcement",opts:["Flash setting","Corrosion of reinforcement","Excess air","Reduced workability"]},
    {q:"Air-entraining admixtures protect against:",a:"Freeze-thaw damage",opts:["Shrinkage","Freeze-thaw damage","Corrosion","Segregation"]},
    {q:"Fly ash primarily improves:",a:"Workability",opts:["Early strength","Workability","Color","Freeze resistance"]},
  ],
  fresh:[
    {q:"Most common workability test for fresh concrete:",a:"Slump Cone Test",opts:["Ve-Be Test","Compaction Factor","Slump Cone Test","Flow Table Test"]},
    {q:"Which slump type indicates a good cohesive mix?",a:"True slump",opts:["Shear slump","Collapse slump","True slump","No slump"]},
    {q:"Bleeding and segregation in fresh concrete:",a:"Reduce homogeneity and strength",opts:["Improve homogeneity","Reduce homogeneity and strength","Increase workability","Have no effect"]},
    {q:"Ve-Be test is best for:",a:"Very dry concrete",opts:["Very wet concrete","Very dry concrete","Normal slump","Air-entrained concrete"]},
    {q:"Higher temperature in fresh concrete causes:",a:"Faster setting",opts:["Slower setting","More workability","Faster setting","Lower strength"]},
    {q:"Workability is primarily affected by:",a:"Water content",opts:["Cement color","Water content","Aggregate color","Mixer speed"]},
  ],
};

const TOPICS = [
  {id:"steel",      label:"Steel & Stress-Strain", sub:"Mechanical properties, yield, E, ductility"},
  {id:"aggregates", label:"Aggregates",             sub:"Classification, testing, sieve analysis"},
  {id:"cement",     label:"Cement",                 sub:"Compounds, manufacturing, setting times"},
  {id:"water",      label:"Water & W/C Ratio",      sub:"Hydration, impurities, bleeding"},
  {id:"admixtures", label:"Admixtures",             sub:"Chemical & mineral types, mechanisms"},
  {id:"fresh",      label:"Fresh Concrete",         sub:"Workability, slump tests, segregation"},
];

const OPT_COLORS = ["#F59E0B","#10B981","#60A5FA","#F472B6"];
const LABELS     = ["A","B","C","D"];

function genCode(){
  const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join("");
}
function shuffle(a){ return [...a].sort(()=>Math.random()-0.5); }

/* ── AI question generation via built-in Claude proxy (no API key needed) ── */
async function generateQuestions(topic) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are a quiz generator for CB350 Building Materials & Testing. Generate exactly 6 multiple-choice questions about "${topic.label}". Use ONLY this course material: ${MATERIAL}. Return ONLY valid JSON, no markdown: {"questions":[{"q":"...","a":"exact correct option","opts":["opt1","opt2","opt3","opt4"]}]}. Rules: correct answer must exactly match one option; vary difficulty (2 easy, 2 medium, 2 hard); max 8 words per option.`,
        messages: [{ role: "user", content: `Generate 6 quiz questions on: ${topic.label}` }],
      }),
    });
    const d = await res.json();
    const raw = d.content.map(b => b.text || "").join("").replace(/```json|```/g,"").trim();
    return shuffle(JSON.parse(raw).questions);
  } catch {
    return shuffle(SAMPLES[topic.id] || SAMPLES.steel);
  }
}

/* ── CSS ─────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { min-height: 100%; }
body { background: #0A0C10; }

.app {
  background: #0A0C10;
  min-height: 100vh;
  color: #ECE9E3;
  font-family: 'Outfit', sans-serif;
  position: relative;
  overflow-x: hidden;
}
.app::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 800px 500px at 85% -5%, rgba(245,158,11,0.08) 0%, transparent 55%),
    radial-gradient(ellipse 600px 500px at -10% 85%, rgba(96,165,250,0.05) 0%, transparent 55%);
  pointer-events: none;
  z-index: 0;
}
.wrap {
  position: relative;
  z-index: 1;
  padding: 1.75rem 1.5rem;
  max-width: 740px;
  margin: 0 auto;
}

/* ── Top bar ── */
.topbar {
  display: flex; align-items: center; gap: 10px;
  padding-bottom: 1.25rem; margin-bottom: 1.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.wordmark { font-size: 17px; font-weight: 800; color: #ECE9E3; letter-spacing: -0.5px; }
.wordmark em { color: #F59E0B; font-style: normal; }

/* ── Chips / badges ── */
.chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; font-weight: 600;
  letter-spacing: 1.5px; padding: 3px 10px;
  border-radius: 4px; border: 1px solid;
  white-space: nowrap;
}
.chip-amber { background: rgba(245,158,11,0.1); color: #F59E0B; border-color: rgba(245,158,11,0.3); }
.chip-green { background: rgba(16,185,129,0.1); color: #34D399; border-color: rgba(16,185,129,0.3); }
.chip-blue  { background: rgba(96,165,250,0.1); color: #60A5FA; border-color: rgba(96,165,250,0.3); }
.chip-red   { background: rgba(239,68,68,0.1);  color: #F87171; border-color: rgba(239,68,68,0.3); }

/* ── Section label ── */
.sec-label {
  font-size: 10px; font-weight: 600; letter-spacing: 2.5px;
  text-transform: uppercase; color: rgba(236,233,227,0.28);
  margin-bottom: 0.875rem;
}

/* ── Cards ── */
.card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 1.25rem;
}
.card-amber {
  border-color: rgba(245,158,11,0.25);
  background: rgba(245,158,11,0.04);
}

/* ── Topic grid ── */
.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 1.5rem;
}
.topic-btn {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 1.1rem 1rem;
  cursor: pointer; text-align: left;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  font-family: 'Outfit', sans-serif;
}
.topic-btn:hover {
  background: rgba(245,158,11,0.07);
  border-color: rgba(245,158,11,0.35);
  transform: translateY(-2px);
}
.topic-btn .tl { font-size: 14px; font-weight: 600; color: #ECE9E3; display: block; margin-bottom: 4px; }
.topic-btn .ts { font-size: 11px; color: rgba(236,233,227,0.38); display: block; }

/* ── Room code display ── */
.code-box { text-align: center; padding: 1.75rem 0 1.25rem; }
.code-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 52px; font-weight: 600;
  letter-spacing: 14px; color: #F59E0B;
  text-shadow: 0 0 80px rgba(245,158,11,0.3);
}
.code-hint { font-size: 12px; color: rgba(236,233,227,0.3); margin-top: 8px; }

/* ── Stats row ── */
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.25rem; }
.stat {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; padding: 1rem; text-align: center;
}
.stat-v { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 500; color: #ECE9E3; }
.stat-l { font-size: 11px; color: rgba(236,233,227,0.35); margin-top: 3px; }

/* ── Student pills ── */
.students-box {
  min-height: 72px; display: flex; flex-wrap: wrap; gap: 8px;
  padding: 0.875rem;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; margin-bottom: 1.25rem;
  align-content: flex-start;
}
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px; padding: 4px 12px;
  font-size: 12px; color: #ECE9E3;
  animation: pop 0.25s ease;
}
@keyframes pop { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
.pulse { width: 6px; height: 6px; border-radius: 50%; background: #34D399; animation: blink 1.5s infinite; }
@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.25 } }

/* ── Buttons ── */
.btn {
  border: none; border-radius: 9px; padding: 13px 18px;
  font-family: 'Outfit', sans-serif; font-size: 15px;
  font-weight: 600; cursor: pointer; transition: all 0.15s; width: 100%;
}
.btn-amber { background: #F59E0B; color: #0A0C10; }
.btn-amber:hover { background: #FBBF24; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(245,158,11,0.25); }
.btn-amber:disabled { background: rgba(255,255,255,0.07); color: rgba(236,233,227,0.25); cursor: not-allowed; transform: none; box-shadow: none; }
.btn-ghost { background: rgba(255,255,255,0.04); color: #ECE9E3; border: 1px solid rgba(255,255,255,0.1); }
.btn-ghost:hover { background: rgba(255,255,255,0.09); }
.btn-back {
  background: none; border: none; cursor: pointer;
  color: rgba(236,233,227,0.35); font-family: 'Outfit', sans-serif;
  font-size: 13px; padding: 0; display: flex; align-items: center; gap: 5px;
  transition: color 0.15s;
}
.btn-back:hover { color: #ECE9E3; }

/* ── Progress bar ── */
.progress { height: 2px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 1.25rem; }
.progress-f { height: 100%; background: linear-gradient(90deg, #F59E0B, #FCD34D); border-radius: 2px; transition: width 0.5s; }

/* ── Question card ── */
.q-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-left: 3px solid #F59E0B;
  border-radius: 12px; padding: 1.5rem;
  margin-bottom: 1rem;
}
.q-text { font-size: 19px; font-weight: 500; line-height: 1.6; color: #ECE9E3; }
.q-meta { font-size: 10px; font-weight: 600; letter-spacing: 2px; color: rgba(236,233,227,0.28); margin-bottom: 8px; }

/* ── Option cards (tutor view) ── */
.opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1rem; }
.opt-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px; padding: 14px 12px;
  position: relative; overflow: hidden;
  transition: border-color 0.2s;
}
.opt-card-correct {
  border-color: rgba(16,185,129,0.45) !important;
  background: rgba(16,185,129,0.07) !important;
}
.opt-bar { position: absolute; left: 0; top: 0; bottom: 0; opacity: 0.13; transition: width 0.7s ease; }
.opt-lbl { font-size: 10px; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 4px; }
.opt-txt { font-size: 13px; font-weight: 500; color: #ECE9E3; display: block; position: relative; }
.opt-cnt {
  position: absolute; right: 10px; top: 50%;
  transform: translateY(-50%);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; color: rgba(236,233,227,0.45);
}
.opt-ck { position: absolute; right: 10px; bottom: 8px; font-size: 10px; color: #34D399; }

/* ── Two-col button row ── */
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* ── Live HUD ── */
.hud { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }

/* ── Leaderboard ── */
.lb-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
}
.lb-row:last-child { border-bottom: none; }
.lb-r { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(236,233,227,0.3); width: 24px; text-align: right; flex-shrink: 0; }
.lb-n { flex: 1; font-size: 14px; font-weight: 500; }
.lb-s { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #F59E0B; font-weight: 600; }

/* ── Spinner ── */
.spinner {
  width: 36px; height: 36px;
  border: 2px solid rgba(255,255,255,0.07);
  border-top-color: #F59E0B;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg) } }

/* ── Empty state ── */
.empty { font-size: 13px; color: rgba(236,233,227,0.25); text-align: center; padding: 1.25rem; }
`;

export default function TutorPortal() {
  const [screen,    setScreen]    = useState("home");
  const [topic,     setTopic]     = useState(null);
  const [roomCode,  setRoomCode]  = useState("");
  const [sid,       setSid]       = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIdx,      setQIdx]      = useState(0);
  const [students,  setStudents]  = useState([]);
  const [answers,   setAnswers]   = useState({});
  const [revealed,  setRevealed]  = useState(false);
  const [timer,     setTimer]     = useState(20);
  const timerRef   = useRef(null);
  const channelRef = useRef(null);

  /* cleanup */
  useEffect(() => () => {
    clearInterval(timerRef.current);
    channelRef.current && sb.removeChannel(channelRef.current);
  }, []);

  /* realtime subscription */
  const subscribeRealtime = useCallback((id) => {
    channelRef.current && sb.removeChannel(channelRef.current);
    const ch = sb.channel(`tutor-${id}`)
      .on("postgres_changes", {event:"*",schema:"public",table:"session_students",filter:`session_id=eq.${id}`},
        async () => {
          const { data } = await sb.from("session_students").select("student_name,score").eq("session_id", id).order("score", {ascending:false});
          if (data) setStudents(data);
        })
      .on("postgres_changes", {event:"*",schema:"public",table:"student_answers",filter:`session_id=eq.${id}`},
        async () => {
          const { data } = await sb.from("student_answers").select("*").eq("session_id", id);
          if (!data) return;
          const m = {};
          data.forEach(r => {
            if (!m[r.question_index]) m[r.question_index] = {};
            m[r.question_index][r.student_name] = { answer: r.answer, points: r.points };
          });
          setAnswers(m);
        })
      .subscribe();
    channelRef.current = ch;
  }, []);

  async function startSetup(t) {
    setTopic(t);
    setScreen("setup");
    const code = genCode();
    setRoomCode(code);
    const qs = await generateQuestions(t);
    setQuestions(qs);
    const { data, error } = await sb.from("sessions").insert({
      code, topic_id: t.id, topic_label: t.label,
      questions: qs, status: "waiting",
      current_question: 0, revealed: false, timer: 20,
    }).select().single();
    if (error || !data) {
      alert("Could not create session.\nPlease check your Supabase credentials in src/config.js");
      setScreen("home");
      return;
    }
    setSid(data.id);
    subscribeRealtime(data.id);
    setScreen("waiting");
  }

  async function launchQuiz() {
    await sb.from("sessions").update({ status:"live", current_question:0, revealed:false, timer:20 }).eq("id", sid);
    setQIdx(0); setRevealed(false); setTimer(20);
    setScreen("live");
    runTimer(sid, 0);
  }

  function runTimer(id) {
    clearInterval(timerRef.current);
    let t = 20;
    setTimer(20);
    timerRef.current = setInterval(async () => {
      t--;
      setTimer(t);
      await sb.from("sessions").update({ timer: t }).eq("id", id);
      if (t <= 0) { clearInterval(timerRef.current); doReveal(id); }
    }, 1000);
  }

  async function doReveal(id) {
    setRevealed(true);
    await sb.from("sessions").update({ revealed: true }).eq("id", id);
  }

  async function nextQ() {
    const next = qIdx + 1;
    if (next >= questions.length) {
      await sb.from("sessions").update({ status: "done" }).eq("id", sid);
      clearInterval(timerRef.current);
      setScreen("review");
      return;
    }
    setQIdx(next); setRevealed(false); setTimer(20);
    await sb.from("sessions").update({ current_question: next, revealed: false, timer: 20 }).eq("id", sid);
    runTimer(sid);
  }

  async function endSession() {
    clearInterval(timerRef.current);
    await sb.from("sessions").update({ status: "done" }).eq("id", sid);
    setScreen("review");
  }

  function reset() {
    clearInterval(timerRef.current);
    channelRef.current && sb.removeChannel(channelRef.current);
    setScreen("home"); setTopic(null); setRoomCode(""); setSid(null);
    setQuestions([]); setQIdx(0); setStudents([]); setAnswers({}); setRevealed(false);
  }

  const qAnswers    = answers[qIdx] || {};
  const answeredCnt = Object.keys(qAnswers).length;
  const leaderboard = [...students].sort((a, b) => b.score - a.score);
  const pct         = questions.length > 0 ? Math.round((qIdx / questions.length) * 100) : 0;
  const currentQ    = questions[qIdx];
  const tc          = timer > 10 ? "#F59E0B" : timer > 5 ? "#F87171" : "#EF4444";

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="wrap">

          {/* ── HOME ───────────────────────────────────────────── */}
          {screen === "home" && (
            <>
              <div className="topbar">
                <div className="wordmark">CB350 <em>QuizHub</em></div>
                <div className="chip chip-amber">TUTOR PORTAL</div>
              </div>
              <div className="sec-label">Select a topic to generate a live quiz session</div>
              <div className="topic-grid">
                {TOPICS.map(t => (
                  <button key={t.id} className="topic-btn" onClick={() => startSetup(t)}>
                    <span className="tl">{t.label}</span>
                    <span className="ts">{t.sub}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── GENERATING ─────────────────────────────────────── */}
          {screen === "setup" && (
            <div style={{textAlign:"center", padding:"4rem 0"}}>
              <div className="spinner" style={{marginBottom:"1rem"}} />
              <div style={{fontSize:14, color:"rgba(236,233,227,0.4)"}}>
                Generating questions for <strong style={{color:"#ECE9E3"}}>{topic?.label}</strong>…
              </div>
            </div>
          )}

          {/* ── WAITING ROOM ───────────────────────────────────── */}
          {screen === "waiting" && (
            <>
              <div className="topbar">
                <button className="btn-back" onClick={reset}>← Back</button>
                <div style={{marginLeft:"auto", display:"flex", gap:8}}>
                  <div className="chip chip-amber">{topic?.label}</div>
                  <div className="chip chip-green">OPEN</div>
                </div>
              </div>

              <div className="card card-amber" style={{marginBottom:"1.25rem"}}>
                <div className="code-box">
                  <div style={{fontSize:10, letterSpacing:3, color:"rgba(245,158,11,0.55)", textTransform:"uppercase", marginBottom:10}}>
                    Room Code
                  </div>
                  <div className="code-val">{roomCode}</div>
                  <div className="code-hint">Share this code with your students · Student portal: student.html</div>
                </div>
              </div>

              <div className="stats">
                <div className="stat">
                  <div className="stat-v">{students.length}</div>
                  <div className="stat-l">Students joined</div>
                </div>
                <div className="stat">
                  <div className="stat-v">{questions.length}</div>
                  <div className="stat-l">Questions ready</div>
                </div>
              </div>

              <div className="sec-label">Students in room</div>
              <div className="students-box">
                {students.length === 0
                  ? <span style={{fontSize:13, color:"rgba(236,233,227,0.2)", margin:"auto"}}>Waiting for students to join…</span>
                  : students.map(s => (
                    <span key={s.student_name} className="pill">
                      <span className="pulse" /> {s.student_name}
                    </span>
                  ))
                }
              </div>

              <button className="btn btn-amber" onClick={launchQuiz} disabled={students.length === 0}>
                {students.length === 0
                  ? "Waiting for students…"
                  : `Launch Quiz  ·  ${students.length} student${students.length > 1 ? "s" : ""} ready`
                }
              </button>
            </>
          )}

          {/* ── LIVE QUIZ ──────────────────────────────────────── */}
          {screen === "live" && currentQ && (
            <>
              <div className="topbar">
                <div className="chip chip-amber">{topic?.label}</div>
                <div style={{marginLeft:"auto", display:"flex", gap:8, alignItems:"center"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(236,233,227,0.35)"}}>
                    #{roomCode}
                  </span>
                  <div className="chip chip-red">LIVE</div>
                </div>
              </div>

              <div className="progress">
                <div className="progress-f" style={{width:`${pct}%`}} />
              </div>

              <div className="hud">
                <span style={{fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"rgba(236,233,227,0.35)"}}>
                  Q{qIdx+1} / {questions.length}&nbsp;&nbsp;·&nbsp;&nbsp;{answeredCnt} / {students.length} answered
                </span>
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3"/>
                  <circle cx="26" cy="26" r="22" fill="none" stroke={tc} strokeWidth="3"
                    strokeDasharray={`${2*Math.PI*22}`}
                    strokeDashoffset={`${2*Math.PI*22*(1-(timer/20))}`}
                    strokeLinecap="round" transform="rotate(-90 26 26)"
                    style={{transition:"stroke-dashoffset 1s linear, stroke 0.3s"}}
                  />
                  <text x="26" y="31" textAnchor="middle" fill={tc} fontSize="14" fontFamily="JetBrains Mono" fontWeight="500">
                    {timer}
                  </text>
                </svg>
              </div>

              <div className="q-card">
                <div className="q-meta">QUESTION {qIdx+1} / {questions.length}</div>
                <div className="q-text">{currentQ.q}</div>
              </div>

              <div className="opts">
                {currentQ.opts.map((opt, i) => {
                  const cnt = Object.values(qAnswers).filter(v => v.answer === opt).length;
                  const bp  = students.length > 0 ? Math.round((cnt / students.length) * 100) : 0;
                  const isC = opt === currentQ.a;
                  return (
                    <div key={i} className={`opt-card${revealed && isC ? " opt-card-correct" : ""}`}>
                      <div className="opt-bar" style={{width:`${bp}%`, background:OPT_COLORS[i]}} />
                      <span className="opt-lbl" style={{color:OPT_COLORS[i]}}>{LABELS[i]}</span>
                      <span className="opt-txt">{opt}</span>
                      {cnt > 0 && <span className="opt-cnt">{cnt}</span>}
                      {revealed && isC && <span className="opt-ck">✓ correct</span>}
                    </div>
                  );
                })}
              </div>

              <div className="two">
                {!revealed
                  ? <button className="btn btn-amber" onClick={() => doReveal(sid)}>Reveal Answer</button>
                  : <button className="btn btn-amber" onClick={nextQ}>
                      {qIdx + 1 < questions.length ? "Next Question →" : "End & View Results"}
                    </button>
                }
                <button className="btn btn-ghost" onClick={endSession}>End Session</button>
              </div>
            </>
          )}

          {/* ── REVIEW ─────────────────────────────────────────── */}
          {screen === "review" && (
            <>
              <div className="topbar">
                <div className="wordmark">CB350 <em>Results</em></div>
                <div className="chip chip-amber">{topic?.label}</div>
              </div>

              <div className="stats">
                <div className="stat">
                  <div className="stat-v">{students.length}</div>
                  <div className="stat-l">Students</div>
                </div>
                <div className="stat">
                  <div className="stat-v">{questions.length}</div>
                  <div className="stat-l">Questions</div>
                </div>
              </div>

              <div className="sec-label">Final Leaderboard</div>
              <div className="card" style={{marginBottom:"1.25rem"}}>
                {leaderboard.length === 0
                  ? <div className="empty">No submissions recorded.</div>
                  : leaderboard.map((s, i) => (
                    <div key={i} className="lb-row">
                      <span className="lb-r">{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</span>
                      <span className="lb-n">{s.student_name}</span>
                      <span className="lb-s">{s.score} pts</span>
                    </div>
                  ))
                }
              </div>

              <button className="btn btn-amber" onClick={reset}>Start New Session</button>
            </>
          )}

        </div>
      </div>
    </>
  );
}
