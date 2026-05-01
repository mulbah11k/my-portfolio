import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────
   PERSISTENT STORAGE HELPERS
───────────────────────────────────────── */
const db = {
  async get(key) {
    try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  },
  async set(key, val) {
    try { await window.storage.set(key, JSON.stringify(val)); return true; }
    catch { return false; }
  }
};

/* ─────────────────────────────────────────
   SECURITY HELPERS
───────────────────────────────────────── */
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/* ─────────────────────────────────────────
   DEFAULT DATA
───────────────────────────────────────── */
const INIT_PROFILE = {
  name: "Mulbah Kolleh",
  title: "Full-Stack Developer & AI Automation Specialist",
  bio: "2 years of professional experience at Kwagei building AI systems, automation tools, and custom web applications that reduce manual work and improve business operations. I build intelligent software using Python (FastAI), Django, Node.js, Vue, and modern AI models — and I adapt fast.",
  location: "Monrovia, Liberia",
  email: "mulbahkolleh@gmail.com",
  github: "github.com/mulbahkolleh",
  linkedin: "linkedin.com/in/mulbahkolleh",
  photo: null,
  available: true,
  company: "Kwagei",
  yearsExp: "2+",
};

const INIT_PROJECTS = [
  { id: 1, name: "LibNewsCentral", cat: "fullstack", icon: "📰", color: "#00d4ff",
    desc: "Automated Liberian news aggregation platform with AI summarization and duplicate detection.",
    detail: "A fully automated data pipeline that scrapes multiple Liberian news websites using Puppeteer, deduplicates articles via content hashing, summarizes them with HuggingFace AI, and serves everything through a clean Node.js/EJS backend with a scheduled pipeline.",
    stack: ["Node.js","Puppeteer","HuggingFace","SQLite","EJS","REST API"],
    github: "https://github.com/mulbahkolleh", live: "#", featured: true },
  { id: 2, name: "Church Management System", cat: "backend", icon: "⛪", color: "#e879f9",
    desc: "Multi-branch church management system with RBAC, departments, finance and event tracking.",
    detail: "Built on Frappe Framework with Python and MariaDB. Supports multiple branch locations, department structures (men, women, youth, children), role-based access control, member management, financial tracking, and event scheduling.",
    stack: ["Frappe","Python","MariaDB","JavaScript","RBAC"],
    github: "https://github.com/mulbahkolleh", live: null, featured: true },
  { id: 3, name: "Linux Automation Scripts", cat: "automation", icon: "🐧", color: "#22c55e",
    desc: "Production-ready Bash & Python scripts for Linux system administration.",
    detail: "A collection of practical automation tools: CSV organization pipelines, file management utilities, cron job schedulers, and system administration helpers that save hours of manual work.",
    stack: ["Bash","Python","Linux","Cron","CSV Processing"],
    github: "https://github.com/mulbahkolleh", live: null, featured: false },
  { id: 4, name: "IRC Bot", cat: "automation", icon: "🤖", color: "#f59e0b",
    desc: "IRC protocol bot demonstrating deep understanding of network programming.",
    detail: "A fully functional IRC bot with custom commands, event listeners, and automated responses, showcasing low-level network protocol implementation in JavaScript.",
    stack: ["JavaScript","IRC Protocol","Node.js","Networking"],
    github: "https://github.com/mulbahkolleh", live: null, featured: false },
  { id: 5, name: "Custom printf", cat: "systems", icon: "⚙️", color: "#8b5cf6",
    desc: "Custom implementation of C's printf function built from the ground up.",
    detail: "A complete reimplementation of printf in C, handling all format specifiers (%s, %d, %f, %x, etc.), variadic arguments, and edge cases — demonstrating deep understanding of systems programming.",
    stack: ["C","Systems Programming","Memory","Variadic Args"],
    github: "https://github.com/mulbahkolleh", live: null, featured: false },
];

const INIT_SKILLS = [
  { name:"Python", pct:92, cat:"Backend", icon:"🐍" },
  { name:"Django", pct:88, cat:"Backend", icon:"🎸" },
  { name:"Node.js", pct:90, cat:"Backend", icon:"🟩" },
  { name:"Frappe", pct:85, cat:"Backend", icon:"⚡" },
  { name:"REST APIs", pct:92, cat:"Backend", icon:"🔌" },
  { name:"FastAI", pct:82, cat:"AI & ML", icon:"🧠" },
  { name:"AI Models", pct:85, cat:"AI & ML", icon:"🤖" },
  { name:"LLM APIs", pct:88, cat:"AI & ML", icon:"💡" },
  { name:"Automation", pct:93, cat:"AI & ML", icon:"🔁" },
  { name:"Vue.js", pct:84, cat:"Frontend", icon:"💚" },
  { name:"JavaScript", pct:88, cat:"Frontend", icon:"📜" },
  { name:"HTML/CSS", pct:87, cat:"Frontend", icon:"🎨" },
  { name:"Tailwind", pct:83, cat:"Frontend", icon:"💨" },
  { name:"Puppeteer", pct:90, cat:"Automation", icon:"🕷️" },
  { name:"SQLite", pct:88, cat:"Database", icon:"🗃️" },
  { name:"MariaDB", pct:83, cat:"Database", icon:"🐬" },
  { name:"Linux", pct:87, cat:"Systems", icon:"🐧" },
  { name:"Git", pct:90, cat:"Tools", icon:"🔀" },
];

const CAT_CLR = {
  Backend:"#00d4ff", Frontend:"#e879f9",
  "AI & ML":"#f59e0b", Automation:"#22c55e",
  Database:"#06b6d4", Systems:"#ef4444", Tools:"#8b5cf6"
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function Portfolio() {
  const [profile, setProfile]   = useState(INIT_PROFILE);
  const [projects, setProjects] = useState(INIT_PROJECTS);
  const [loaded, setLoaded]     = useState(false);

  const [activeNav, setActiveNav]   = useState("hero");
  const [scrollPct, setScrollPct]   = useState(0);
  const [filter, setFilter]         = useState("all");
  const [modal, setModal]           = useState(null);

  // Chat
  const [chatOpen, setChatOpen]   = useState(false);
  const [chatMsgs, setChatMsgs]   = useState([
    { role:"assistant", text:"Hi! I'm Mulbah's AI assistant. Ask me anything — skills, projects, availability, rates." }
  ]);
  const [chatIn, setChatIn]       = useState("");
  const [chatBusy, setChatBusy]   = useState(false);
  const chatEndRef = useRef(null);

  // Admin
  const [adminOpen, setAdminOpen] = useState(false);
  const [authed, setAuthed]       = useState(false);
  const [pwd, setPwd]             = useState("");
  const [tab, setTab]             = useState("profile");
  const [draftProfile, setDP]     = useState(null);
  const [newProj, setNP]          = useState({ name:"",cat:"fullstack",icon:"🚀",color:"#00d4ff",desc:"",detail:"",stack:"",github:"",live:"",featured:false });
  const [saveMsg, setSaveMsg]     = useState("");

  // Contact form
  const [form, setForm]         = useState({ name:"",email:"",subject:"",msg:"" });
  const [formSt, setFormSt]     = useState("");

  const canvasRef = useRef(null);

  /* LOAD SAVED DATA */
  useEffect(() => {
    (async () => {
      const sp = await db.get("mk_profile_v2");
      const sr = await db.get("mk_projects_v2");
      if (sp) setProfile(sp);
      if (sr) setProjects(sr);
      setLoaded(true);
    })();
  }, []);

  /* CANVAS PARTICLE BG */
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = cv.width = window.innerWidth;
    let H = cv.height = window.innerHeight;
    let mx = W/2, my = H/2, raf;

    const pts = Array.from({length: 130}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
      r: Math.random()*1.4+.3,
      hue: Math.random()>.8 ? 290 : 195,
      a: Math.random()*.55+.1,
    }));

    const onMM = e => { mx=e.clientX; my=e.clientY; };
    window.addEventListener("mousemove", onMM);

    const draw = () => {
      ctx.clearRect(0,0,W,H);
      // grid
      ctx.strokeStyle="rgba(0,212,255,0.035)"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=90){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=90){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      // points + lines
      for(let i=0;i<pts.length;i++){
        const p=pts[i];
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        const dx=mx-p.x, dy=my-p.y, d=Math.hypot(dx,dy);
        if(d<180){ p.vx+=dx/d*.0018; p.vy+=dy/d*.0018; }
        p.vx*=.999; p.vy*=.999;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},100%,65%,${p.a})`;
        ctx.fill();
        for(let j=i+1;j<pts.length;j++){
          const q=pts[j], dd=Math.hypot(p.x-q.x, p.y-q.y);
          if(dd<110){
            ctx.beginPath();
            ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
            ctx.strokeStyle=`rgba(0,212,255,${(1-dd/110)*.1})`;
            ctx.lineWidth=.5; ctx.stroke();
          }
        }
      }
      raf=requestAnimationFrame(draw);
    };
    draw();
    const onR=()=>{W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;};
    window.addEventListener("resize",onR);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("mousemove",onMM); window.removeEventListener("resize",onR); };
  }, []);

  /* SCROLL */
  useEffect(() => {
    const fn=()=>{
      const tot=document.documentElement.scrollHeight-window.innerHeight;
      setScrollPct((window.scrollY/tot)*100);
      for(const id of ["contact","skills","projects","experience","about","hero"]){
        const el=document.getElementById(id);
        if(el && window.scrollY>=el.offsetTop-200){ setActiveNav(id); break; }
      }
    };
    window.addEventListener("scroll",fn);
    return ()=>window.removeEventListener("scroll",fn);
  },[]);

  /* CHAT SCROLL */
  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[chatMsgs,chatBusy]);

  /* SEND CHAT */
  const sendChat = async () => {
    const txt = chatIn.trim();
    if (!txt || chatBusy) return;
    setChatIn("");
    setChatBusy(true);
    setChatMsgs(p => [...p, { role: "user", text: txt }]);

    const history = chatMsgs.filter(m => m.role !== "system").slice(-10).map(m => ({ role: m.role, content: m.text })); // Limit to last 10 messages
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY; // Use env var for security
    if (!apiKey) {
      setChatMsgs(p => [...p, { role: "assistant", text: "API key not configured. Please check setup." }]);
      setChatBusy(false);
      return;
    }

    let retries = 2;
    while (retries >= 0) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022", // Updated to latest stable model
            max_tokens: 600,
            system: `You are an AI assistant for Mulbah Kolleh, a full-stack developer and AI automation specialist from Monrovia, Liberia with 2 years of professional experience at Kwagei. He builds AI systems, automation tools, and custom web applications that help businesses reduce manual work. Stack: Python (FastAI), Django, Node.js, Vue.js, modern AI/LLM APIs, Puppeteer, SQLite, MariaDB, Linux. Projects: LibNewsCentral (news aggregation+AI), Church Management System (Frappe). He's a fast learner who adapts quickly. Available for remote jobs and freelance. Answer professionally and concisely, always highlight his real-world experience at Kwagei. Keep answers under 4 sentences.`,
            messages: [...history, { role: "user", content: txt }]
          })
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const d = await res.json();
        const reply = d.content?.[0]?.text || "I couldn't fetch that. Try again.";
        setChatMsgs(p => [...p, { role: "assistant", text: reply }]);
        break; // Success, exit retry loop
      } catch (err) {
        if (retries === 0) {
          setChatMsgs(p => [...p, { role: "assistant", text: `Error: ${err.message}. Please try later.` }]);
        }
        retries--;
        await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
      }
    }
    setChatBusy(false);
  };

  /* ADMIN */
  const login=()=>{
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!envPassword) {
      alert("Admin password not configured. Please set VITE_ADMIN_PASSWORD in .env file.");
      return;
    }
    if(pwd === envPassword){ setAuthed(true); setDP({...profile}); }
    else alert("Wrong password.");
  };
  const saveProfile=async()=>{
    setProfile(draftProfile);
    await db.set("mk_profile_v2",draftProfile);
    flash("✓ Profile saved!");
  };
  const addProject=async()=>{
    if(!newProj.name || newProj.name.trim().length === 0){ alert("Project name required"); return; }
    if(!newProj.desc || newProj.desc.trim().length === 0){ alert("Project description required"); return; }
    if(!newProj.github || newProj.github.trim().length === 0){ alert("GitHub URL required"); return; }
    // Basic URL validation
    if (!isValidUrl(newProj.github)) { alert("Invalid GitHub URL"); return; }
    if (newProj.live && newProj.live.trim().length > 0 && !isValidUrl(newProj.live)) { alert("Invalid live URL"); return; }
    const p={...newProj, id:Date.now(), stack:newProj.stack.split(",").map(s=>s.trim()).filter(Boolean)};
    const updated=[...projects,p];
    setProjects(updated);
    await db.set("mk_projects_v2",updated);
    setNP({name:"",cat:"fullstack",icon:"🚀",color:"#00d4ff",desc:"",detail:"",stack:"",github:"",live:"",featured:false});
    flash("✓ Project added!");
  };
  const deleteProject=async(id)=>{
    const updated=projects.filter(p=>p.id!==id);
    setProjects(updated);
    await db.set("mk_projects_v2",updated);
    flash("✓ Deleted.");
  };
  const flash=(msg)=>{ setSaveMsg(msg); setTimeout(()=>setSaveMsg(""),3000); };
  const uploadPhoto=(e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    // Validate file type and size
    if (!f.type.startsWith('image/')) { alert("Please upload an image file."); return; }
    if (f.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB."); return; }
    const fr=new FileReader();
    fr.onload=ev=>{
      const result = ev.target.result;
      if (result && typeof result === 'string' && result.startsWith('data:image/')) {
        setDP(p=>({...p,photo:result}));
      }
    };
    fr.onerror=()=>alert("Failed to read file. Try again.");
    fr.readAsDataURL(f);
  };

  /* CONTACT */
  const submitForm=()=>{
    if(!form.name||!form.email||!form.msg){ setFormSt("error"); return; }
    setFormSt("success"); setForm({name:"",email:"",subject:"",msg:""});
    setTimeout(()=>setFormSt(""),5000);
  };

  const filtered=filter==="all"?projects:projects.filter(p=>p.cat===filter);

  if(!loaded) return (
    <div style={{background:"#050810",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@700&family=Fira+Code&display=swap');`}</style>
      <div style={{width:40,height:40,border:"3px solid rgba(0,212,255,0.2)",borderTop:"3px solid #00d4ff",borderRadius:"50%",animation:"spin 0.9s linear infinite"}}/>
      <div style={{fontFamily:"'Fira Code',monospace",color:"#00d4ff",fontSize:"0.85rem",letterSpacing:3}}>LOADING PORTFOLIO</div>
    </div>
  );

  return (
    <div style={{background:"#050810",color:"#e2e8f0",fontFamily:"'DM Sans',system-ui,sans-serif",overflowX:"hidden",minHeight:"100vh"}}>
      <Styles />

      {/* SCROLL PROGRESS */}
      <div style={{position:"fixed",top:0,left:0,height:3,width:`${scrollPct}%`,background:"linear-gradient(90deg,#00d4ff,#e879f9)",zIndex:1001,transition:"width 0.08s"}}/>

      {/* CANVAS */}
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none"}}/>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:68,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6%",background:"rgba(5,8,16,0.88)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(0,212,255,0.09)"}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"1.4rem",fontWeight:800,color:"#fff",letterSpacing:1,display:"flex",alignItems:"center",gap:10}}>
          MK<span style={{color:"#00d4ff"}}>.</span>
          {profile.available&&<span style={{fontSize:"0.6rem",padding:"3px 10px",background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.35)",color:"#22c55e",borderRadius:99,fontFamily:"'Fira Code',monospace",letterSpacing:1.5}}>● AVAILABLE</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:28}}>
          {["about","experience","projects","skills","contact"].map(s=>(
            <a key={s} href={`#${s}`} style={{fontFamily:"'Fira Code',monospace",fontSize:"0.73rem",color:activeNav===s?"#00d4ff":"rgba(226,232,240,0.38)",textDecoration:"none",textTransform:"uppercase",letterSpacing:2,transition:"color 0.3s",borderBottom:activeNav===s?"1px solid #00d4ff":"1px solid transparent",paddingBottom:2}}>
              {s}
            </a>
          ))}
          <button onClick={()=>setAdminOpen(true)} className="admin-btn">⚙ Admin</button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────── */}
      <section id="hero" style={{minHeight:"100vh",display:"flex",alignItems:"center",padding:"0 6%",position:"relative",zIndex:1,paddingTop:68}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:80,alignItems:"center",width:"100%",maxWidth:1240,margin:"0 auto"}}>
          <div>
            <div className="fade-up" style={{animationDelay:"0.2s",fontFamily:"'Fira Code',monospace",fontSize:"0.78rem",color:"#00d4ff",letterSpacing:3,marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:36,height:1,background:"#00d4ff",display:"inline-block"}}/>
              Hello, World — I'm
            </div>
            <h1 className="fade-up" style={{animationDelay:"0.35s",fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(3.2rem,7.5vw,7rem)",fontWeight:800,lineHeight:.93,color:"#fff",letterSpacing:-2}}>
              {profile.name.split(" ")[0]}<br/>
              <span className="grad-text">{profile.name.split(" ").slice(1).join(" ")}.</span>
            </h1>
      <div className="fade-up" style={{animationDelay:"0.5s",fontFamily:"'Fira Code',monospace",fontSize:"clamp(0.85rem,2vw,1.1rem)",color:"rgba(226,232,240,0.45)",marginTop:14}}>
        &gt;&nbsp;<Typer phrases={["Full-Stack Developer","AI Automation Specialist","Python & Django Engineer","Vue.js Frontend Dev","FastAI / ML Builder","@ Kwagei — 2 Yrs","Open to Remote Work","Freelance Ready"]}/>
      </div>
            <p className="fade-up" style={{animationDelay:"0.65s",maxWidth:540,marginTop:22,fontSize:"1rem",lineHeight:1.9,color:"rgba(226,232,240,0.6)"}}>
              {profile.bio}
            </p>
            <div className="fade-up" style={{animationDelay:"0.8s",display:"flex",gap:12,marginTop:34,flexWrap:"wrap"}}>
              <a href="#projects" className="btn-primary">View Work →</a>
              <a href="#contact" className="btn-outline">Hire Me</a>
              <a href={`https://${profile.github}`} target="_blank" className="btn-ghost">GitHub</a>
            </div>
            <div className="fade-up" style={{animationDelay:"1s",display:"flex",gap:36,marginTop:48}}>
              {[["2+","Yrs Experience"],["5+","Projects Shipped"],["1","Company: Kwagei"]].map(([n,l])=>(
                <div key={l} style={{borderLeft:"2px solid rgba(0,212,255,0.22)",paddingLeft:14}}>
                  <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"2rem",fontWeight:800,color:"#00d4ff",lineHeight:1}}>{n}</div>
                  <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.6rem",color:"rgba(226,232,240,0.3)",letterSpacing:2,textTransform:"uppercase",marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PHOTO */}
          <div className="fade-up float-anim" style={{animationDelay:"0.6s",position:"relative",flexShrink:0}}>
            <div style={{width:280,height:280,position:"relative"}}>
              <div className="ring-spin" style={{position:"absolute",inset:-10,borderRadius:"50%",border:"2px dashed rgba(0,212,255,0.25)"}}/>
              <div className="ring-spin-rev" style={{position:"absolute",inset:-5,borderRadius:"50%",border:"1.5px dashed rgba(232,121,249,0.2)"}}/>
              <div style={{position:"absolute",inset:-2,borderRadius:"50%",background:"conic-gradient(from 0deg, #00d4ff, #e879f9, #00d4ff)",opacity:.75,animation:"spin 7s linear infinite"}}/>
              <div style={{position:"absolute",inset:3,borderRadius:"50%",background:"#050810"}}/>
              <div style={{position:"absolute",inset:7,borderRadius:"50%",overflow:"hidden",background:profile.photo?"none":"linear-gradient(135deg,#0a1e35,#1a0d35)"}}>
                {profile.photo
                  ? <img src={profile.photo} alt={profile.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                      <span style={{fontFamily:"'Oxanium',sans-serif",fontSize:"3.8rem",fontWeight:800,background:"linear-gradient(135deg,#00d4ff,#e879f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MK</span>
                      <span style={{fontFamily:"'Fira Code',monospace",fontSize:"0.58rem",color:"rgba(0,212,255,0.45)",letterSpacing:2}}>ADD PHOTO IN ADMIN</span>
                    </div>
                }
              </div>
              <div className="badge-pulse" style={{position:"absolute",top:-8,right:-24,background:"#00d4ff",color:"#050810",padding:"5px 13px",fontFamily:"'Fira Code',monospace",fontSize:"0.58rem",fontWeight:700,letterSpacing:1.5}}>OPEN TO WORK</div>
              <div style={{position:"absolute",bottom:12,left:-40,background:"rgba(5,8,16,0.92)",border:"1px solid rgba(0,212,255,0.25)",padding:"9px 13px",fontFamily:"'Fira Code',monospace",fontSize:"0.6rem",color:"#00d4ff",whiteSpace:"nowrap"}}>
                📍 {profile.location}
              </div>
            </div>
          </div>
        </div>
        <div style={{position:"absolute",bottom:36,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:6,opacity:.35}}>
          <div style={{width:1,height:56,background:"linear-gradient(180deg,#00d4ff,transparent)",animation:"fadeIn 2s 1.8s both"}}/>
          <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.55rem",color:"#00d4ff",letterSpacing:4,writingMode:"vertical-rl"}}>SCROLL</div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────── */}
      <section id="about" style={{padding:"110px 6%",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1240,margin:"0 auto"}}>
          <SecHeader num="01" title="About Me"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"start",marginTop:56}}>
            <Reveal>
              <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.7rem",color:"#22c55e",marginBottom:10,letterSpacing:2}}>// profile.json</div>
              <div className="glass-panel code-scan" style={{padding:26,position:"relative",overflow:"hidden",marginBottom:24}}>
                <pre style={{fontFamily:"'Fira Code',monospace",fontSize:"0.76rem",color:"rgba(226,232,240,0.65)",lineHeight:1.85,margin:0,whiteSpace:"pre-wrap"}}>
{`{
  "name": "${profile.name}",
  "role": "Full-Stack Dev & AI Automation Specialist",
  "company": "${profile.company || "Kwagei"}",
  "experience": "${profile.yearsExp || "2+"} years professional",
  "location": "${profile.location}",
  "specialties": [
    "AI Systems & LLM Integration",
    "Business Automation",
    "Full-Stack Web Apps",
    "FastAI / ML Pipelines"
  ],
  "stack": ["Python","Django","Node.js","Vue","FastAI"],
  "status": "${profile.available?"available_for_hire":"currently_busy"}",
  "fast_learner": true
}`}
                </pre>
              </div>
              <p style={{fontSize:"0.95rem",lineHeight:1.9,color:"rgba(226,232,240,0.62)",marginBottom:14}}>
                I'm a full-stack developer and AI automation specialist with <strong style={{color:"#00d4ff"}}>2 years of professional experience at Kwagei</strong>, where I build real-world software that improves business operations and productivity. I specialize in AI systems, intelligent automation, and custom web applications.
              </p>
              <p style={{fontSize:"0.95rem",lineHeight:1.9,color:"rgba(226,232,240,0.62)"}}>
                I build with <strong style={{color:"#e879f9"}}>Python (FastAI), Django, Node.js, Vue</strong> and modern AI models — helping businesses reduce manual work and operate smarter. I'm also a <strong style={{color:"#22c55e"}}>fast learner</strong> who adapts quickly to new technologies and delivers results efficiently. Seeking <strong style={{color:"#00d4ff"}}>remote roles</strong> and <strong style={{color:"#f59e0b"}}>freelance opportunities</strong>.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.7rem",color:"#22c55e",marginBottom:10,letterSpacing:2}}>// skill_map.json</div>
              {Object.keys(CAT_CLR).map(cat=>{
                const sk=INIT_SKILLS.filter(s=>s.cat===cat);
                if(!sk.length) return null;
                return (
                  <div key={cat} style={{marginBottom:18}}>
                    <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.65rem",color:CAT_CLR[cat],letterSpacing:2,marginBottom:8,textTransform:"uppercase",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:16,height:1,background:CAT_CLR[cat],display:"inline-block"}}/>
                      {cat}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                      {sk.map(s=>(
                        <span key={s.name} className="tech-tag">{s.icon} {s.name}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────────── */}
      <section id="projects" style={{padding:"110px 6%",position:"relative",zIndex:1,background:"rgba(0,212,255,0.018)"}}>
        <div style={{maxWidth:1240,margin:"0 auto"}}>
          <SecHeader num="02" title="Projects"/>
          <div style={{display:"flex",gap:8,marginTop:36,marginBottom:44,flexWrap:"wrap"}}>
            {["all","fullstack","backend","automation","systems"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={`filter-btn${filter===f?" active":""}`}>{f}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:20}}>
            {filtered.map((p,i)=>(
              <Reveal key={p.id} delay={i*.07}>
                <div className="proj-card" onClick={()=>setModal(p)} style={{borderLeft:`3px solid ${p.color}`}}>
                  <div className="proj-card-glow" style={{background:`linear-gradient(90deg,transparent,${p.color},transparent)`}}/>
                  {p.featured&&<span className="featured-badge">★ FEATURED</span>}
                  <div style={{fontSize:"2rem",marginBottom:14}}>{p.icon}</div>
                  <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"1.15rem",fontWeight:700,color:"#fff",marginBottom:8}}>{p.name}</div>
                  <p style={{fontSize:"0.84rem",lineHeight:1.7,color:"rgba(226,232,240,0.5)",marginBottom:18}}>{p.desc}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:18}}>
                    {p.stack.map(t=><span key={t} className="stack-tag">{t}</span>)}
                  </div>
                  <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.68rem",color:p.color,letterSpacing:1}}>View Details →</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ───────────────────────── */}
      <section id="experience" style={{padding:"80px 6% 0",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1240,margin:"0 auto"}}>
          <SecHeader num="03" title="Experience"/>
          <div style={{marginTop:48,display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            <Reveal>
              <div className="glass-panel" style={{padding:32,position:"relative",borderLeft:"3px solid #00d4ff"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,#00d4ff,transparent)"}}/>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14,gap:12}}>
                  <div>
                    <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"1.2rem",fontWeight:800,color:"#fff"}}>Full-Stack Developer</div>
                    <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.72rem",color:"#00d4ff",letterSpacing:2,marginTop:4}}>@ KWAGEI</div>
                  </div>
                  <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.62rem",color:"rgba(226,232,240,0.28)",letterSpacing:1,textAlign:"right",whiteSpace:"nowrap",border:"1px solid rgba(0,212,255,0.12)",padding:"4px 10px"}}>2 YEARS · CURRENT</div>
                </div>
                <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:9}}>
                  {[
                    "Building AI-powered automation tools that reduce manual business operations",
                    "Developing full-stack web applications using Python, Django, Node.js and Vue",
                    "Integrating modern AI models (FastAI, LLM APIs) into production systems",
                    "Designing data pipelines and intelligent automation workflows",
                    "Shipping real software that improves productivity for real users",
                  ].map((item,i)=>(
                    <li key={i} style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:"0.85rem",lineHeight:1.65,color:"rgba(226,232,240,0.55)"}}>
                      <span style={{color:"#00d4ff",flexShrink:0,marginTop:2}}>▸</span>{item}
                    </li>
                  ))}
                </ul>
                <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:20}}>
                  {["Python","Django","Node.js","Vue.js","FastAI","AI Models","Automation"].map(t=>(
                    <span key={t} className="stack-tag">{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {/* Key Strengths */}
                <div className="glass-panel" style={{padding:26,borderLeft:"3px solid #e879f9"}}>
                  <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.65rem",color:"#e879f9",letterSpacing:2,marginBottom:14}}>KEY STRENGTHS</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[
                      {icon:"🧠",label:"AI Systems"},
                      {icon:"🔁",label:"Automation"},
                      {icon:"⚡",label:"Fast Learner"},
                      {icon:"🌐",label:"Full-Stack"},
                      {icon:"📦",label:"Delivery"},
                      {icon:"🔧",label:"Problem Solver"},
                    ].map(({icon,label})=>(
                      <div key={label} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",background:"rgba(232,121,249,0.04)",border:"1px solid rgba(232,121,249,0.1)"}}>
                        <span style={{fontSize:"1.1rem"}}>{icon}</span>
                        <span style={{fontFamily:"'Fira Code',monospace",fontSize:"0.7rem",color:"rgba(226,232,240,0.5)",letterSpacing:1}}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* What I Offer */}
                <div className="glass-panel" style={{padding:26,borderLeft:"3px solid #22c55e"}}>
                  <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.65rem",color:"#22c55e",letterSpacing:2,marginBottom:12}}>WHAT I OFFER CLIENTS</div>
                  <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
                    {[
                      "AI chatbots & automation systems",
                      "Full-stack web application development",
                      "Business workflow automation",
                      "Data pipelines & web scraping",
                      "Fast delivery, clean code, real results",
                    ].map((item,i)=>(
                      <li key={i} style={{display:"flex",gap:8,fontSize:"0.83rem",color:"rgba(226,232,240,0.5)",lineHeight:1.5}}>
                        <span style={{color:"#22c55e"}}>✓</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SKILLS ───────────────────────────── */}
      <section id="skills" style={{padding:"110px 6%",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1240,margin:"0 auto"}}>
          <SecHeader num="04" title="Technical Skills"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,marginTop:56}}>
            {[INIT_SKILLS.slice(0,9), INIT_SKILLS.slice(9)].map((col,ci)=>(
              <Reveal key={ci} delay={ci*.1}>
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {col.map((s,i)=><SkillRow key={s.name} s={s} delay={i*.05+ci*.1}/>)}
                </div>
              </Reveal>
            ))}
          </div>
          {/* Skill Icons Grid */}
          <Reveal delay={0.2}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:12,marginTop:52}}>
              {INIT_SKILLS.map(s=>(
                <div key={s.name} className="skill-icon-card">
                  <div style={{fontSize:"1.8rem",marginBottom:8}}>{s.icon}</div>
                  <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.62rem",color:"rgba(226,232,240,0.45)",letterSpacing:1}}>{s.name}</div>
                  <div style={{marginTop:6,height:2,background:`rgba(226,232,240,0.05)`,borderRadius:1,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${s.pct}%`,background:CAT_CLR[s.cat]||"#00d4ff",opacity:.6,borderRadius:1}}/>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────── */}
      <section id="contact" style={{padding:"110px 6%",position:"relative",zIndex:1,background:"rgba(0,212,255,0.018)"}}>
        <div style={{maxWidth:1240,margin:"0 auto"}}>
          <SecHeader num="05" title="Get In Touch"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,marginTop:56}}>
            <Reveal>
              <h3 style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:800,color:"#fff",lineHeight:1.05,marginBottom:20}}>
                Let's Build<br/><span className="grad-text">Something Real.</span>
              </h3>
              <p style={{fontSize:"0.95rem",lineHeight:1.85,color:"rgba(226,232,240,0.5)",marginBottom:36}}>
                I'm a full-stack developer and AI automation specialist with 2 years of professional experience. I'm open to remote engineering roles, freelance AI/automation projects, and technical partnerships. If you're looking for someone who builds real things that work — let's talk.
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[
                  {icon:"📧",label:"Email",val:profile.email,href:`mailto:${profile.email}`},
                  {icon:"🐙",label:"GitHub",val:profile.github,href:`https://${profile.github}`},
                  {icon:"💼",label:"LinkedIn",val:profile.linkedin,href:`https://${profile.linkedin}`},
                  {icon:"📍",label:"Location",val:profile.location,href:null},
                ].map(({icon,label,val,href})=>(
                  <a key={label} href={href||"#"} target={href?"_blank":undefined} className="contact-link">
                    <div className="contact-link-icon">{icon}</div>
                    <div>
                      <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.6rem",color:"rgba(226,232,240,0.3)",letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>{label}</div>
                      <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"0.9rem",fontWeight:600,color:"#e2e8f0"}}>{val}</div>
                    </div>
                  </a>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="glass-panel" style={{padding:36,position:"relative"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#00d4ff,#e879f9)"}}/>
                <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.68rem",color:"rgba(0,212,255,0.5)",letterSpacing:2,marginBottom:22}}>// send_message()</div>
                {[
                  {k:"name",label:"Your Name",type:"text",ph:"John Doe"},
                  {k:"email",label:"Email",type:"email",ph:"john@company.com"},
                  {k:"subject",label:"Subject",type:"text",ph:"Project inquiry..."},
                ].map(({k,label,type,ph})=>(
                  <div key={k} style={{marginBottom:16}}>
                    <label className="form-label">{label}</label>
                    <input type={type} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} className="form-input"/>
                  </div>
                ))}
                <div style={{marginBottom:18}}>
                  <label className="form-label">Message</label>
                  <textarea value={form.msg} onChange={e=>setForm(p=>({...p,msg:e.target.value}))} placeholder="Tell me what you're building..." rows={4} className="form-input" style={{resize:"none"}}/>
                </div>
                <button onClick={submitForm} className="btn-primary" style={{width:"100%",display:"block",textAlign:"center",border:"none",cursor:"pointer"}}>
                  Send Message →
                </button>
                {formSt==="success"&&<div className="form-success">✓ Sent! I'll reply within 24 hours.</div>}
                {formSt==="error"&&<div className="form-error">⚠ Please fill in all required fields.</div>}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{padding:"26px 6%",borderTop:"1px solid rgba(0,212,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:1,flexWrap:"wrap",gap:10}}>
        <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.68rem",color:"rgba(226,232,240,0.25)",letterSpacing:1}}>
          © 2025 <span style={{color:"#00d4ff"}}>Mulbah Kolleh</span> — Full-Stack Dev & AI Automation Specialist · Kwagei
        </div>
        <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.68rem",color:"rgba(226,232,240,0.18)"}}>
          Built to get the job ✦
        </div>
      </footer>

      {/* ── AI CHAT ──────────────────────────── */}
      <div style={{position:"fixed",bottom:26,right:26,zIndex:500,display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
        {chatOpen&&(
          <div className="glass-panel chat-panel">
            <div style={{padding:"13px 16px",borderBottom:"1px solid rgba(0,212,255,0.12)",display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e",animation:"pulse-dot 2s infinite"}}/>
              <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"0.88rem",fontWeight:700,color:"#fff"}}>Ask about Mulbah</div>
              <button onClick={()=>setChatOpen(false)} style={{marginLeft:"auto",background:"none",border:"none",color:"rgba(226,232,240,0.35)",cursor:"pointer",fontSize:"1.2rem",lineHeight:1}}>×</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:9}}>
              {chatMsgs.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"82%",padding:"9px 13px",background:m.role==="user"?"#00d4ff":"rgba(0,212,255,0.07)",border:m.role==="user"?"none":"1px solid rgba(0,212,255,0.15)",color:m.role==="user"?"#050810":"rgba(226,232,240,0.82)",fontFamily:"'DM Sans',sans-serif",fontSize:"0.81rem",lineHeight:1.65,animation:"fadeIn .3s ease"}}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatBusy&&<div style={{display:"flex",gap:4,padding:"9px 13px",background:"rgba(0,212,255,0.07)",border:"1px solid rgba(0,212,255,0.15)",width:"fit-content"}}>
                {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#00d4ff",animation:`blink 1.2s ${i*.25}s infinite`}}/>)}
              </div>}
              <div ref={chatEndRef}/>
            </div>
            <div style={{padding:"10px 12px",borderTop:"1px solid rgba(0,212,255,0.1)",display:"flex",gap:8}}>
              <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask anything..." style={{flex:1,background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.14)",padding:"9px 11px",color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif",fontSize:"0.8rem",outline:"none"}}/>
              <button onClick={sendChat} disabled={chatBusy} style={{padding:"9px 16px",background:"#00d4ff",border:"none",color:"#050810",cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:"0.82rem",transition:"opacity 0.2s",opacity:chatBusy?.6:1}}>→</button>
            </div>
          </div>
        )}
        <button onClick={()=>setChatOpen(o=>!o)} className="chat-fab" style={{background:chatOpen?"#e879f9":"#00d4ff"}}>
          {chatOpen?"×":"🤖"}
        </button>
      </div>

      {/* ── PROJECT MODAL ────────────────────── */}
      {modal&&(
        <div onClick={()=>setModal(null)} style={{position:"fixed",inset:0,background:"rgba(5,8,16,0.94)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"5%",animation:"fadeIn .25s"}}>
          <div onClick={e=>e.stopPropagation()} className="glass-panel modal-box" style={{borderLeft:`3px solid ${modal.color}`}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${modal.color},transparent)`}}/>
            <button onClick={()=>setModal(null)} style={{position:"absolute",top:14,right:16,background:"none",border:"none",color:"rgba(226,232,240,0.35)",cursor:"pointer",fontSize:"1.6rem",lineHeight:1}}>×</button>
            <div style={{fontSize:"2.8rem",marginBottom:14}}>{modal.icon}</div>
            <h3 style={{fontFamily:"'Oxanium',sans-serif",fontSize:"1.9rem",fontWeight:800,color:"#fff",marginBottom:10}}>{modal.name}</h3>
            <p style={{fontSize:"0.95rem",lineHeight:1.85,color:"rgba(226,232,240,0.6)",marginBottom:22}}>{modal.detail}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:26}}>
              {modal.stack.map(t=><span key={t} className="stack-tag">{t}</span>)}
            </div>
            <div style={{display:"flex",gap:12}}>
              {modal.github&&<a href={modal.github} target="_blank" className="btn-primary">View on GitHub →</a>}
              {modal.live&&modal.live!=="#"&&<a href={modal.live} target="_blank" className="btn-outline">Live Demo →</a>}
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN PANEL ──────────────────────── */}
      {adminOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(5,8,16,0.97)",zIndex:900,overflowY:"auto",animation:"fadeIn .3s"}}>
          <div style={{maxWidth:860,margin:"0 auto",padding:"36px 5% 60px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,paddingBottom:18,borderBottom:"1px solid rgba(0,212,255,0.1)"}}>
              <div>
                <h2 style={{fontFamily:"'Oxanium',sans-serif",fontSize:"1.7rem",fontWeight:800,color:"#fff"}}>⚙ Admin Panel</h2>
                <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.65rem",color:"rgba(0,212,255,0.45)",marginTop:4,letterSpacing:2}}>PORTFOLIO CONTROL CENTER</div>
              </div>
              {saveMsg&&<div style={{padding:"8px 18px",background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.35)",color:"#22c55e",fontFamily:"'Fira Code',monospace",fontSize:"0.72rem"}}>{saveMsg}</div>}
              <button onClick={()=>{setAdminOpen(false);setAuthed(false);setPwd("");}} style={{background:"none",border:"1px solid rgba(226,232,240,0.15)",color:"rgba(226,232,240,0.4)",padding:"8px 16px",cursor:"pointer",fontFamily:"'Fira Code',monospace",fontSize:"0.7rem"}}>✕ Close</button>
            </div>

            {!authed?(
              <div className="glass-panel" style={{padding:44,textAlign:"center",maxWidth:400,margin:"60px auto 0"}}>
                <div style={{fontSize:"3rem",marginBottom:16}}>🔐</div>
                <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"1.3rem",fontWeight:700,color:"#fff",marginBottom:8}}>Admin Access</div>
                <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.65rem",color:"rgba(0,212,255,0.4)",marginBottom:20,letterSpacing:2}}>Enter your admin password</div>
                <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Enter password" style={{width:"100%",background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.18)",padding:"12px 16px",color:"#e2e8f0",fontFamily:"'Fira Code',monospace",fontSize:"0.9rem",marginBottom:14,textAlign:"center"}}/>
                <button onClick={login} className="btn-primary" style={{width:"100%",display:"block",textAlign:"center",border:"none",cursor:"pointer"}}>UNLOCK →</button>
              </div>
            ):(
              <div>
                {/* TABS */}
                <div style={{display:"flex",gap:6,marginBottom:24}}>
                  {["profile","projects","add"].map(t=>(
                    <button key={t} onClick={()=>setTab(t)} style={{padding:"9px 22px",background:tab===t?"#00d4ff":"rgba(0,212,255,0.05)",border:`1px solid ${tab===t?"#00d4ff":"rgba(0,212,255,0.14)"}`,color:tab===t?"#050810":"rgba(226,232,240,0.4)",fontFamily:"'Fira Code',monospace",fontSize:"0.7rem",cursor:"pointer",letterSpacing:1,textTransform:"uppercase",transition:"all .3s"}}>
                      {t==="profile"?"👤 Profile":t==="projects"?"📋 Projects":"➕ Add Project"}
                    </button>
                  ))}
                </div>

                {/* PROFILE TAB */}
                {tab==="profile"&&draftProfile&&(
                  <div className="glass-panel" style={{padding:32}}>
                    {/* Photo Upload */}
                    <div style={{marginBottom:26,padding:22,background:"rgba(0,212,255,0.03)",border:"1px dashed rgba(0,212,255,0.18)",textAlign:"center"}}>
                      <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.65rem",color:"rgba(0,212,255,0.5)",letterSpacing:2,marginBottom:12}}>PROFILE PHOTO</div>
                      {draftProfile.photo&&<div style={{marginBottom:12}}><img src={draftProfile.photo} style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"2px solid #00d4ff",boxShadow:"0 0 20px rgba(0,212,255,0.3)"}}/></div>}
                      <label style={{padding:"10px 22px",background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.25)",color:"#00d4ff",cursor:"pointer",fontFamily:"'Fira Code',monospace",fontSize:"0.7rem",letterSpacing:1}}>
                        📸 Upload Your Photo
                        <input type="file" accept="image/*" onChange={uploadPhoto} style={{display:"none"}}/>
                      </label>
                      <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.6rem",color:"rgba(226,232,240,0.2)",marginTop:8,letterSpacing:1}}>PNG, JPG, WEBP — max 5MB</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      {[["name","Full Name"],["title","Job Title"],["location","Location"],["email","Email"],["github","GitHub URL"],["linkedin","LinkedIn URL"]].map(([k,lbl])=>(
                        <div key={k}>
                          <label className="form-label">{lbl}</label>
                          <input value={draftProfile[k]||""} onChange={e=>setDP(p=>({...p,[k]:e.target.value}))} className="form-input"/>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:16}}>
                      <label className="form-label">Bio</label>
                      <textarea value={draftProfile.bio||""} onChange={e=>setDP(p=>({...p,bio:e.target.value}))} rows={3} className="form-input" style={{resize:"vertical"}}/>
                    </div>
                    <div style={{marginTop:14,display:"flex",alignItems:"center",gap:10}}>
                      <input type="checkbox" id="avail" checked={draftProfile.available||false} onChange={e=>setDP(p=>({...p,available:e.target.checked}))} style={{accentColor:"#00d4ff",width:16,height:16}}/>
                      <label htmlFor="avail" style={{fontFamily:"'Fira Code',monospace",fontSize:"0.72rem",color:"#22c55e",cursor:"pointer"}}>Mark as available for work</label>
                    </div>
                    <button onClick={saveProfile} style={{marginTop:22,padding:"12px 30px",background:"#22c55e",border:"none",color:"#050810",fontFamily:"'Oxanium',sans-serif",fontWeight:700,cursor:"pointer",fontSize:"0.82rem",letterSpacing:1}}>💾 Save Profile</button>
                  </div>
                )}

                {/* PROJECTS TAB */}
                {tab==="projects"&&(
                  <div className="glass-panel" style={{padding:32}}>
                    <h3 style={{fontFamily:"'Oxanium',sans-serif",fontSize:"1rem",fontWeight:700,color:"#e879f9",marginBottom:18,letterSpacing:1}}>YOUR PROJECTS ({projects.length})</h3>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {projects.map(p=>(
                        <div key={p.id} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 18px",background:"rgba(0,212,255,0.03)",border:"1px solid rgba(0,212,255,0.09)",borderLeft:`3px solid ${p.color}`}}>
                          <span style={{fontSize:"1.3rem"}}>{p.icon}</span>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"0.95rem",fontWeight:700,color:"#fff"}}>{p.name}</div>
                            <div style={{fontFamily:"'Fira Code',monospace",fontSize:"0.6rem",color:"rgba(226,232,240,0.3)",letterSpacing:1,marginTop:2}}>{p.cat} · {Array.isArray(p.stack)?p.stack.join(", "):p.stack}</div>
                          </div>
                          {p.featured&&<span style={{fontFamily:"'Fira Code',monospace",fontSize:"0.58rem",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.35)",padding:"2px 8px"}}>FEATURED</span>}
                          <button onClick={()=>deleteProject(p.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",color:"#ef4444",padding:"6px 14px",cursor:"pointer",fontFamily:"'Fira Code',monospace",fontSize:"0.65rem"}}>Delete</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ADD PROJECT TAB */}
                {tab==="add"&&(
                  <div className="glass-panel" style={{padding:32}}>
                    <h3 style={{fontFamily:"'Oxanium',sans-serif",fontSize:"1rem",fontWeight:700,color:"#e879f9",marginBottom:22,letterSpacing:1}}>ADD NEW PROJECT</h3>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      {[["name","Project Name","text"],["icon","Emoji Icon","text"],["github","GitHub URL","text"],["live","Live URL (optional)","text"]].map(([k,lbl,type])=>(
                        <div key={k}>
                          <label className="form-label">{lbl}</label>
                          <input type={type} value={newProj[k]} onChange={e=>setNP(p=>({...p,[k]:e.target.value}))} className="form-input"/>
                        </div>
                      ))}
                      <div>
                        <label className="form-label">Category</label>
                        <select value={newProj.cat} onChange={e=>setNP(p=>({...p,cat:e.target.value}))} className="form-input" style={{cursor:"pointer"}}>
                          <option value="fullstack">Full Stack</option>
                          <option value="backend">Backend</option>
                          <option value="frontend">Frontend</option>
                          <option value="automation">Automation</option>
                          <option value="systems">Systems</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Accent Color</label>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <input type="color" value={newProj.color} onChange={e=>setNP(p=>({...p,color:e.target.value}))} style={{width:44,height:38,border:"1px solid rgba(0,212,255,0.15)",background:"transparent",cursor:"pointer",padding:2}}/>
                          <input value={newProj.color} onChange={e=>setNP(p=>({...p,color:e.target.value}))} className="form-input" style={{flex:1}}/>
                        </div>
                      </div>
                    </div>
                    <div style={{marginTop:16}}>
                      <label className="form-label">Short Description</label>
                      <input value={newProj.desc} onChange={e=>setNP(p=>({...p,desc:e.target.value}))} className="form-input"/>
                    </div>
                    <div style={{marginTop:14}}>
                      <label className="form-label">Detailed Description</label>
                      <textarea value={newProj.detail} onChange={e=>setNP(p=>({...p,detail:e.target.value}))} rows={3} className="form-input" style={{resize:"vertical"}}/>
                    </div>
                    <div style={{marginTop:14}}>
                      <label className="form-label">Tech Stack (comma-separated)</label>
                      <input value={newProj.stack} onChange={e=>setNP(p=>({...p,stack:e.target.value}))} placeholder="Node.js, Python, SQLite, Redis" className="form-input"/>
                    </div>
                    <div style={{marginTop:14,display:"flex",alignItems:"center",gap:10}}>
                      <input type="checkbox" id="feat" checked={newProj.featured} onChange={e=>setNP(p=>({...p,featured:e.target.checked}))} style={{accentColor:"#e879f9",width:16,height:16}}/>
                      <label htmlFor="feat" style={{fontFamily:"'Fira Code',monospace",fontSize:"0.72rem",color:"#f59e0b",cursor:"pointer"}}>Mark as Featured</label>
                    </div>
                    <button onClick={addProject} style={{marginTop:22,padding:"12px 30px",background:"#e879f9",border:"none",color:"#050810",fontFamily:"'Oxanium',sans-serif",fontWeight:700,cursor:"pointer",fontSize:"0.82rem",letterSpacing:1}}>➕ Add Project</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function Typer({ phrases }) {
  const [txt, setTxt] = useState("");
  const [pi, setPi]   = useState(0);
  const [ci, setCi]   = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = phrases[pi];
    const t = setTimeout(() => {
      if (!del) {
        setTxt(cur.slice(0, ci+1));
        if (ci+1 === cur.length) { setTimeout(()=>setDel(true), 1900); return; }
        setCi(c=>c+1);
      } else {
        setTxt(cur.slice(0, ci-1));
        if (ci-1 === 0) { setDel(false); setPi(p=>(p+1)%phrases.length); }
        setCi(c=>c-1);
      }
    }, del ? 52 : 90);
    return () => clearTimeout(t);
  }, [ci, del, pi, phrases]);
  return <span>{txt}<span style={{color:"#00d4ff",animation:"blink 1s infinite"}}>|</span></span>;
}

function SecHeader({ num, title }) {
  return (
    <Reveal>
      <div style={{display:"flex",alignItems:"center",gap:18}}>
        <span style={{fontFamily:"'Fira Code',monospace",fontSize:"0.72rem",color:"#00d4ff",letterSpacing:2}}>{num} /</span>
        <h2 style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(1.9rem,3.8vw,3rem)",fontWeight:800,color:"#fff",letterSpacing:-1}}>{title}</h2>
        <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(0,212,255,0.28),transparent)"}}/>
      </div>
    </Reveal>
  );
}

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(28px)",transition:`opacity .7s ${delay}s ease, transform .7s ${delay}s ease`}}>
      {children}
    </div>
  );
}

function SkillRow({ s, delay }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(()=>setVis(true), delay*1000); io.disconnect(); } }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [delay]);
  const clr = CAT_CLR[s.cat] || "#00d4ff";
  return (
    <div ref={ref} style={{opacity:vis?1:0,transition:`opacity .5s ${delay}s`}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontFamily:"'Fira Code',monospace",fontSize:"0.76rem",color:"rgba(226,232,240,0.65)"}}>{s.icon} {s.name}</span>
        <span style={{fontFamily:"'Fira Code',monospace",fontSize:"0.65rem",color:clr}}>{s.pct}%</span>
      </div>
      <div style={{height:3,background:"rgba(226,232,240,0.05)",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:vis?`${s.pct}%`:"0%",background:`linear-gradient(90deg,${clr},${clr}88)`,transition:`width 1.4s ${delay+.1}s cubic-bezier(.4,0,.2,1)`,borderRadius:2,boxShadow:`0 0 8px ${clr}55`}}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────── */
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;600;700;800&family=Fira+Code:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-track { background: #050810; }
      ::-webkit-scrollbar-thumb { background: #00d4ff; border-radius: 2px; }
      body { cursor: default; }

      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes spin-rev { to { transform: rotate(-360deg); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      @keyframes float-y { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
      @keyframes pulse-badge { 0%,100% { box-shadow: 0 0 0 0 rgba(0,212,255,0.4); } 60% { box-shadow: 0 0 0 12px rgba(0,212,255,0); } }
      @keyframes pulse-dot { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); } 70% { box-shadow: 0 0 0 7px rgba(34,197,94,0); } }
      @keyframes scan { 0% { top: 0; opacity: 0.6; } 100% { top: 100%; opacity: 0; } }
      @keyframes grad-anim { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

      .fade-up { animation: fadeUp 0.9s both; opacity: 0; }
      .float-anim { animation: float-y 5.5s ease-in-out infinite; }
      .ring-spin { animation: spin 24s linear infinite; }
      .ring-spin-rev { animation: spin-rev 18s linear infinite; }
      .badge-pulse { animation: pulse-badge 2.5s infinite; }

      .grad-text {
        background: linear-gradient(135deg, #00d4ff, #e879f9, #00d4ff);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: grad-anim 4s ease infinite;
      }

      .glass-panel {
        background: rgba(14,165,233,0.04);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(0,212,255,0.1);
      }

      .code-scan { position: relative; overflow: hidden; }
      .code-scan::after {
        content: '';
        position: absolute;
        left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent, rgba(0,212,255,0.25), transparent);
        animation: scan 4s linear infinite;
      }

      .admin-btn {
        background: rgba(0,212,255,0.06);
        border: 1px solid rgba(0,212,255,0.2);
        color: #00d4ff;
        padding: 8px 18px;
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        cursor: pointer;
        letter-spacing: 1px;
        transition: all 0.3s;
      }
      .admin-btn:hover { background: rgba(0,212,255,0.14); box-shadow: 0 0 14px rgba(0,212,255,0.2); }

      .btn-primary {
        display: inline-block;
        padding: 13px 30px;
        background: #00d4ff;
        color: #050810;
        font-family: 'Oxanium', sans-serif;
        font-weight: 700;
        font-size: 0.85rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        text-decoration: none;
        transition: all 0.3s;
        box-shadow: 0 0 20px rgba(0,212,255,0.25);
      }
      .btn-primary:hover { box-shadow: 0 0 40px rgba(0,212,255,0.5); transform: translateY(-2px); }

      .btn-outline {
        display: inline-block;
        padding: 13px 30px;
        background: transparent;
        border: 1.5px solid rgba(0,212,255,0.38);
        color: #00d4ff;
        font-family: 'Oxanium', sans-serif;
        font-weight: 700;
        font-size: 0.85rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        text-decoration: none;
        transition: all 0.3s;
      }
      .btn-outline:hover { border-color: #00d4ff; box-shadow: 0 0 20px rgba(0,212,255,0.2); transform: translateY(-2px); }

      .btn-ghost {
        display: inline-block;
        padding: 13px 30px;
        background: transparent;
        border: 1px solid rgba(226,232,240,0.1);
        color: rgba(226,232,240,0.42);
        font-family: 'Oxanium', sans-serif;
        font-weight: 700;
        font-size: 0.85rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        text-decoration: none;
        transition: all 0.3s;
      }
      .btn-ghost:hover { border-color: rgba(226,232,240,0.3); color: rgba(226,232,240,0.75); transform: translateY(-2px); }

      .tech-tag {
        padding: 5px 12px;
        background: rgba(0,212,255,0.06);
        border: 1px solid rgba(0,212,255,0.12);
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        color: rgba(226,232,240,0.65);
        transition: all 0.3s;
        cursor: default;
      }
      .tech-tag:hover { background: rgba(0,212,255,0.12); color: #00d4ff; border-color: rgba(0,212,255,0.3); }

      .stack-tag {
        padding: 4px 10px;
        background: rgba(0,212,255,0.07);
        border: 1px solid rgba(0,212,255,0.14);
        font-family: 'Fira Code', monospace;
        font-size: 0.65rem;
        color: rgba(0,212,255,0.75);
      }

      .filter-btn {
        padding: 8px 18px;
        background: rgba(0,212,255,0.04);
        border: 1px solid rgba(0,212,255,0.13);
        color: rgba(226,232,240,0.38);
        font-family: 'Fira Code', monospace;
        font-size: 0.7rem;
        cursor: pointer;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        transition: all 0.3s;
      }
      .filter-btn.active, .filter-btn:hover {
        background: #00d4ff;
        border-color: #00d4ff;
        color: #050810;
      }

      .proj-card {
        background: rgba(14,165,233,0.04);
        border: 1px solid rgba(0,212,255,0.09);
        padding: 28px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: transform 0.38s ease, border-color 0.3s, box-shadow 0.38s ease;
        height: 100%;
      }
      .proj-card:hover {
        transform: translateY(-8px);
        border-color: rgba(0,212,255,0.28);
        box-shadow: 0 24px 60px rgba(0,0,0,0.45), 0 0 30px rgba(0,212,255,0.07);
      }
      .proj-card-glow {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.4s;
      }
      .proj-card:hover .proj-card-glow { transform: scaleX(1); }

      .featured-badge {
        position: absolute;
        top: 14px; right: 14px;
        font-family: 'Fira Code', monospace;
        font-size: 0.58rem;
        color: #f59e0b;
        border: 1px solid rgba(245,158,11,0.35);
        padding: 3px 8px;
        letter-spacing: 1px;
      }

      .skill-icon-card {
        background: rgba(0,212,255,0.03);
        border: 1px solid rgba(0,212,255,0.08);
        padding: 20px 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: all 0.35s;
        cursor: default;
      }
      .skill-icon-card:hover {
        border-color: rgba(0,212,255,0.25);
        background: rgba(0,212,255,0.07);
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
      }

      .contact-link {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 18px;
        text-decoration: none;
        background: rgba(0,212,255,0.03);
        border: 1px solid rgba(0,212,255,0.09);
        transition: all 0.3s;
      }
      .contact-link:hover {
        border-color: rgba(0,212,255,0.3);
        background: rgba(0,212,255,0.07);
        transform: translateX(8px);
      }
      .contact-link-icon {
        width: 40px; height: 40px;
        background: rgba(0,212,255,0.08);
        border: 1px solid rgba(0,212,255,0.16);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.1rem; flex-shrink: 0;
        transition: all 0.3s;
      }
      .contact-link:hover .contact-link-icon { border-color: #00d4ff; box-shadow: 0 0 14px rgba(0,212,255,0.3); }

      .form-label {
        display: block;
        font-family: 'Fira Code', monospace;
        font-size: 0.62rem;
        color: rgba(226,232,240,0.32);
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 7px;
      }
      .form-input {
        width: 100%;
        background: rgba(0,212,255,0.03);
        border: 1px solid rgba(0,212,255,0.13);
        padding: 11px 13px;
        color: #e2e8f0;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.88rem;
        outline: none;
        transition: border-color 0.3s;
      }
      .form-input:focus { border-color: #00d4ff; }
      select.form-input option { background: #0a1628; }

      .form-success {
        margin-top: 12px; padding: 10px 14px;
        background: rgba(34,197,94,0.08);
        border: 1px solid rgba(34,197,94,0.28);
        color: #22c55e;
        font-family: 'Fira Code', monospace;
        font-size: 0.72rem; text-align: center;
      }
      .form-error {
        margin-top: 12px; padding: 10px 14px;
        background: rgba(239,68,68,0.08);
        border: 1px solid rgba(239,68,68,0.28);
        color: #ef4444;
        font-family: 'Fira Code', monospace;
        font-size: 0.72rem; text-align: center;
      }

      .chat-panel {
        width: 350px;
        height: 460px;
        display: flex;
        flex-direction: column;
        margin-bottom: 12px;
        animation: slideUp 0.3s ease;
      }
      .chat-fab {
        width: 54px; height: 54px;
        border-radius: 50%;
        border: none;
        color: #050810;
        font-size: 1.3rem;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.3s;
        box-shadow: 0 0 24px rgba(0,212,255,0.35);
      }
      .chat-fab:hover { transform: scale(1.1); box-shadow: 0 0 40px rgba(0,212,255,0.5); }

      .modal-box {
        max-width: 620px;
        width: 100%;
        padding: 38px;
        position: relative;
        animation: fadeUp 0.35s ease;
      }
    `}</style>
  );
}
