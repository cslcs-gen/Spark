import { useState } from "react";

const questions = [
  { id:1, category:"Daily Life",   text:"What's the most annoying thing you deal with every single day?",              placeholder:"e.g. forgetting where I put things, commuting stress..." },
  { id:2, category:"Work",         text:"What task at work do you dread or wish someone else handled?",                 placeholder:"e.g. writing reports, scheduling meetings..." },
  { id:3, category:"Money",        text:"Where does your money go that surprises or frustrates you?",                   placeholder:"e.g. subscriptions I forget, eating out too much..." },
  { id:4, category:"Health",       text:"What healthy habit have you tried to build but keep failing at?",              placeholder:"e.g. sleeping earlier, drinking more water..." },
  { id:5, category:"Social",       text:"What makes coordinating with friends or family unnecessarily hard?",           placeholder:"e.g. planning group trips, deciding where to eat..." },
  { id:6, category:"Learning",     text:"What skill have you wanted to learn but never made progress on?",              placeholder:"e.g. a language, investing, cooking..." },
  { id:7, category:"Information",  text:"What info do you wish you had at your fingertips but always have to hunt for?",placeholder:"e.g. flight prices, local events, my own notes..." },
  { id:8, category:"Time",         text:"What eats up your time that feels like it should not take as long?",           placeholder:"e.g. replying to emails, grocery shopping..." },
];

const CAT_COLORS = {
  "Daily Life":"#f97316","Work":"#6366f1","Money":"#10b981","Health":"#ec4899",
  "Social":"#f59e0b","Learning":"#3b82f6","Information":"#8b5cf6","Time":"#14b8a6"
};

export default function App() {
  const [step,    setStep]    = useState("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [draft,   setDraft]   = useState("");
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const q = questions[current];
  const pct = (current / questions.length) * 100;

  function handleNext() {
    if (!draft.trim()) return;
    const upd = { ...answers, [q.id]: { question: q.text, category: q.category, answer: draft.trim() } };
    setAnswers(upd); setDraft("");
    if (current + 1 < questions.length) setCurrent(current + 1);
    else submitAnswers(upd);
  }

  function handleBack() {
    if (current === 0) { setStep("intro"); return; }
    setDraft(answers[questions[current - 1].id]?.answer || "");
    setCurrent(current - 1);
  }

  async function submitAnswers(all) {
    setStep("loading");
    const lines = Object.values(all).map(function(a) {
      return "[" + a.category + "] " + a.question + "\nAnswer: " + a.answer;
    }).join("\n\n");
    const prompt =
      "You are a sharp product strategist. A person answered 8 questions about daily frustrations. " +
      "Respond ONLY with a JSON object (no markdown) shaped exactly like this: " +
      '{"problems":[{"title":"short name","description":"1-2 sentences","category":"cat","severity":"high|medium|low"}],' +
      '"ideas":[{"name":"App Name","tagline":"one line","description":"2-3 sentences","type":"web app|mobile app|tool","difficulty":"weekend|1 month|3 months","solves":["problem title"]}],' +
      '"insight":"one sharp sentence"}' +
      " Give 3-5 problems and 5-7 ideas specific to THEIR answers.\n\n" + lines;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const raw  = (data.content || []).find(function(b){ return b.type === "text"; });
      const text = raw ? raw.text : "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed); setStep("results");
    } catch(e) { setError("Something went wrong. Please try again."); setStep("quiz"); }
  }

  const S = {
    root:  { minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 16px 48px", background:"linear-gradient(135deg,#0a0a0f 0%,#111127 50%,#0d0d1a 100%)", fontFamily:"Georgia,serif" },
    card:  { maxWidth:520, width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:28, display:"flex", flexDirection:"column", gap:16 },
    btn:   { width:"100%", padding:"14px", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:14, color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"Georgia,serif" },
    area:  { width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"12px 14px", color:"#fff", fontSize:14, outline:"none", resize:"none", fontFamily:"Georgia,serif", minHeight:80 },
  };

  if (step === "intro") return (
    <div style={S.root}>
      <div style={S.card}>
        <div style={{fontSize:48,textAlign:"center"}}>&#x26A1;</div>
        <h1 style={{fontSize:32,fontWeight:"bold",textAlign:"center",background:"linear-gradient(90deg,#818cf8,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Spark</h1>
        <p style={{color:"#94a3b8",fontSize:15,lineHeight:1.7,textAlign:"center"}}>Answer 8 honest questions. AI surfaces your real problems and generates project ideas built for <em>you</em>.</p>
        <button style={S.btn} onClick={function(){ setStep("quiz"); }}>Let's go &rarr;</button>
        <p style={{color:"#334155",fontSize:11,textAlign:"center"}}>~3 minutes. Be honest for better results.</p>
      </div>
    </div>
  );

  if (step === "quiz") return (
    <div style={{...S.root,justifyContent:"flex-start",paddingTop:40}}>
      <div style={{maxWidth:520,width:"100%",display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569",marginBottom:6}}>
            <span>Question {current+1} of {questions.length}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div style={{height:3,background:"rgba(255,255,255,0.08)",borderRadius:2}}>
            <div style={{height:"100%",borderRadius:2,width:pct+"%",background:"linear-gradient(90deg,#6366f1,#8b5cf6)",transition:"width 0.4s"}}/>
          </div>
        </div>
        <div style={{...S.card,gap:12}}>
          <span style={{display:"inline-block",padding:"2px 10px",borderRadius:100,fontSize:11,fontWeight:600,
            background:(CAT_COLORS[q.category]||"#888")+"22",color:CAT_COLORS[q.category]}}>{q.category}</span>
          <p style={{color:"#fff",fontSize:17,fontWeight:600,lineHeight:1.4}}>{q.text}</p>
          <textarea style={S.area} value={draft} onChange={function(e){setDraft(e.target.value);}} placeholder={q.placeholder} rows={3} autoFocus/>
          {error && <p style={{color:"#f87171",fontSize:12}}>{error}</p>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={handleBack} style={{padding:"12px 18px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:"#94a3b8",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:13}}>&larr; Back</button>
          <button onClick={handleNext} disabled={!draft.trim()} style={{...S.btn,flex:1,opacity:draft.trim()?1:0.4}}>
            {current+1===questions.length?"Analyse ✨":"Next →"}
          </button>
        </div>
      </div>
    </div>
  );

  if (step === "loading") return (
    <div style={S.root}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:16}}>✨</div>
        <p style={{color:"#fff",fontSize:18,fontWeight:600}}>Analysing your answers…</p>
        <p style={{color:"#64748b",fontSize:13,marginTop:6}}>Finding problems and generating ideas</p>
      </div>
    </div>
  );

  if (step === "results" && result) return (
    <div style={{...S.root,justifyContent:"flex-start",paddingTop:32}}>
      <div style={{maxWidth:520,width:"100%",display:"flex",flexDirection:"column",gap:20}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>🎯</div>
          <h1 style={{color:"#fff",fontSize:26,fontWeight:"bold",marginBottom:8}}>Your Results</h1>
          {result.insight && <p style={{color:"#94a3b8",fontSize:13,fontStyle:"italic",maxWidth:400,margin:"0 auto",lineHeight:1.6}}>&ldquo;{result.insight}&rdquo;</p>}
        </div>
        <div>
          <h2 style={{color:"#fff",fontSize:14,fontWeight:600,marginBottom:10}}>⚡ Problems Found</h2>
          {(result.problems||[]).map(function(p,i) { return (
            <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:16,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8}}>
                <span style={{color:"#fff",fontWeight:600,fontSize:13}}>{p.title}</span>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,
                  background:p.severity==="high"?"rgba(239,68,68,0.15)":p.severity==="medium"?"rgba(245,158,11,0.15)":"rgba(59,130,246,0.15)",
                  color:p.severity==="high"?"#f87171":p.severity==="medium"?"#fbbf24":"#60a5fa"}}>{p.severity}</span>
              </div>
              <p style={{color:"#64748b",fontSize:12,lineHeight:1.6}}>{p.description}</p>
            </div>
          ); })}
        </div>
        <div>
          <h2 style={{color:"#fff",fontSize:14,fontWeight:600,marginBottom:10}}>💡 Ideas for You</h2>
          {(result.ideas||[]).map(function(idea,i) { return (
            <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:18,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                <div>
                  <div style={{color:"#fff",fontWeight:"bold",fontSize:14}}>{idea.name}</div>
                  <div style={{color:"#818cf8",fontSize:12,marginTop:2}}>{idea.tagline}</div>
                </div>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"rgba(74,222,128,0.1)",color:"#4ade80",flexShrink:0}}>{idea.difficulty}</span>
              </div>
              <p style={{color:"#64748b",fontSize:12,lineHeight:1.65}}>{idea.description}</p>
              {(idea.solves||[]).length > 0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
                  {(idea.solves||[]).map(function(s,j){ return <span key={j} style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:"rgba(139,92,246,0.12)",color:"#a78bfa"}}>Solves: {s}</span>; })}
                </div>
              )}
            </div>
          ); })}
        </div>
        <button onClick={function(){setStep("intro");setCurrent(0);setAnswers({});setDraft("");setResult(null);}}
          style={{...S.btn,background:"rgba(255,255,255,0.06)",marginBottom:20}}>Start over</button>
      </div>
    </div>
  );
  return null;
}