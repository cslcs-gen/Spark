import { useState, useEffect, useRef } from "react";

const questions = [
  {id:1,category:"Daily Life",emoji:"🌅",text:"What's the most annoying thing you deal with every single day?",placeholder:"e.g. forgetting where I put things, commuting stress..."},
  {id:2,category:"Work",emoji:"💼",text:"What task at work do you dread or wish someone else handled?",placeholder:"e.g. writing reports, scheduling meetings..."},
  {id:3,category:"Money",emoji:"💸",text:"Where does your money go that surprises or frustrates you?",placeholder:"e.g. subscriptions I forget, eating out too much..."},
  {id:4,category:"Health",emoji:"🏃",text:"What healthy habit have you tried to build but keep failing at?",placeholder:"e.g. sleeping earlier, drinking more water..."},
  {id:5,category:"Social",emoji:"👥",text:"What makes coordinating with friends or family unnecessarily hard?",placeholder:"e.g. planning group trips, deciding where to eat..."},
  {id:6,category:"Learning",emoji:"📚",text:"What skill have you wanted to learn but never made progress on?",placeholder:"e.g. a language, investing, cooking..."},
  {id:7,category:"Information",emoji:"🔍",text:"What info do you wish you had at your fingertips but always have to hunt for?",placeholder:"e.g. flight prices, local events, my own notes..."},
  {id:8,category:"Time",emoji:"⏱️",text:"What eats up your time that feels like it shouldn't take as long?",placeholder:"e.g. replying to emails, grocery shopping..."},
];
const CC={"Daily Life":"#f97316","Work":"#818cf8","Money":"#34d399","Health":"#f472b6","Social":"#fbbf24","Learning":"#60a5fa","Information":"#a78bfa","Time":"#2dd4bf"};
const SV={high:{bg:"rgba(239,68,68,0.15)",color:"#f87171"},medium:{bg:"rgba(245,158,11,0.15)",color:"#fbbf24"},low:{bg:"rgba(59,130,246,0.15)",color:"#60a5fa"}};
// Vite replaces this string at build time — no import.meta in the browser bundle
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
function xj(t){
  try{return JSON.parse(t.trim());}catch(_){}
  var s=t.replace(/^```(?:json)?\s*/i,"").replace(/\s*```\s*$/i,"").trim();
  try{return JSON.parse(s);}catch(_){}
  var a=t.indexOf("{"),b=t.lastIndexOf("}");
  if(a!==-1&&b>a){try{return JSON.parse(t.slice(a,b+1));}catch(_){}}
  throw new Error("Could not parse response.");
}
export default function Spark(){
  var [step,setStep]=useState("intro"),[cur,setCur]=useState(0);
  var [ans,setAns]=useState({}),[draft,setDraft]=useState("");
  var [res,setRes]=useState(null),[err,setErr]=useState(null);
  var ta=useRef(null);
  var q=questions[cur],pct=(cur/questions.length)*100;
  useEffect(function(){if(step==="quiz"&&ta.current)setTimeout(function(){if(ta.current)ta.current.focus();},300);},[step,cur]);
  function next(){
    if(!draft.trim())return;
    var u=Object.assign({},ans);u[q.id]={question:q.text,category:q.category,answer:draft.trim()};
    setAns(u);setDraft("");
    if(cur+1<questions.length)setCur(function(c){return c+1;});else go(u);
  }
  function back(){
    if(cur===0){setStep("intro");return;}
    var p=ans[questions[cur-1].id];setDraft(p?p.answer:"");setCur(function(c){return c-1;});
  }
  async function go(all){
    if(!API_KEY){setErr("API key not configured. Set VITE_ANTHROPIC_API_KEY in Vercel.");setStep("quiz");setCur(questions.length-1);return;}
    setStep("loading");setErr(null);
    var lines=Object.values(all).map(function(a){return "["+a.category+"] "+a.question+"\nAnswer: "+a.answer;}).join("\n\n");
    var prompt="You are a product strategist. Someone answered 8 questions about daily frustrations. "+
      "Reply ONLY with valid JSON — no markdown, no backticks. "+
      '{"problems":[{"title":"name","description":"1-2 sentences","category":"cat","severity":"high|medium|low"}],'+
      '"ideas":[{"name":"Name","tagline":"one line","description":"2-3 sentences","type":"web app|mobile app|tool","difficulty":"weekend|1 month|3 months","solves":["problem"]}],'+
      '"insight":"one sentence"} Give 3-5 problems, 5-7 ideas. Start with { end with }\n\n"+lines;
    try{
      var r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:prompt}]})
      });
      if(!r.ok){var eb=await r.json().catch(function(){return{};});throw new Error("API "+r.status+": "+(eb&&eb.error?eb.error.message:r.statusText));}
      var d=await r.json();
      if(d.type==="error")throw new Error("API: "+(d.error?d.error.message:"unknown"));
      var raw=(d.content||[]).find(function(b){return b.type==="text";});
      if(!raw||!raw.text)throw new Error("Empty response. Try again.");
      var p=xj(raw.text);
      if(!p.problems||!p.ideas)throw new Error("Unexpected response. Try again.");
      setRes(p);setStep("results");
    }catch(e){console.error(e);setErr(e.message||"Something went wrong.");setStep("quiz");setCur(questions.length-1);}
  }
  var R={minHeight:"100dvh",background:"linear-gradient(160deg,#0a0a0f 0%,#0f0f1e 60%,#0a0a0f 100%)",fontFamily:"'DM Sans',system-ui,sans-serif",color:"#e8e6f0",overflowX:"hidden"};
  var G=`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
    @keyframes pG{0%,100%{opacity:.6}50%{opacity:1}}@keyframes fU{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes sI{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
    @keyframes sp{to{transform:rotate(360deg)}}@keyframes pl{0%,100%{opacity:.4}50%{opacity:1}}
    @keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    textarea{font-size:16px!important;-webkit-appearance:none;}textarea:focus{outline:none;}
    .qc{animation:sI .3s ease both;}.ri{animation:fi .4s ease both;}`;
  if(step==="intro")return(
    <div style={{...R,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 20px 48px"}}>
      <style>{G}</style>
      <div style={{position:"fixed",top:"10%",left:"50%",transform:"translateX(-50%)",width:300,height:300,background:"radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)",borderRadius:"50%",pointerEvents:"none",animation:"pG 4s ease infinite"}}/>
      <div style={{maxWidth:400,width:"100%",animation:"fU .6s ease both"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:80,height:80,borderRadius:24,background:"linear-gradient(135deg,#1a1008,#0f0a1a)",border:"1px solid rgba(250,204,21,0.2)",boxShadow:"0 0 40px rgba(249,115,22,0.2)",marginBottom:20}}>
            <svg width="42" height="42" viewBox="0 0 96 96" fill="none"><defs><linearGradient id="isp" x1="48" y1="12" x2="48" y2="84" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FACC15"/><stop offset="55%" stopColor="#F97316"/><stop offset="100%" stopColor="#EF4444"/></linearGradient><filter id="igf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path filter="url(#igf)" d="M54 14L30 50h18l-8 32 28-38H50L54 14Z" fill="url(#isp)"/></svg>
          </div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:800,letterSpacing:"-0.03em",background:"linear-gradient(135deg,#FACC15,#F97316,#EF4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1}}>Spark</div>
        </div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:700,textAlign:"center",lineHeight:1.25,marginBottom:12,letterSpacing:"-0.02em"}}>Find your next<br/><span style={{background:"linear-gradient(90deg,#818cf8,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>big idea</span></h1>
        <p style={{textAlign:"center",color:"#64748b",fontSize:15,lineHeight:1.7,marginBottom:36}}>Answer 8 honest questions.<br/>AI finds your real problems and builds ideas for <em style={{color:"#94a3b8"}}>you</em>.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:36}}>
          {["8 questions","AI-powered","~3 minutes","Free"].map(function(t){return <span key={t} style={{fontSize:12,padding:"5px 12px",borderRadius:100,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"#64748b"}}>{t}</span>;})}
        </div>
        <button onClick={function(){setStep("quiz");}} style={{width:"100%",padding:"17px",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:16,color:"#fff",fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 32px rgba(99,102,241,0.4)"}}>Let's go ⚡</button>
        <p style={{textAlign:"center",color:"#334155",fontSize:11,marginTop:14}}>Be honest — better answers = better ideas.</p>
      </div>
    </div>
  );
  if(step==="quiz")return(
    <div style={{...R,display:"flex",flexDirection:"column",minHeight:"100dvh"}}>
      <style>{G}</style>
      <div style={{padding:"16px 20px 0",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <button onClick={back} style={{background:"none",border:"none",color:"#475569",fontSize:22,cursor:"pointer",padding:"4px 0",lineHeight:1}}>‹</button>
          <span style={{fontSize:12,color:"#475569",fontWeight:500}}>{cur+1} / {questions.length}</span>
          <span style={{fontSize:12,color:"#6366f1",fontWeight:600}}>{Math.round(pct)}%</span>
        </div>
        <div style={{height:3,background:"rgba(255,255,255,0.07)",borderRadius:2}}><div style={{height:"100%",borderRadius:2,width:pct+"%",background:"linear-gradient(90deg,#6366f1,#8b5cf6)",transition:"width 0.4s ease"}}/></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 0"}}>
        <div className="qc">
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:100,background:(CC[q.category]||"#888")+"20",border:"1px solid "+(CC[q.category]||"#888")+"40",marginBottom:16}}>
            <span style={{fontSize:14}}>{q.emoji}</span><span style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",color:CC[q.category]}}>{q.category}</span>
          </div>
          <p style={{fontSize:20,fontWeight:600,lineHeight:1.4,color:"#f1f5f9",marginBottom:20,letterSpacing:"-0.01em"}}>{q.text}</p>
          <div style={{position:"relative"}}>
            <textarea ref={ta} value={draft} onChange={function(e){setDraft(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))next();}} placeholder={q.placeholder} rows={4}
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1.5px solid "+(draft.trim()?"rgba(99,102,241,0.5)":"rgba(255,255,255,0.1)"),borderRadius:14,padding:"14px 16px",color:"#f1f5f9",resize:"none",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6,boxShadow:draft.trim()?"0 0 0 3px rgba(99,102,241,0.1)":"none",transition:"border-color .2s,box-shadow .2s"}}/>
            {draft.trim()&&<div style={{position:"absolute",bottom:10,right:12,fontSize:10,color:"#475569"}}>⌘↵ to continue</div>}
          </div>
          {err&&<div style={{marginTop:14,padding:"12px 14px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10}}><div style={{color:"#f87171",fontSize:12,fontWeight:600}}>❌ {err}</div></div>}
          <div style={{display:"flex",gap:5,justifyContent:"center",marginTop:24}}>
            {questions.map(function(_,i){return <div key={i} style={{width:i===cur?18:6,height:6,borderRadius:3,background:i<cur?"#6366f1":i===cur?"#8b5cf6":"rgba(255,255,255,0.1)",transition:"all .3s"}}/>;  })}
          </div>
        </div>
      </div>
      <div style={{padding:"16px 20px 32px",flexShrink:0,background:"linear-gradient(to top,#0a0a0f 60%,transparent)"}}>
        <button onClick={next} disabled={!draft.trim()} style={{width:"100%",padding:"17px",border:"none",borderRadius:16,background:draft.trim()?"linear-gradient(135deg,#6366f1,#8b5cf6)":"rgba(255,255,255,0.06)",color:draft.trim()?"#fff":"#334155",fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,cursor:draft.trim()?"pointer":"not-allowed",boxShadow:draft.trim()?"0 8px 24px rgba(99,102,241,0.35)":"none",transition:"all .2s"}}>
          {cur+1===questions.length?"Analyse my answers ✨":"Next →"}
        </button>
      </div>
    </div>
  );
  if(step==="loading")return(
    <div style={{...R,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,gap:16}}>
      <style>{G}</style>
      <div style={{width:52,height:52,border:"3px solid rgba(99,102,241,0.2)",borderTopColor:"#818cf8",borderRadius:"50%",animation:"sp .9s linear infinite"}}/>
      <div style={{textAlign:"center"}}><p style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700,marginBottom:6}}>Analysing…</p><p style={{color:"#475569",fontSize:13}}>Finding problems and generating ideas</p></div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>
        {["Identifying patterns…","Mapping to real problems…","Generating ideas…"].map(function(t,i){return <div key={i} style={{fontSize:12,color:"#334155",animation:"pl 2s ease infinite",animationDelay:i*.6+"s",textAlign:"center"}}>{t}</div>;})}
      </div>
    </div>
  );
  if(step==="results"&&res)return(
    <div style={{...R,minHeight:"100dvh"}}>
      <style>{G}</style>
      <div style={{padding:"28px 20px 20px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontSize:36,marginBottom:8}}>🎯</div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,letterSpacing:"-0.02em",marginBottom:8}}>Your Results</h1>
        {res.insight&&<p style={{color:"#64748b",fontSize:13,lineHeight:1.7,fontStyle:"italic",maxWidth:340,margin:"0 auto"}}>"{res.insight}"</p>}
      </div>
      <div style={{padding:"20px 16px 48px"}}>
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><span>⚡</span><span style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:"#94a3b8"}}>Problems We Found</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {(res.problems||[]).map(function(p,i){return(
              <div className="ri" key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 16px",animationDelay:i*.07+"s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontWeight:600,fontSize:14,color:"#f1f5f9",flex:1}}>{p.title}</span>
                  <span style={{fontSize:10,padding:"3px 9px",borderRadius:100,background:(SV[p.severity]||SV.low).bg,color:(SV[p.severity]||SV.low).color,flexShrink:0,fontWeight:600}}>{p.severity}</span>
                </div>
                <p style={{color:"#64748b",fontSize:13,lineHeight:1.6}}>{p.description}</p>
              </div>
            );})}
          </div>
        </div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><span>💡</span><span style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:"#94a3b8"}}>Ideas Built for You</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {(res.ideas||[]).map(function(idea,i){return(
              <div className="ri" key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"16px",animationDelay:(i*.08+.2)+"s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:0}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#f1f5f9",marginBottom:3}}>{idea.name}</div><div style={{fontSize:12,color:"#818cf8"}}>{idea.tagline}</div></div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",flexShrink:0}}>
                    <span style={{fontSize:10,padding:"3px 8px",borderRadius:100,background:"rgba(74,222,128,0.1)",color:"#4ade80",fontWeight:600}}>{idea.difficulty}</span>
                    <span style={{fontSize:10,padding:"3px 8px",borderRadius:100,background:"rgba(255,255,255,0.05)",color:"#475569"}}>{idea.type}</span>
                  </div>
                </div>
                <p style={{color:"#64748b",fontSize:13,lineHeight:1.65,marginBottom:(idea.solves||[]).length?10:0}}>{idea.description}</p>
                {(idea.solves||[]).length>0&&(<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{(idea.solves||[]).map(function(s,j){return <span key={j} style={{fontSize:10,padding:"3px 9px",borderRadius:100,background:"rgba(139,92,246,0.12)",color:"#a78bfa",border:"1px solid rgba(139,92,246,0.2)"}}>Solves: {s}</span>;})}</div>)}
              </div>
            );})}
          </div>
        </div>
        <button onClick={function(){setStep("intro");setCur(0);setAns({});setDraft("");setRes(null);setErr(null);}} style={{width:"100%",marginTop:28,padding:"15px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,color:"#64748b",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,cursor:"pointer"}}>Start over</button>
      </div>
    </div>
  );
  return null;
}