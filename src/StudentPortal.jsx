import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON } from "./config.js";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

const OPT_COLORS = ["#F59E0B","#10B981","#60A5FA","#F472B6"];
const LABELS     = ["A","B","C","D"];

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
    radial-gradient(ellipse 700px 500px at 15% -5%, rgba(96,165,250,0.07) 0%, transparent 55%),
    radial-gradient(ellipse 600px 500px at 90% 90%, rgba(244,114,182,0.05) 0%, transparent 55%);
  pointer-events: none;
  z-index: 0;
}
.wrap {
  position: relative;
  z-index: 1;
  padding: 1.75rem 1.5rem;
  max-width: 580px;
  margin: 0 auto;
}

/* ── Top bar ── */
.topbar {
  display: flex; align-items: center; gap: 10px;
  padding-bottom: 1.25rem; margin-bottom: 1.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.wordmark { font-size: 17px; font-weight: 800; color: #ECE9E3; letter-spacing: -0.5px; }
.wordmark em { color: #60A5FA; font-style: normal; }

/* ── Chips ── */
.chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; font-weight: 600;
  letter-spacing: 1.5px; padding: 3px 10px;
  border-radius: 4px; border: 1px solid;
  white-space: nowrap;
}
.chip-blue  { background: rgba(96,165,250,0.1);  color: #60A5FA; border-color: rgba(96,165,250,0.3); }
.chip-green { background: rgba(16,185,129,0.1);  color: #34D399; border-color: rgba(16,185,129,0.3); }
.chip-amber { background: rgba(245,158,11,0.1);  color: #F59E0B; border-color: rgba(245,158,11,0.3); }
.chip-red   { background: rgba(239,68,68,0.1);   color: #F87171; border-color: rgba(239,68,68,0.3); }

/* ── Cards ── */
.card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 1.25rem;
}
.card-blue {
  border-color: rgba(96,165,250,0.25);
  background: rgba(96,165,250,0.04);
}

/* ── Section label ── */
.sec-label {
  font-size: 10px; font-weight: 600; letter-spacing: 2.5px;
  text-transform: uppercase; color: rgba(236,233,227,0.28);
  margin-bottom: 0.875rem;
}

/* ── Form fields ── */
.field { margin-bottom: 14px; }
.field label {
  display: block; font-size: 11px; font-weight: 600;
  letter-spacing: 1px; color: rgba(236,233,227,0.4);
  margin-bottom: 6px; text-transform: uppercase;
}
.field input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 9px; padding: 12px 14px;
  color: #ECE9E3; font-family: 'Outfit', sans-serif;
  font-size: 15px; width: 100%; outline: none;
  transition: border-color 0.15s;
}
.field input:focus { border-color: rgba(96,165,250,0.5); }
.field input::placeholder { color: rgba(236,233,227,0.2); }
.code-input {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 26px !important; font-weight: 600 !important;
  letter-spacing: 10px !important;
  text-transform: uppercase !important;
  text-align: center !important;
}

/* ── Buttons ── */
.btn {
  border: none; border-radius: 9px; padding: 13px 18px;
  font-family: 'Outfit', sans-serif; font-size: 15px;
  font-weight: 600; cursor: pointer; transition: all 0.15s; width: 100%;
}
.btn-blue { background: #60A5FA; color: #0A0C10; }
.btn-blue:hover { background: #93C5FD; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(96,165,250,0.2); }
.btn-ghost { background: rgba(255,255,255,0.04); color: #ECE9E3; border: 1px solid rgba(255,255,255,0.1); }
.btn-ghost:hover { background: rgba(255,255,255,0.09); }
.btn-admin {
  margin-left: auto; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09); border-radius: 7px;
  padding: 5px 13px; font-size: 11px; font-weight: 600;
  color: rgba(236,233,227,0.35); text-decoration: none;
  font-family: 'Outfit', sans-serif; cursor: pointer;
  letter-spacing: 0.5px; transition: all 0.15s;
  display: inline-flex; align-items: center;
}
.btn-admin:hover { background: rgba(255,255,255,0.09); color: rgba(236,233,227,0.65); }

/* ── Error ── */
.err {
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.22);
  border-radius: 8px; padding: 10px 14px;
  font-size: 13px; color: #F87171; margin-bottom: 12px;
}

/* ── Avatar ring ── */
.avatar-ring {
  width: 68px; height: 68px; border-radius: 50%;
  border: 2px solid rgba(96,165,250,0.3);
  display: flex; align-items: center; justify-content: center;
  background: rgba(96,165,250,0.06);
  margin: 0 auto 1rem; font-size: 28px;
}

/* ── Lobby pills ── */
.lobby-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; }
.lobby-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 20px; font-size: 12px; border: 1px solid;
}
.pill-me    { background: rgba(96,165,250,0.12); border-color: rgba(96,165,250,0.3); color: #93C5FD; }
.pill-other { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); color: #ECE9E3; }

/* ── Pulse animation ── */
.pulse-row { display: flex; gap: 7px; justify-content: center; align-items: center; margin-top: 1.5rem; }
.pulse-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #60A5FA;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse { 0%,80%,100% { opacity:0.15; transform:scale(0.7) } 40% { opacity:1; transform:scale(1) } }

/* ── Progress bar ── */
.progress { height: 2px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 1.25rem; }
.progress-f { height: 100%; background: linear-gradient(90deg, #60A5FA, #93C5FD); border-radius: 2px; transition: width 0.5s; }

/* ── HUD ── */
.hud { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.score-chip {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 5px 13px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px; color: #ECE9E3;
}
.score-chip span { color: rgba(236,233,227,0.4); margin-right: 5px; font-family: 'Outfit', sans-serif; font-size: 12px; }
.streak-chip {
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: 8px; padding: 5px 13px;
  font-size: 12px; color: #F59E0B; font-weight: 600;
}

/* ── Question card ── */
.q-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-left: 3px solid #60A5FA;
  border-radius: 12px; padding: 1.5rem;
  margin-bottom: 1rem;
}
.q-meta { font-size: 10px; font-weight: 600; letter-spacing: 2px; color: rgba(236,233,227,0.28); margin-bottom: 8px; }
.q-text { font-size: 19px; font-weight: 500; line-height: 1.6; color: #ECE9E3; }

/* ── Answer options ── */
.opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1rem; }
.opt {
  border-radius: 10px; padding: 16px 14px;
  cursor: pointer; position: relative; overflow: hidden;
  border: 1px solid rgba(0,0,0,0.15);
  transition: transform 0.12s, opacity 0.2s;
}
.opt:hover { transform: scale(1.02); }
.opt-lbl { font-size: 10px; font-weight: 700; letter-spacing: 1px; display: block; margin-bottom: 5px; opacity: 0.75; }
.opt-txt { font-size: 14px; font-weight: 600; line-height: 1.35; color: #0A0C10; display: block; }
.opt-done  { cursor: default !important; }
.opt-done:hover { transform: none !important; }
.opt-dim   { opacity: 0.28 !important; }
.opt-glow  { box-shadow: 0 0 0 2px #10B981, 0 0 24px rgba(16,185,129,0.35) !important; }

/* ── Feedback bar ── */
.feedback {
  border-radius: 10px; padding: 12px 16px;
  font-size: 14px; font-weight: 500;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
  animation: fadeUp 0.22s ease;
}
@keyframes fadeUp { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
.fb-ok   { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #34D399; }
.fb-bad  { background: rgba(239,68,68,0.09); border: 1px solid rgba(239,68,68,0.2); color: #F87171; }
.fb-wait {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  color: rgba(236,233,227,0.4); text-align: center; font-size: 13px;
  justify-content: center;
}

/* ── Stats (results) ── */
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.25rem; }
.stat {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; padding: 1rem; text-align: center;
}
.stat-v { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 500; color: #ECE9E3; }
.stat-l { font-size: 11px; color: rgba(236,233,227,0.35); margin-top: 3px; }

/* ── Leaderboard ── */
.lb-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
}
.lb-row:last-child { border-bottom: none; }
.lb-row-me { background: rgba(96,165,250,0.07); padding-left: 8px; padding-right: 8px; }
.lb-r { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(236,233,227,0.3); width: 24px; text-align: right; flex-shrink: 0; }
.lb-n { flex: 1; font-size: 14px; font-weight: 500; }
.lb-s { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #60A5FA; font-weight: 600; }

/* ── Spinner ── */
.spinner {
  width: 36px; height: 36px;
  border: 2px solid rgba(255,255,255,0.07);
  border-top-color: #60A5FA;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg) } }
`;

export default function StudentPortal() {
  const [screen,      setScreen]      = useState("join");
  const [code,        setCode]        = useState("");
  const [name,        setName]        = useState("");
  const [error,       setError]       = useState("");
  const [session,     setSession]     = useState(null);
  const [qIdx,        setQIdx]        = useState(0);
  const [chosen,      setChosen]      = useState(null);
  const [answered,    setAnswered]    = useState(false);
  const [score,       setScore]       = useState(0);
  const [timer,       setTimer]       = useState(20);
  const [revealed,    setRevealed]    = useState(false);
  const [feedback,    setFeedback]    = useState(null);
  const [streak,      setStreak]      = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const channelRef = useRef(null);
  const nameRef    = useRef(name);
  const scoreRef   = useRef(score);

  useEffect(() => { nameRef.current  = name;  }, [name]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => () => { channelRef.current && sb.removeChannel(channelRef.current); }, []);

  async function joinSession() {
    setError("");
    const tc = code.trim().toUpperCase();
    const tn = name.trim();
    if (!tc) { setError("Please enter a room code."); return; }
    if (!tn) { setError("Please enter your name."); return; }

    const { data: sess, error: se } = await sb.from("sessions").select("*").eq("code", tc).single();
    if (se || !sess) { setError("Room not found — double-check the code."); return; }
    if (sess.status === "done") { setError("This session has already ended."); return; }

    // Allow reconnection from the same browser session, but block duplicate names otherwise
    const sessionKey = `joined_${sess.id}_${tn}`;
    const alreadyJoined = localStorage.getItem(sessionKey) === "1";

    if (!alreadyJoined) {
      const { data: taken } = await sb.from("session_students")
        .select("student_name").eq("session_id", sess.id).eq("student_name", tn).maybeSingle();
      if (taken) {
        setError("This name is already taken in this session. Please choose a different name.");
        return;
      }
    }

    const { error: ie } = await sb.from("session_students")
      .upsert({ session_id: sess.id, student_name: tn, score: 0 }, { onConflict: "session_id,student_name" });
    if (ie && ie.code !== "23505") { setError("Could not join session. Please try again."); return; }

    localStorage.setItem(sessionKey, "1");
    setSession(sess);
    setCode(tc);

    if (sess.status === "live") {
      setQIdx(sess.current_question);
      setTimer(sess.timer ?? 20);
      setRevealed(sess.revealed || false);
      setScreen("quiz");
    } else {
      setScreen("lobby");
    }

    subscribeSession(sess.id, tn);
  }

  function subscribeSession(sid, sname) {
    channelRef.current && sb.removeChannel(channelRef.current);

    const ch = sb.channel(`student-${sid}`)
      .on("postgres_changes", { event:"UPDATE", schema:"public", table:"sessions", filter:`id=eq.${sid}` },
        payload => {
          const s = payload.new;
          setSession(s);
          setTimer(s.timer ?? 20);
          setRevealed(s.revealed || false);

          if (s.status === "done") {
            clearChannel();
            fetchLeaderboard(sid);
            setScreen("done");
            return;
          }
          if (s.status === "live") {
            setQIdx(prev => {
              if (s.current_question !== prev) {
                setChosen(null);
                setAnswered(false);
                setFeedback(null);
              }
              return s.current_question;
            });
            setScreen("quiz");
          }
        })
      .on("postgres_changes", { event:"*", schema:"public", table:"session_students", filter:`session_id=eq.${sid}` },
        async () => {
          const { data } = await sb.from("session_students").select("student_name,score").eq("session_id", sid).order("score", {ascending:false});
          if (data) setLeaderboard(data);
        })
      .subscribe();

    channelRef.current = ch;
  }

  function clearChannel() { channelRef.current && sb.removeChannel(channelRef.current); }

  async function fetchLeaderboard(sid) {
    const { data } = await sb.from("session_students").select("student_name,score").eq("session_id", sid).order("score", {ascending:false});
    if (data) setLeaderboard(data);
  }

  async function submitAnswer(opt) {
    if (answered) return;
    const currentName  = nameRef.current;
    const currentScore = scoreRef.current;

    setChosen(opt);
    setAnswered(true);

    const q    = session.questions[qIdx];
    const isC  = opt === q.a;
    const pts  = isC ? 100 + Math.max(0, (timer ?? 0)) * 8 : 0;

    await sb.from("student_answers").upsert(
      { session_id: session.id, student_name: currentName, question_index: qIdx, answer: opt, points: pts, correct: isC },
      { onConflict: "session_id,student_name,question_index" }
    );

    if (isC) {
      const ns = currentScore + pts;
      setScore(ns);
      setStreak(k => k + 1);
      setFeedback({ ok: true, pts, msg: streak >= 1 ? `🔥 ${streak + 1} in a row!` : "Correct!" });
      await sb.from("session_students").update({ score: ns })
        .eq("session_id", session.id).eq("student_name", currentName);
    } else {
      setStreak(0);
      setFeedback({ ok: false, pts: 0, msg: `Correct answer: ${q.a}` });
    }
  }

  function resetAll() {
    clearChannel();
    setScreen("join"); setCode(""); setName(""); setError("");
    setSession(null); setQIdx(0); setChosen(null); setAnswered(false);
    setScore(0); setTimer(20); setRevealed(false); setFeedback(null);
    setStreak(0); setLeaderboard([]);
  }

  const currentQ = session?.questions?.[qIdx];
  const totalQ   = session?.questions?.length || 0;
  const myRank   = leaderboard.findIndex(s => s.student_name === name) + 1;
  const pct      = totalQ > 0 ? Math.round((qIdx / totalQ) * 100) : 0;
  const tc       = timer > 10 ? "#60A5FA" : timer > 5 ? "#F59E0B" : "#EF4444";

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="wrap">

          {/* ── JOIN ─────────────────────────────────────────── */}
          {screen === "join" && (
            <>
              <div className="topbar">
                <div className="wordmark">CB350 <em>QuizHub</em></div>
                <div className="chip chip-blue">STUDENT PORTAL</div>
                <a href="index.html" className="btn-admin">Admin</a>
              </div>

              <div className="card card-blue" style={{textAlign:"center", padding:"1.75rem 1.25rem", marginBottom:"1.5rem"}}>
                <div style={{fontSize:36, marginBottom:10}}>🎓</div>
                <div style={{fontSize:17, fontWeight:700, marginBottom:5}}>Join a Quiz Session</div>
                <div style={{fontSize:13, color:"rgba(236,233,227,0.35)"}}>
                  Enter the room code your tutor displays on screen
                </div>
              </div>

              {error && <div className="err">{error}</div>}

              <div className="field">
                <label>Room code</label>
                <input
                  className="code-input"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && joinSession()}
                  placeholder="XXXXXX"
                  maxLength={6}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              <div className="field">
                <label>Your name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && joinSession()}
                  placeholder="e.g. Ahmed Hassan"
                  autoComplete="name"
                />
              </div>
              <button className="btn btn-blue" onClick={joinSession}>Join Session</button>
            </>
          )}

          {/* ── LOBBY ────────────────────────────────────────── */}
          {screen === "lobby" && (
            <>
              <div className="topbar">
                <div className="wordmark">CB350 <em>QuizHub</em></div>
                <div className="chip chip-green">JOINED</div>
              </div>

              <div style={{textAlign:"center", padding:"1.5rem 0 1.25rem"}}>
                <div className="avatar-ring">🎓</div>
                <div style={{fontSize:20, fontWeight:700, marginBottom:5}}>You're in, {name}!</div>
                <div style={{fontSize:13, color:"rgba(236,233,227,0.4)"}}>
                  Topic: <strong style={{color:"#ECE9E3"}}>{session?.topic_label}</strong>
                </div>
              </div>

              <div className="sec-label">Students in room ({leaderboard.length})</div>
              <div className="lobby-pills">
                {leaderboard.length === 0
                  ? <span style={{fontSize:13, color:"rgba(236,233,227,0.25)"}}>Loading…</span>
                  : leaderboard.map(s => (
                    <span key={s.student_name} className={`lobby-pill ${s.student_name === name ? "pill-me" : "pill-other"}`}>
                      {s.student_name === name ? "● " : ""}{s.student_name}
                    </span>
                  ))
                }
              </div>

              <div style={{textAlign:"center", fontSize:13, color:"rgba(236,233,227,0.3)", marginBottom:4}}>
                Waiting for the tutor to start…
              </div>
              <div className="pulse-row">
                {[0,1,2].map(i => <div key={i} className="pulse-dot" style={{animationDelay:`${i*0.22}s`}} />)}
              </div>
            </>
          )}

          {/* ── QUIZ ─────────────────────────────────────────── */}
          {screen === "quiz" && currentQ && (
            <>
              <div className="topbar">
                <div className="chip chip-blue">{session?.topic_label}</div>
                <div style={{marginLeft:"auto"}}>
                  <div className="chip chip-red">LIVE</div>
                </div>
              </div>

              <div className="progress">
                <div className="progress-f" style={{width:`${pct}%`}} />
              </div>

              <div className="hud">
                <div style={{display:"flex", gap:8}}>
                  <div className="score-chip"><span>Score</span>{score}</div>
                  {streak > 1 && <div className="streak-chip">🔥 {streak}</div>}
                </div>
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
                <div className="q-meta">QUESTION {qIdx+1} / {totalQ}</div>
                <div className="q-text">{currentQ.q}</div>
              </div>

              <div className="opts">
                {currentQ.opts.map((opt, i) => {
                  const isC      = opt === currentQ.a;
                  const isChosen = opt === chosen;
                  const done     = answered || revealed;
                  let cls = "opt";
                  if (done) {
                    cls += " opt-done";
                    if (isC)                   cls += " opt-glow";
                    else if (!isC && isChosen) cls += " opt-dim";
                    else                       cls += " opt-dim";
                  }
                  return (
                    <div key={i} className={cls}
                      style={{background: OPT_COLORS[i], cursor: done ? "default" : "pointer"}}
                      onClick={() => !answered && !revealed && submitAnswer(opt)}>
                      <span className="opt-lbl">{LABELS[i]}</span>
                      <span className="opt-txt">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {feedback && (
                <div className={`feedback ${feedback.ok ? "fb-ok" : "fb-bad"}`}>
                  <span>{feedback.msg}</span>
                  {feedback.ok && (
                    <span style={{fontFamily:"'JetBrains Mono',monospace", fontSize:13}}>+{feedback.pts}</span>
                  )}
                </div>
              )}
              {answered && !feedback && (
                <div className="feedback fb-wait">Waiting for tutor to reveal the answer…</div>
              )}
              {!answered && (timer <= 0 || revealed) && (
                <div className="feedback fb-bad">
                  Time's up — correct answer:&nbsp;
                  <strong style={{color:"#ECE9E3"}}>{currentQ.a}</strong>
                </div>
              )}
            </>
          )}

          {/* ── DONE ─────────────────────────────────────────── */}
          {screen === "done" && (
            <>
              <div className="topbar">
                <div className="wordmark">CB350 <em>Results</em></div>
                <div className="chip chip-blue">{session?.topic_label}</div>
              </div>

              <div style={{textAlign:"center", padding:"1rem 0 1.5rem"}}>
                <div style={{fontSize:52, marginBottom:10}}>
                  {myRank === 1 ? "🏆" : myRank <= 3 ? "🥈" : "🎓"}
                </div>
                <div style={{fontSize:22, fontWeight:700, marginBottom:5}}>Session complete!</div>
                <div style={{fontSize:13, color:"rgba(236,233,227,0.4)"}}>{name}</div>
              </div>

              <div className="stats">
                <div className="stat">
                  <div className="stat-v">{score}</div>
                  <div className="stat-l">Your score</div>
                </div>
                <div className="stat">
                  <div className="stat-v">#{myRank || "–"}</div>
                  <div className="stat-l">Your rank</div>
                </div>
              </div>

              <div className="sec-label">Final Leaderboard</div>
              <div className="card" style={{marginBottom:"1.25rem"}}>
                {leaderboard.length === 0
                  ? <div style={{fontSize:13, color:"rgba(236,233,227,0.25)", textAlign:"center", padding:"1rem"}}>
                      No data yet.
                    </div>
                  : leaderboard.map((s, i) => (
                    <div key={i} className={`lb-row ${s.student_name === name ? "lb-row-me" : ""}`}>
                      <span className="lb-r">{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</span>
                      <span className="lb-n">{s.student_name}{s.student_name === name ? " (you)" : ""}</span>
                      <span className="lb-s">{s.score}</span>
                    </div>
                  ))
                }
              </div>

              <button className="btn btn-blue" onClick={resetAll}>Join Another Session</button>
            </>
          )}

        </div>
      </div>
    </>
  );
}
