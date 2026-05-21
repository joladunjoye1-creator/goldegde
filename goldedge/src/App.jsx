import { useState, useEffect } from "react";

const GOLD_PIP = 0.10;
const GOLD_PIP_VAL_STD = 10.00;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#080b10;}
  input,select,button,textarea{font-family:'Syne',sans-serif;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(212,175,55,0.3);border-radius:99px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
  .tab-content{animation:fadeUp 0.3s ease both;}
`;

const C = {
  gold:"#D4AF37", goldLight:"#F0D060", goldDim:"#8B7022",
  bg:"#080b10", card:"rgba(14,19,28,0.95)",
  border:"rgba(212,175,55,0.15)", text:"#E8E0CC",
  muted:"#6B6450", green:"#4ADE80", red:"#F87171",
  blue:"#60A5FA", yellow:"#FBBF24",
};

const Label = ({children}) => (
  <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:C.muted,display:"block",marginBottom:6}}>{children}</span>
);

// Mobile-friendly text input — no re-click bug
const TInput = ({label,value,onChange,prefix,suffix,placeholder,hint,readOnly}) => (
  <div>
    {label && <Label>{label}</Label>}
    <div style={{position:"relative",display:"flex",alignItems:"center"}}>
      {prefix && <span style={{position:"absolute",left:12,fontSize:13,fontFamily:"'IBM Plex Mono'",color:C.gold,pointerEvents:"none",zIndex:1}}>{prefix}</span>}
      <input
        type="text" inputMode="decimal" value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder} readOnly={readOnly}
        style={{
          width:"100%",
          background: readOnly ? "rgba(212,175,55,0.04)" : "rgba(8,11,16,0.8)",
          border:`1px solid ${readOnly ? "rgba(212,175,55,0.08)" : C.border}`,
          borderRadius:8,
          padding:`13px ${suffix?"36px":"12px"} 13px ${prefix?"28px":"12px"}`,
          fontSize:15, fontFamily:"'IBM Plex Mono'",
          color: readOnly ? C.muted : C.text,
          outline:"none", transition:"border-color 0.2s", WebkitAppearance:"none"
        }}
        onFocus={e => { if(!readOnly) e.target.style.borderColor = C.gold; }}
        onBlur={e => { if(!readOnly) e.target.style.borderColor = C.border; }}
      />
      {suffix && <span style={{position:"absolute",right:12,fontSize:12,fontFamily:"'IBM Plex Mono'",color:C.muted,pointerEvents:"none"}}>{suffix}</span>}
    </div>
    {hint && <div style={{fontSize:11,color:C.muted,marginTop:5}}>{hint}</div>}
  </div>
);

const Card = ({children,style,glow}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,
    boxShadow:glow?`0 0 30px rgba(212,175,55,0.06)`:"none",...style}}>{children}</div>
);

const SectionTitle = ({children,sub}) => (
  <div style={{marginBottom:18}}>
    <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.gold}}>{children}</div>
    {sub && <div style={{fontSize:12,color:C.muted,marginTop:3}}>{sub}</div>}
  </div>
);

const StatBox = ({label,value,color=C.text,sub,accent}) => (
  <div style={{background:"rgba(8,11,16,0.7)",border:`1px solid ${accent||C.border}`,borderRadius:10,
    padding:"12px 14px",borderLeft:`3px solid ${accent||C.goldDim}`}}>
    <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:4}}>{label}</div>
    <div style={{fontSize:16,fontWeight:700,fontFamily:"'IBM Plex Mono'",color}}>{value}</div>
    {sub && <div style={{fontSize:11,color:C.muted,marginTop:2}}>{sub}</div>}
  </div>
);

const Divider = () => <div style={{height:1,background:C.border,margin:"18px 0"}}/>;

const Badge = ({children,color=C.gold}) => (
  <span style={{background:color+"18",border:`1px solid ${color}35`,color,borderRadius:5,
    padding:"2px 8px",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>{children}</span>
);

const InfoBox = ({children}) => (
  <div style={{padding:"10px 12px",background:"rgba(96,165,250,0.05)",border:`1px solid ${C.blue}20`,borderRadius:8,marginBottom:12}}>
    <span style={{fontSize:12,color:C.blue,lineHeight:1.7}}>{children}</span>
  </div>
);

function RRBar({ratio}) {
  const capped = Math.min(ratio,5);
  const pct = (capped/5)*100;
  const color = ratio>=2?C.green:ratio>=1?C.yellow:C.red;
  const label = ratio>=3?"Excellent":ratio>=2?"Good":ratio>=1?"Fair":"Poor";
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <Label>Your ratio</Label>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:20,fontWeight:800,fontFamily:"'IBM Plex Mono'",color}}>{ratio.toFixed(2)}×</span>
          <Badge color={color}>{label}</Badge>
        </div>
      </div>
      <div style={{height:6,background:"rgba(8,11,16,0.8)",borderRadius:99,overflow:"hidden",border:`1px solid ${C.border}`}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color}60,${color})`,borderRadius:99,transition:"width 0.5s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
      <div style={{fontSize:11,color:C.muted,marginTop:6}}>
        {ratio<1?"You're risking more than you could win — not recommended."
         :ratio<2?"You make more than you risk. Decent setup."
         :"Strong setup — your potential reward is well above your risk."}
      </div>
    </div>
  );
}

// ─── TAB 1: PIP VALUE ────────────────────────────────────────────────────────
function PipCalculator() {
  const [lots,setLots] = useState("0.10");
  const [pips,setPips] = useState("50");
  const [accountBal,setAccountBal] = useState("1000");
  const l=parseFloat(lots)||0, p=parseFloat(pips)||0, bal=parseFloat(accountBal)||0;
  const pipValThisLot = GOLD_PIP_VAL_STD*l;
  const totalPnl = pipValThisLot*p;
  const pctOfAccount = bal>0?(totalPnl/bal)*100:0;
  const presets=[0.01,0.05,0.1,0.25,0.5,1.0];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <InfoBox>
        💡 <strong>What is a pip?</strong> For gold (XAU/USD), 1 pip = a $0.10 move in price. So if gold moves from 4550.00 to 4555.00, that's 50 pips. The money you make or lose depends on your lot size.
      </InfoBox>
      <Card glow>
        <SectionTitle sub="XAU/USD · Gold">Pip Value Calculator</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <Label>Lot Size — tap a preset or type your own</Label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
              {presets.map(v=>(
                <button key={v} onClick={()=>setLots(String(v))} style={{
                  background:parseFloat(lots)===v?"rgba(212,175,55,0.15)":"rgba(8,11,16,0.7)",
                  border:`1px solid ${parseFloat(lots)===v?C.gold+"70":C.border}`,
                  borderRadius:7,color:parseFloat(lots)===v?C.gold:C.muted,
                  padding:"8px 12px",fontSize:12,fontFamily:"'IBM Plex Mono'",fontWeight:600,cursor:"pointer"}}>
                  {v}
                </button>
              ))}
            </div>
            <TInput value={lots} onChange={setLots} placeholder="0.10" suffix="lots"/>
          </div>
          <TInput label="Number of Pips" value={pips} onChange={setPips} placeholder="50" suffix="pips"/>
          <TInput label="Your Account Balance" value={accountBal} onChange={setAccountBal} prefix="$" placeholder="1000.00"/>
        </div>
      </Card>

      <Card>
        <SectionTitle>Your Results</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <StatBox label="Value Per Pip" value={`$${pipValThisLot.toFixed(3)}`} color={C.gold} accent={C.gold} sub="what 1 pip is worth"/>
          <StatBox label="Total P&L" value={`$${totalPnl.toFixed(2)}`} color={totalPnl>=0?C.green:C.red} accent={totalPnl>=0?C.green:C.red} sub={`for ${p} pips`}/>
        </div>
        {bal>0 && (
          <StatBox label="% of Your Account" value={`${pctOfAccount.toFixed(2)}%`}
            color={Math.abs(pctOfAccount)>5?C.red:C.green}
            accent={Math.abs(pctOfAccount)>5?C.red:C.green}
            sub={Math.abs(pctOfAccount)>5?"High — consider a smaller lot size":"Healthy risk level"}/>
        )}
        <Divider/>
        <div style={{fontSize:12,color:C.muted}}>
          <div style={{marginBottom:8,color:C.text,fontWeight:700}}>XAU/USD Pip Value Reference</div>
          {[["0.01 (Micro)","$0.10","Best for beginners"],["0.10 (Mini)","$1.00","Most common for small accounts"],["0.50","$5.00",""],["1.00 (Standard)","$10.00","For experienced traders"]].map(([l,v,note])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
              <div><div style={{color:C.text}}>{l} lots</div>{note&&<div style={{fontSize:10,color:C.muted}}>{note}</div>}</div>
              <span style={{fontFamily:"'IBM Plex Mono'",color:C.gold,fontWeight:700}}>{v}/pip</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle sub="If gold moves this many pips, here's your P&L">Pip Move Scenarios</SectionTitle>
        {[10,25,50,100,200].map(pipCount=>{
          const val=pipValThisLot*pipCount;
          const pct=bal>0?(val/bal*100).toFixed(2):"—";
          return (
            <div key={pipCount} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:13,color:C.muted}}>{pipCount} pips</span>
              <div style={{display:"flex",gap:16,alignItems:"center"}}>
                <span style={{fontFamily:"'IBM Plex Mono'",fontSize:13,color:C.green}}>+${val.toFixed(2)}</span>
                <span style={{fontFamily:"'IBM Plex Mono'",fontSize:13,color:C.red}}>-${val.toFixed(2)}</span>
                {bal>0&&<span style={{fontFamily:"'IBM Plex Mono'",fontSize:11,color:C.muted}}>{pct}%</span>}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

const Step = ({num,title,children}) => (
  <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
    <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,#D4AF37,#8B7022)`,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:13,fontWeight:900,color:"#080b10",flexShrink:0,marginTop:2}}>{num}</div>
    <div style={{flex:1}}>
      <div style={{fontSize:13,fontWeight:700,color:"#E8E0CC",marginBottom:12}}>{title}</div>
      {children}
    </div>
  </div>
);

// ─── TAB 2: RISK CALCULATOR ──────────────────────────────────────────────────
function RiskCalculator() {
  const [accountBal,setAccountBal] = useState("");
  const [riskPct,setRiskPct] = useState("2");
  const [entryPrice,setEntryPrice] = useState("");
  const [slPipsInput,setSlPipsInput] = useState("");
  const [rrInput,setRrInput] = useState("2");
  const [direction,setDirection] = useState("buy");
  const [r,setR] = useState(null);
  const riskPresets = ["1","2","3","5"];
  const rrOptions = [
    {label:"Same as my risk",    sub:"e.g. risk $20, make $20", val:"1"},
    {label:"1.5× my risk",       sub:"e.g. risk $20, make $30", val:"1.5"},
    {label:"2× my risk",         sub:"e.g. risk $20, make $40", val:"2"},
    {label:"3× my risk",         sub:"e.g. risk $20, make $60", val:"3"},
  ];

  useEffect(()=>{
    const bal=parseFloat(accountBal), rPct=parseFloat(riskPct)/100;
    const ep=parseFloat(entryPrice), slPips=parseFloat(slPipsInput), rrRatio=parseFloat(rrInput);
    if(!bal||!rPct||!ep||!slPips||!rrRatio||slPips<=0||rrRatio<=0){setR(null);return;}
    const dollarRisk=bal*rPct;
    const suggestedLots=dollarRisk/(GOLD_PIP_VAL_STD*slPips);
    const tpPips=slPips*rrRatio;
    const slPrice=direction==="buy"?ep-slPips*GOLD_PIP:ep+slPips*GOLD_PIP;
    const tpPrice=direction==="buy"?ep+tpPips*GOLD_PIP:ep-tpPips*GOLD_PIP;
    const dollarProfit=suggestedLots*GOLD_PIP_VAL_STD*tpPips;
    const lotRows=[1,0.1,0.01].map(l=>({l,profit:l*GOLD_PIP_VAL_STD*tpPips,loss:l*GOLD_PIP_VAL_STD*slPips,pipPerLot:l*GOLD_PIP_VAL_STD}));
    setR({slPrice:slPrice.toFixed(2),tpPrice:tpPrice.toFixed(2),slPips:slPips.toFixed(1),tpPips:tpPips.toFixed(1),rrRatio,dollarRisk,dollarProfit,suggestedLots,lotRows});
  },[accountBal,riskPct,entryPrice,slPipsInput,rrInput,direction]);

  const isCustomRisk = !riskPresets.includes(riskPct);
  const isCustomRR = !rrOptions.find(o=>o.val===rrInput);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card glow>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.gold,marginBottom:20}}>Risk Calculator · XAU/USD Gold</div>
        <div style={{display:"flex",flexDirection:"column",gap:24}}>

          {/* STEP 1 */}
          <Step num="1" title="How much is in your account?">
            <TInput value={accountBal} onChange={setAccountBal} prefix="$" placeholder="e.g. 1000"/>
            <div style={{marginTop:14}}>
              <Label>How much are you okay losing on this trade?</Label>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                {riskPresets.map(v=>(
                  <button key={v} onClick={()=>setRiskPct(v)} style={{
                    flex:1,background:riskPct===v?"rgba(212,175,55,0.15)":"rgba(8,11,16,0.7)",
                    border:`1px solid ${riskPct===v?C.gold+"80":C.border}`,
                    borderRadius:7,color:riskPct===v?C.gold:C.muted,
                    padding:"11px 0",fontSize:12,fontFamily:"'IBM Plex Mono'",fontWeight:700,cursor:"pointer"}}>
                    {v}%
                  </button>
                ))}
              </div>
              <TInput
                value={isCustomRisk ? riskPct : ""}
                onChange={v=>setRiskPct(v)}
                placeholder="Or type your own % — e.g. 6"
                suffix="%"
              />
              {accountBal&&riskPct&&(
                <div style={{marginTop:8,padding:"10px 12px",background:"rgba(74,222,128,0.06)",border:`1px solid ${C.green}20`,borderRadius:8}}>
                  <span style={{fontSize:13,color:C.green}}>Max loss on this trade: <strong>${(parseFloat(accountBal||0)*parseFloat(riskPct||0)/100).toFixed(2)}</strong></span>
                </div>
              )}
            </div>
          </Step>

          <div style={{height:1,background:C.border}}/>

          {/* STEP 2 */}
          <Step num="2" title="Where are you entering and where is your stop loss?">
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <TInput label="Entry Price" value={entryPrice} onChange={setEntryPrice} placeholder="e.g. 4550.00"/>
              <TInput label="Stop Loss Distance" value={slPipsInput} onChange={setSlPipsInput} suffix="pips" placeholder="e.g. 30" hint="How many pips from your entry to where you'll exit if wrong"/>
            </div>
          </Step>

          <div style={{height:1,background:C.border}}/>

          {/* STEP 3 */}
          <Step num="3" title="Are you buying or selling?">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
              {["buy","sell"].map(d=>(
                <button key={d} onClick={()=>setDirection(d)} style={{
                  background:direction===d?(d==="buy"?"rgba(74,222,128,0.12)":"rgba(248,113,113,0.12)"):"rgba(8,11,16,0.6)",
                  border:`1px solid ${direction===d?(d==="buy"?C.green:C.red)+"70":C.border}`,
                  borderRadius:10,color:direction===d?(d==="buy"?C.green:C.red):C.muted,
                  padding:"14px",fontSize:15,fontWeight:800,cursor:"pointer",transition:"all 0.15s",
                  letterSpacing:"0.04em",textTransform:"uppercase"}}>
                  {d==="buy"?"▲ Buy":"▼ Sell"}
                </button>
              ))}
            </div>
            <Label>How much do you want to make from this trade?</Label>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>
              {rrOptions.map(opt=>(
                <button key={opt.val} onClick={()=>setRrInput(opt.val)} style={{
                  background:rrInput===opt.val?"rgba(212,175,55,0.12)":"rgba(8,11,16,0.7)",
                  border:`1px solid ${rrInput===opt.val?C.gold+"70":C.border}`,
                  borderRadius:9,padding:"11px 14px",cursor:"pointer",transition:"all 0.15s",
                  display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:rrInput===opt.val?C.gold:C.text}}>{opt.label}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{opt.sub}</div>
                  </div>
                  {rrInput===opt.val&&<span style={{color:C.gold,fontSize:14}}>✓</span>}
                </button>
              ))}
            </div>
            <TInput
              value={isCustomRR ? rrInput : ""}
              onChange={v=>setRrInput(v)}
              placeholder="Or type your own — e.g. 1.2 or 4"
              suffix="×"
            />
            <div style={{fontSize:11,color:C.muted,marginTop:5}}>e.g. type 1.2 to make 1.2× what you risk</div>
          </Step>

        </div>
      </Card>

      {!r&&(
        <div style={{textAlign:"center",padding:"28px 0",color:C.muted}}>
          <div style={{fontSize:32,marginBottom:8}}>◈</div>
          <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>Your result will appear here</div>
          <div style={{fontSize:12}}>Complete all 3 steps above</div>
        </div>
      )}

      {r&&(<>
        <div style={{background:`linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.04))`,border:`1px solid ${C.gold}50`,borderRadius:16,padding:24,textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:C.muted,marginBottom:6}}>Trade this many lots</div>
          <div style={{fontSize:56,fontWeight:900,fontFamily:"'IBM Plex Mono'",color:C.gold,lineHeight:1}}>{r.suggestedLots.toFixed(2)}</div>
          <div style={{fontSize:15,color:C.muted,marginBottom:16}}>lots · XAU/USD · {direction==="buy"?"BUY ▲":"SELL ▼"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:"rgba(74,222,128,0.08)",border:`1px solid ${C.green}25`,borderRadius:10,padding:"14px"}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>If you win</div>
              <div style={{fontSize:24,fontWeight:800,fontFamily:"'IBM Plex Mono'",color:C.green}}>+${r.dollarProfit.toFixed(2)}</div>
            </div>
            <div style={{background:"rgba(248,113,113,0.08)",border:`1px solid ${C.red}25`,borderRadius:10,padding:"14px"}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>If you lose</div>
              <div style={{fontSize:24,fontWeight:800,fontFamily:"'IBM Plex Mono'",color:C.red}}>-${r.dollarRisk.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <Card>
          <SectionTitle>Your Price Levels</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            <StatBox label="Stop Loss" value={r.slPrice} sub={`${r.slPips} pips`} accent={C.red} color={C.red}/>
            <StatBox label="Entry" value={entryPrice} sub={direction==="buy"?"BUY":"SELL"} accent={C.gold} color={C.goldLight}/>
            <StatBox label="Take Profit" value={r.tpPrice} sub={`${r.tpPips} pips`} accent={C.green} color={C.green}/>
          </div>
          {[{label:"TP",price:r.tpPrice,color:C.green,pip:r.tpPips},{label:"ENTRY",price:entryPrice,color:C.gold,pip:null},{label:"SL",price:r.slPrice,color:C.red,pip:r.slPips}]
            .sort((a,b)=>parseFloat(b.price)-parseFloat(a.price))
            .map((row,i,arr)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<arr.length-1?`1px dashed ${C.border}`:"none"}}>
                <span style={{width:44,fontSize:10,fontWeight:800,color:row.color,letterSpacing:"0.1em",textAlign:"right"}}>{row.label}</span>
                <div style={{width:7,height:7,borderRadius:"50%",background:row.color,flexShrink:0,boxShadow:`0 0 8px ${row.color}80`}}/>
                <span style={{fontFamily:"'IBM Plex Mono'",fontSize:14,color:C.text,fontWeight:600}}>{row.price}</span>
                {row.pip&&<span style={{fontSize:11,color:C.muted,marginLeft:"auto"}}>{row.pip} pips</span>}
              </div>
            ))}
        </Card>

        <Card><RRBar ratio={r.rrRatio}/></Card>

        <Card>
          <SectionTitle sub="Same trade, different lot sizes">P&L by Lot Size</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:0,marginBottom:8}}>
            {["Lot","$/pip","If Win","If Loss"].map(h=>(
              <div key={h} style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 0",textAlign:h==="Lot"?"left":"center"}}>{h}</div>
            ))}
          </div>
          {r.lotRows.map(row=>(
            <div key={row.l} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:0,padding:"10px 0",borderTop:`1px solid ${C.border}`,alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Mono'",color:C.text}}>{row.l.toFixed(2)}</div>
                <div style={{fontSize:10,color:C.muted}}>{row.l===1?"Standard":row.l===0.1?"Mini":"Micro"}</div>
              </div>
              <div style={{textAlign:"center",fontFamily:"'IBM Plex Mono'",fontSize:13,color:C.gold}}>${row.pipPerLot.toFixed(2)}</div>
              <div style={{textAlign:"center",fontFamily:"'IBM Plex Mono'",fontSize:13,color:C.green}}>+${row.profit.toFixed(2)}</div>
              <div style={{textAlign:"center",fontFamily:"'IBM Plex Mono'",fontSize:13,color:C.red}}>-${row.loss.toFixed(2)}</div>
            </div>
          ))}
        </Card>

        <div style={{padding:"9px 12px",background:"rgba(251,191,36,0.06)",border:`1px solid ${C.yellow}25`,borderRadius:8}}>
          <span style={{fontSize:11,color:C.yellow}}>⚠ XAU/USD: 1 pip = $0.10 price move · $0.10/pip (0.01 lot) · $1.00/pip (0.10 lot) · $10.00/pip (1.00 lot). Verify with your broker.</span>
        </div>
      </>)}
    </div>
  );
}

// ─── TAB 3: LOT SIZE GUIDE ───────────────────────────────────────────────────
function MarginCalculator() {
  const [accountBal,setAccountBal] = useState("1000");
  const [leverage,setLeverage] = useState("100");
  const [goldPrice,setGoldPrice] = useState("4550");
  const [riskPct,setRiskPct] = useState("2");
  const leveragePresets=[50,100,200,500];
  const riskPresets=["1","2","3","5"];

  const bal=parseFloat(accountBal)||0;
  const lev=parseFloat(leverage)||100;
  const gp=parseFloat(goldPrice)||4550;
  const rPct=parseFloat(riskPct)/100||0.02;
  const dollarRisk=bal*rPct;
  const contractSize=100;

  const lotSizes=[
    {l:0.01,label:"0.01",name:"Micro"},
    {l:0.02,label:"0.02",name:"Micro"},
    {l:0.05,label:"0.05",name:"Micro"},
    {l:0.10,label:"0.10",name:"Mini"},
    {l:0.20,label:"0.20",name:"Mini"},
    {l:0.50,label:"0.50",name:"Mini"},
    {l:1.00,label:"1.00",name:"Standard"},
  ];

  const rows=lotSizes.map(({l,label,name})=>{
    const margin=(l*contractSize*gp)/lev;
    const marginPct=bal>0?(margin/bal)*100:0;
    const pipVal=l*GOLD_PIP_VAL_STD;
    const safe=marginPct<=5;
    const caution=marginPct>5&&marginPct<=20;
    const color=safe?C.green:caution?C.yellow:C.red;
    const tag=safe?"Safe":caution?"Caution":"Too High";
    // Max pips for SL given dollar risk budget
    const maxSlPips=pipVal>0?dollarRisk/pipVal:0;
    return {l,label,name,margin,marginPct,pipVal,color,tag,safe,maxSlPips};
  });

  const recommended=rows.filter(r=>r.marginPct<=5&&r.marginPct>0).slice(-1)[0];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <InfoBox>
        💡 <strong>Which lot size suits my account?</strong> Enter your balance, current gold price, and your broker's leverage. This guide shows which lot sizes are safe, which need caution, and which are too large.
      </InfoBox>

      <Card glow>
        <SectionTitle>Your Account Details</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <TInput label="Account Balance" value={accountBal} onChange={setAccountBal} prefix="$" placeholder="1000"/>
          <TInput label="Current Gold Price (XAU/USD)" value={goldPrice} onChange={setGoldPrice} placeholder="4550" hint="Enter today's gold price"/>
          <div>
            <Label>How much are you willing to risk per trade?</Label>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              {riskPresets.map(v=>(
                <button key={v} onClick={()=>setRiskPct(v)} style={{
                  flex:1,background:riskPct===v?"rgba(212,175,55,0.15)":"rgba(8,11,16,0.7)",
                  border:`1px solid ${riskPct===v?C.gold+"70":C.border}`,
                  borderRadius:7,color:riskPct===v?C.gold:C.muted,
                  padding:"10px 0",fontSize:12,fontFamily:"'IBM Plex Mono'",fontWeight:700,cursor:"pointer"}}>
                  {v}%
                </button>
              ))}
            </div>
            {bal>0&&riskPct&&(
              <div style={{padding:"8px 12px",background:"rgba(74,222,128,0.06)",border:`1px solid ${C.green}20`,borderRadius:7}}>
                <span style={{fontSize:12,color:C.green}}>Max dollar risk: <strong>${dollarRisk.toFixed(2)}</strong></span>
              </div>
            )}
          </div>
          <div>
            <Label>Your Broker Leverage</Label>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              {leveragePresets.map(v=>(
                <button key={v} onClick={()=>setLeverage(String(v))} style={{
                  flex:1,background:parseFloat(leverage)===v?"rgba(212,175,55,0.15)":"rgba(8,11,16,0.7)",
                  border:`1px solid ${parseFloat(leverage)===v?C.gold+"70":C.border}`,
                  borderRadius:7,color:parseFloat(leverage)===v?C.gold:C.muted,
                  padding:"10px 0",fontSize:12,fontFamily:"'IBM Plex Mono'",fontWeight:600,cursor:"pointer"}}>
                  1:{v}
                </button>
              ))}
            </div>
            <div style={{fontSize:11,color:C.muted}}>Check your broker's platform — common values are 1:100 or 1:200</div>
          </div>
        </div>
      </Card>

      {recommended&&bal>0&&(
        <div style={{background:`linear-gradient(135deg,rgba(74,222,128,0.1),rgba(74,222,128,0.04))`,border:`1px solid ${C.green}40`,borderRadius:14,padding:20,textAlign:"center"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:C.green,marginBottom:6}}>✦ Recommended for your account</div>
          <div style={{fontSize:48,fontWeight:900,fontFamily:"'IBM Plex Mono'",color:C.text,lineHeight:1}}>{recommended.label}</div>
          <div style={{fontSize:14,color:C.muted,marginTop:4}}>lots · uses ${recommended.margin.toFixed(2)} margin · {recommended.marginPct.toFixed(1)}% of your account</div>
          <div style={{marginTop:8,fontSize:13,color:C.muted}}>At this size, 1 pip = <strong style={{color:C.text}}>${recommended.pipVal.toFixed(2)}</strong></div>
        </div>
      )}

      <Card>
        <SectionTitle sub={`$${accountBal||"—"} account · 1:${leverage} leverage`}>Lot Size Guide</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:0,marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>
          {["Lot","Margin","$/pip","Safety"].map(h=>(
            <div key={h} style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",textAlign:h==="Lot"?"left":"center"}}>{h}</div>
          ))}
        </div>
        {rows.map((row,i)=>(
          <div key={row.l} style={{
            display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:0,
            padding:"11px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center",
            background:row===recommended?"rgba(74,222,128,0.04)":"transparent",
          }}>
            <div>
              <div style={{fontSize:14,fontWeight:700,fontFamily:"'IBM Plex Mono'",color:row===recommended?C.green:C.text}}>{row.label}</div>
              <div style={{fontSize:10,color:C.muted}}>{row.name}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'IBM Plex Mono'",fontSize:13,color:C.text}}>{bal>0?"$"+row.margin.toFixed(2):"—"}</div>
              <div style={{fontSize:10,color:row.color}}>{bal>0?row.marginPct.toFixed(1)+"%":"—"}</div>
            </div>
            <div style={{textAlign:"center",fontFamily:"'IBM Plex Mono'",fontSize:13,color:C.gold}}>${row.pipVal.toFixed(2)}</div>
            <div style={{textAlign:"center"}}>
              <span style={{background:row.color+"15",border:`1px solid ${row.color}30`,color:row.color,borderRadius:5,padding:"3px 7px",fontSize:10,fontWeight:700}}>{row.tag}</span>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <SectionTitle sub={`At ${riskPct}% risk ($${dollarRisk.toFixed(2)}) — how wide can your stop loss be?`}>Max Stop Loss Distance Per Lot Size</SectionTitle>
        <div style={{padding:"10px 12px",background:"rgba(96,165,250,0.05)",border:`1px solid ${C.blue}20`,borderRadius:8,marginBottom:14}}>
          <span style={{fontSize:12,color:C.blue,lineHeight:1.6}}>This tells you the maximum number of pips your stop loss can be from your entry — at each lot size — without exceeding your risk budget.</span>
        </div>
        {rows.map(row=>{
          const pct=Math.min((row.maxSlPips/200)*100,100);
          const color=row.maxSlPips>=30?C.green:row.maxSlPips>=15?C.yellow:C.red;
          return (
            <div key={row.l} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontFamily:"'IBM Plex Mono'",fontSize:13,fontWeight:700,color:C.text}}>{row.label} lots</span>
                  <span style={{fontSize:10,color:C.muted}}>{row.name}</span>
                </div>
                <span style={{fontFamily:"'IBM Plex Mono'",fontSize:14,fontWeight:800,color}}>{bal>0?row.maxSlPips.toFixed(0)+" pips":"—"}</span>
              </div>
              <div style={{height:5,background:"rgba(8,11,16,0.8)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color}60,${color})`,borderRadius:99}}/>
              </div>
              {bal>0&&<div style={{fontSize:10,color:C.muted,marginTop:4}}>SL can be up to {row.maxSlPips.toFixed(0)} pips away · ${row.pipVal.toFixed(2)}/pip</div>}
            </div>
          );
        })}
        <div style={{marginTop:10,padding:"9px 12px",background:"rgba(251,191,36,0.06)",border:`1px solid ${C.yellow}25`,borderRadius:8}}>
          <span style={{fontSize:11,color:C.yellow}}>💡 Tip: a wider stop loss = smaller lot size. A tighter stop loss = you can trade slightly larger. Use the Risk Calc tab to get the exact lot size for your specific trade.</span>
        </div>
      </Card>

      <Card>
        <SectionTitle>What does this mean?</SectionTitle>
        {[
          {color:C.green,label:"Safe",desc:"Margin is under 5% of your account. Comfortable and manageable."},
          {color:C.yellow,label:"Caution",desc:"Margin is 5–20% of your account. Fine if your stop loss is tight, but leaves less room for error."},
          {color:C.red,label:"Too High",desc:"Margin exceeds 20% of your account. One bad trade could seriously hurt your balance."},
        ].map(item=>(
          <div key={item.label} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:item.color,flexShrink:0,marginTop:4}}/>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:item.color,marginBottom:3}}>{item.label}</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{item.desc}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── TAB 4: DAILY LOSS LIMIT ─────────────────────────────────────────────────
function DailyLossLimit() {
  const [accountBal,setAccountBal] = useState("1000");
  const [limitPct,setLimitPct] = useState("5");
  const [tradesLost,setTradesLost] = useState([]);
  const [lossInput,setLossInput] = useState("");

  const bal=parseFloat(accountBal)||0;
  const limit=parseFloat(limitPct)/100||0.05;
  const dailyLimit=bal*limit;
  const totalLost=tradesLost.reduce((s,t)=>s+t,0);
  const remaining=dailyLimit-totalLost;
  const usedPct=dailyLimit>0?(totalLost/dailyLimit)*100:0;
  const limitPresets=["3","5","10"];
  const shouldStop=remaining<=0;
  const warningZone=usedPct>=70&&!shouldStop;

  const addLoss=()=>{
    const v=parseFloat(lossInput);
    if(!v||v<=0) return;
    setTradesLost(p=>[...p,v]);
    setLossInput("");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <InfoBox>
        💡 <strong>Why set a daily loss limit?</strong> Continuing to trade after losses leads to emotional decisions. Set a hard limit before you start. When you hit it — the session is over, no exceptions.
      </InfoBox>
      <Card glow>
        <SectionTitle sub="Set it before you trade. Respect it always.">Daily Loss Limit</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <TInput label="Account Balance" value={accountBal} onChange={setAccountBal} prefix="$" placeholder="1000.00"/>
          <div>
            <Label>Daily Loss Limit</Label>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              {limitPresets.map(v=>(
                <button key={v} onClick={()=>setLimitPct(v)} style={{
                  flex:1,background:limitPct===v?"rgba(212,175,55,0.15)":"rgba(8,11,16,0.7)",
                  border:`1px solid ${limitPct===v?C.gold+"70":C.border}`,
                  borderRadius:7,color:limitPct===v?C.gold:C.muted,
                  padding:"10px 0",fontSize:12,fontFamily:"'IBM Plex Mono'",fontWeight:600,cursor:"pointer"}}>
                  {v}%
                </button>
              ))}
            </div>
            <TInput value={limitPct} onChange={setLimitPct} placeholder="5" suffix="%"/>
          </div>
        </div>
      </Card>

      <Card>
        <StatBox label="Maximum Loss Allowed Today" value={`$${dailyLimit.toFixed(2)}`} color={C.gold} accent={C.gold} sub={`${limitPct}% of $${bal.toFixed(2)}`}/>
        <div style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <Label>Used today</Label>
            <span style={{fontSize:12,fontFamily:"'IBM Plex Mono'",color:shouldStop?C.red:warningZone?C.yellow:C.green}}>${totalLost.toFixed(2)} / ${dailyLimit.toFixed(2)}</span>
          </div>
          <div style={{height:12,background:"rgba(8,11,16,0.8)",borderRadius:99,overflow:"hidden",border:`1px solid ${C.border}`}}>
            <div style={{height:"100%",width:`${Math.min(usedPct,100)}%`,background:`linear-gradient(90deg,${C.green},${usedPct>70?C.red:C.yellow})`,borderRadius:99,transition:"width 0.4s"}}/>
          </div>
        </div>
        {shouldStop&&(
          <div style={{marginTop:12,padding:"14px",background:"rgba(248,113,113,0.1)",border:`1px solid ${C.red}40`,borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:800,color:C.red,marginBottom:4}}>🛑 Daily Limit Reached</div>
            <div style={{fontSize:13,color:C.muted}}>Close the charts. Come back tomorrow with a clear head.</div>
          </div>
        )}
        {warningZone&&(
          <div style={{marginTop:12,padding:"12px",background:"rgba(251,191,36,0.08)",border:`1px solid ${C.yellow}30`,borderRadius:10}}>
            <div style={{fontSize:13,fontWeight:700,color:C.yellow}}>⚡ Warning — {usedPct.toFixed(0)}% of your limit used</div>
            <div style={{fontSize:12,color:C.muted,marginTop:4}}>Remaining: <strong style={{color:C.text}}>${remaining.toFixed(2)}</strong> — consider stopping now</div>
          </div>
        )}
        {!shouldStop&&!warningZone&&totalLost>0&&(
          <div style={{marginTop:12}}>
            <StatBox label="Remaining Budget" value={`$${remaining.toFixed(2)}`} color={C.green} accent={C.green} sub="left for today"/>
          </div>
        )}
      </Card>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <SectionTitle>Log a Loss</SectionTitle>
          {tradesLost.length>0&&(
            <button onClick={()=>setTradesLost([])} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,padding:"5px 12px",fontSize:11,cursor:"pointer",fontWeight:700,textTransform:"uppercase"}}>Reset Day</button>
          )}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <div style={{flex:1}}>
            <TInput value={lossInput} onChange={setLossInput} prefix="$" placeholder="Enter loss amount"/>
          </div>
          <button onClick={addLoss} style={{background:"rgba(248,113,113,0.1)",border:`1px solid ${C.red}40`,borderRadius:9,color:C.red,padding:"0 16px",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>+ Add</button>
        </div>
        {tradesLost.length===0?(
          <div style={{textAlign:"center",padding:"16px 0",color:C.muted,fontSize:13}}>No losses logged today ✓</div>
        ):tradesLost.map((loss,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:12,color:C.muted}}>Trade {i+1}</span>
            <span style={{fontFamily:"'IBM Plex Mono'",fontSize:13,color:C.red}}>-${loss.toFixed(2)}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── TAB 5: STRATEGY HEALTH ───────────────────────────────────────────────────
function StrategyHealth() {
  const [winRate,setWinRate] = useState("50");
  const [rr,setRr] = useState("1.5");
  const [riskPct,setRiskPct] = useState("2");
  const [balance,setBalance] = useState("1000");

  const wr=parseFloat(winRate)/100||0;
  const r=parseFloat(rr)||1;
  const risk=parseFloat(riskPct)/100||0.02;
  const bal=parseFloat(balance)||1000;
  const lr=1-wr;
  const expectancy=wr*r-lr;
  const kellyFraction=expectancy>0?(wr-lr/r):0;
  let rorEstimate=0;
  if(expectancy<=0){rorEstimate=100;}
  else{
    const edge=wr*r-(1-wr);
    const variance=wr*r*r+(1-wr);
    const z=(2*edge)/variance;
    rorEstimate=Math.max(0,Math.min(100,Math.exp(-z*0.5)*100));
  }
  const consec5Loss=Math.pow(1-risk,5)*100;
  const consec10Loss=Math.pow(1-risk,10)*100;
  const edgeColor=expectancy>0?C.green:C.red;
  const rorColor=rorEstimate<5?C.green:rorEstimate<20?C.yellow:C.red;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <InfoBox>
        💡 <strong>Is my strategy actually profitable?</strong> Many traders win some trades but still lose money overall. This tool checks if your numbers add up — and whether your account can survive a losing streak.
      </InfoBox>
      <Card glow>
        <SectionTitle sub="Enter your strategy stats">Strategy Health Check</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <TInput label="Win Rate %" value={winRate} onChange={setWinRate} placeholder="50" suffix="%"/>
              <div style={{fontSize:11,color:C.muted,marginTop:4}}>Out of 10 trades, how many do you win?</div>
            </div>
            <div>
              <TInput label="Average reward" value={rr} onChange={setRr} placeholder="1.5" suffix="×"/>
              <div style={{fontSize:11,color:C.muted,marginTop:4}}>e.g. 2 means you make $2 for every $1 risked</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <TInput label="Risk Per Trade %" value={riskPct} onChange={setRiskPct} placeholder="2" suffix="%"/>
            <TInput label="Account Balance" value={balance} onChange={setBalance} prefix="$" placeholder="1000"/>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{padding:"16px",background:expectancy>0?"rgba(74,222,128,0.06)":"rgba(248,113,113,0.06)",border:`1px solid ${edgeColor}25`,borderRadius:10,marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>Your edge per trade</div>
          <div style={{fontSize:28,fontWeight:800,fontFamily:"'IBM Plex Mono'",color:edgeColor}}>{expectancy>=0?"+":""}{(expectancy*100).toFixed(1)}¢</div>
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>per $1 risked</div>
          <div style={{marginTop:8,fontSize:13,fontWeight:700,color:edgeColor}}>{expectancy>0?"✓ Profitable strategy — stay consistent":"✗ Losing strategy — adjust your numbers"}</div>
        </div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.8,padding:"12px",background:"rgba(255,255,255,0.02)",borderRadius:8}}>
          {expectancy>0
            ?`With ${winRate}% wins and ${rr}× average reward, every trade has an expected value of +${(expectancy*100).toFixed(1)}¢ per $1 risked. Stay consistent and the results will follow.`
            :`With ${winRate}% wins and ${rr}× reward, you're losing money on average. Try aiming for at least ${(lr/wr).toFixed(1)}× reward — or improve your win rate above ${(1/(1+r)*100).toFixed(0)}%.`}
        </div>
      </Card>

      <Card>
        <SectionTitle>Account Safety</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <StatBox label="Blow-Up Risk" value={`${rorEstimate.toFixed(1)}%`} color={rorColor} accent={rorColor} sub={rorEstimate<5?"Very safe":rorEstimate<20?"Manageable":"Reduce your risk %"}/>
          <StatBox label="Safe Risk Per Trade" value={`${(kellyFraction*50*100).toFixed(1)}%`} color={C.blue} accent={C.blue} sub="recommended max"/>
        </div>
        <div style={{fontSize:12,color:C.muted,marginBottom:10}}><strong style={{color:C.text}}>What a losing streak does to your account:</strong></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <StatBox label="After 5 losses in a row" value={`$${(bal*consec5Loss/100).toFixed(0)}`} color={C.yellow} accent={C.yellow} sub={`-${(100-consec5Loss).toFixed(1)}% down`}/>
          <StatBox label="After 10 losses in a row" value={`$${(bal*consec10Loss/100).toFixed(0)}`} color={C.red} accent={C.red} sub={`-${(100-consec10Loss).toFixed(1)}% down`}/>
        </div>
      </Card>

      <Card>
        <SectionTitle sub="The minimum win rate your reward ratio requires to be profitable">Win Rate Needed to Break Even</SectionTitle>
        {[[1,"1×"],[1.5,"1.5×"],[2,"2×"],[2.5,"2.5×"],[3,"3×"]].map(([rrVal,label])=>{
          const minWr=(1/(1+rrVal))*100;
          const isYours=Math.abs(rrVal-parseFloat(rr))<0.01;
          const userBeats=parseFloat(winRate)>minWr;
          return (
            <div key={rrVal} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${C.border}`,background:isYours?"rgba(212,175,55,0.04)":"transparent"}}>
              <span style={{width:44,fontSize:12,fontFamily:"'IBM Plex Mono'",color:isYours?C.gold:C.muted,fontWeight:isYours?700:400}}>{label}</span>
              <div style={{flex:1,height:6,background:"rgba(8,11,16,0.8)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${minWr}%`,background:`linear-gradient(90deg,${C.blue}60,${C.blue})`,borderRadius:99}}/>
              </div>
              <span style={{fontFamily:"'IBM Plex Mono'",fontSize:12,color:C.text,width:40,textAlign:"right"}}>{minWr.toFixed(0)}%</span>
              {isYours&&<span style={{fontSize:11,color:userBeats?C.green:C.red}}>{userBeats?"✓":"✗"}</span>}
            </div>
          );
        })}
        <div style={{marginTop:10,fontSize:12,color:C.muted}}>At your reward of {rr}×, you need to win at least <strong style={{color:C.text}}>{(1/(1+parseFloat(rr))*100).toFixed(0)}%</strong> of trades to be profitable.</div>
      </Card>
    </div>
  );
}

// ─── TAB 6: PRE-TRADE CHECKLIST ──────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  {id:"trend",    category:"Analysis",   text:"I've identified the overall direction on a higher timeframe (1H or 4H)", critical:true},
  {id:"level",    category:"Analysis",   text:"My entry is near a key support or resistance level",                     critical:true},
  {id:"confluence",category:"Analysis",  text:"I have at least 2 reasons supporting this trade",                        critical:false},
  {id:"session",  category:"Timing",     text:"I'm trading during London or New York session (gold is most active)",    critical:false},
  {id:"news",     category:"Timing",     text:"No major news release (NFP, CPI, Fed) in the next 30 minutes",           critical:true},
  {id:"sl_defined",category:"Risk",      text:"My stop loss price is set BEFORE I enter the trade",                     critical:true},
  {id:"sl_size",  category:"Risk",       text:"My risk on this trade is 1–2% of my account or less",                   critical:true},
  {id:"lot_calc", category:"Risk",       text:"I've used the Risk Calculator to find my exact lot size",                critical:true},
  {id:"rr",       category:"Risk",       text:"My reward is at least 1.5× my risk",                                    critical:false},
  {id:"revenge",  category:"Mindset",    text:"I am NOT trying to recover money I lost earlier today",                  critical:true},
  {id:"fomo",     category:"Mindset",    text:"I am NOT entering just because I'm scared of missing the move",          critical:true},
  {id:"plan",     category:"Mindset",    text:"I'm okay with this trade hitting my stop loss — I accept the risk",      critical:false},
  {id:"sl_move",  category:"Mindset",    text:"I will NOT move my stop loss to avoid a loss once I'm in the trade",     critical:true},
  {id:"daily_limit",category:"Discipline",text:"I haven't already hit my daily loss limit today",                      critical:true},
  {id:"reason",   category:"Discipline", text:"I can clearly explain why I'm taking this trade in one sentence",        critical:false},
];

function PreTradeChecklist() {
  const [checked,setChecked] = useState({});
  const toggle = id => setChecked(p=>({...p,[id]:!p[id]}));
  const reset = () => setChecked({});
  const criticalItems = CHECKLIST_ITEMS.filter(i=>i.critical);
  const allCritical = criticalItems.every(i=>checked[i.id]);
  const totalChecked = CHECKLIST_ITEMS.filter(i=>checked[i.id]).length;
  const pct = Math.round((totalChecked/CHECKLIST_ITEMS.length)*100);
  const categories = [...new Set(CHECKLIST_ITEMS.map(i=>i.category))];
  const readyColor = allCritical?C.green:pct>50?C.yellow:C.red;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <InfoBox>
        💡 <strong>Use this before every single trade.</strong> Most losing trades come from breaking one of these rules. All critical items must be ticked before you enter.
      </InfoBox>
      <Card glow>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <SectionTitle sub="All critical items must be checked">Pre-Trade Checklist</SectionTitle>
          <button onClick={reset} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,color:C.muted,padding:"6px 12px",fontSize:11,cursor:"pointer",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Reset</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
          <div style={{flex:1,height:8,background:"rgba(8,11,16,0.8)",borderRadius:99,overflow:"hidden",border:`1px solid ${C.border}`}}>
            <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${readyColor}60,${readyColor})`,borderRadius:99,transition:"width 0.3s"}}/>
          </div>
          <span style={{fontSize:14,fontWeight:800,fontFamily:"'IBM Plex Mono'",color:readyColor,whiteSpace:"nowrap"}}>{totalChecked}/{CHECKLIST_ITEMS.length}</span>
        </div>
        <div style={{padding:"12px 14px",borderRadius:9,background:allCritical?"rgba(74,222,128,0.07)":"rgba(248,113,113,0.07)",border:`1px solid ${allCritical?C.green:C.red}25`}}>
          <span style={{fontSize:13,fontWeight:700,color:allCritical?C.green:C.red}}>
            {allCritical?"✓ All critical checks passed — you're clear to trade":`✗ ${criticalItems.filter(i=>!checked[i.id]).length} critical check${criticalItems.filter(i=>!checked[i.id]).length!==1?"s":""} remaining`}
          </span>
        </div>
      </Card>

      {categories.map(cat=>(
        <Card key={cat}>
          <SectionTitle>{cat}</SectionTitle>
          {CHECKLIST_ITEMS.filter(i=>i.category===cat).map(item=>(
            <div key={item.id} onClick={()=>toggle(item.id)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer",opacity:checked[item.id]?0.7:1,transition:"opacity 0.15s"}}>
              <div style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:1,
                background:checked[item.id]?(item.critical?C.green:C.gold):"transparent",
                border:`2px solid ${checked[item.id]?(item.critical?C.green:C.gold):C.muted}`,
                display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",fontSize:11}}>
                {checked[item.id]?"✓":""}
              </div>
              <div style={{flex:1}}>
                <span style={{fontSize:13,color:checked[item.id]?C.muted:C.text,textDecoration:checked[item.id]?"line-through":"none",lineHeight:1.5}}>{item.text}</span>
                {item.critical&&<div style={{marginTop:2}}><Badge color={C.red}>Must check</Badge></div>}
              </div>
            </div>
          ))}
        </Card>
      ))}

      {allCritical&&(
        <div style={{background:"rgba(74,222,128,0.08)",border:`1px solid ${C.green}30`,borderRadius:14,padding:20,textAlign:"center"}}>
          <div style={{fontSize:24,marginBottom:8}}>✦</div>
          <div style={{fontSize:16,fontWeight:800,color:C.green,marginBottom:4}}>Trade Cleared</div>
          <div style={{fontSize:13,color:C.muted}}>You've done your checks. Enter with a clear head, stick to your plan.</div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  {id:"pip",       label:"Pip Value",  icon:"⬡"},
  {id:"risk",      label:"Risk Calc",  icon:"◈"},
  {id:"margin",    label:"Lot Guide",  icon:"▣"},
  {id:"limit",     label:"Loss Limit", icon:"🛑"},
  {id:"health",    label:"Strategy",   icon:"△"},
  {id:"checklist", label:"Checklist",  icon:"✦"},
];

export default function App() {
  const [activeTab,setActiveTab] = useState("pip");
  const renderTab = () => {
    switch(activeTab){
      case "pip":       return <PipCalculator/>;
      case "risk":      return <RiskCalculator/>;
      case "margin":    return <MarginCalculator/>;
      case "limit":     return <DailyLossLimit/>;
      case "health":    return <StrategyHealth/>;
      case "checklist": return <PreTradeChecklist/>;
      default:          return null;
    }
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Syne',sans-serif",color:C.text}}>
      <style>{css}</style>

      {/* Header */}
      <div style={{background:"rgba(10,14,22,0.98)",borderBottom:`1px solid ${C.border}`,padding:"18px 20px 14px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(16px)"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:36,height:36,borderRadius:9,background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.bg,flexShrink:0,letterSpacing:"0.04em"}}>TH</div>
            <div>
              <div style={{fontSize:16,fontWeight:800,letterSpacing:"0.01em",lineHeight:1.1,color:C.gold}}>Tradehouse</div>
              <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>XAU/USD Pro Toolkit</div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:C.green,boxShadow:`0 0 6px ${C.green}`,animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:10,color:C.muted,letterSpacing:"0.1em"}}>LIVE</span>
            </div>
          </div>
          <div style={{display:"flex",gap:2,overflowX:"auto",paddingBottom:2}}>
            {TABS.map(tab=>{
              const active=activeTab===tab.id;
              return (
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                  flex:"0 0 auto",background:active?"rgba(212,175,55,0.12)":"transparent",
                  border:`1px solid ${active?C.gold+"50":"transparent"}`,
                  borderRadius:8,padding:"7px 12px",cursor:"pointer",
                  color:active?C.gold:C.muted,fontFamily:"'Syne'",
                  fontSize:11,fontWeight:700,transition:"all 0.15s",
                  letterSpacing:"0.06em",whiteSpace:"nowrap",
                  display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:10}}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"20px 16px 80px"}}>
        <div className="tab-content" key={activeTab}>{renderTab()}</div>
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${C.border}`,background:"rgba(10,14,22,0.98)",padding:"20px 20px 28px"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <a href="https://t.me/+Kl4N2xiAW2I4ZDI0" target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              background:"rgba(212,175,55,0.08)",border:`1px solid ${C.gold}35`,
              borderRadius:12,padding:"14px 16px",textDecoration:"none",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#229ED9,#1a7faa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>✈</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.2}}>Join the Tradehouse Community</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>Daily setups · Results · Live discussion</div>
              </div>
            </div>
            <div style={{fontSize:18,color:C.gold,flexShrink:0}}>→</div>
          </a>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:22,height:22,borderRadius:5,background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,color:C.bg}}>TH</div>
              <span style={{fontSize:11,fontWeight:700,color:C.goldDim,letterSpacing:"0.08em"}}>TRADEHOUSE</span>
            </div>
            <a href="https://www.instagram.com/thejohnolad?igsh=MXNwc3o5dmZ0Y2VqYQ==" target="_blank" rel="noopener noreferrer"
              style={{fontSize:10,color:C.muted,textDecoration:"none",letterSpacing:"0.08em"}}
              onMouseOver={e=>e.currentTarget.style.color=C.gold}
              onMouseOut={e=>e.currentTarget.style.color=C.muted}>
              @thejohnolad
            </a>
            <span style={{fontSize:10,color:C.muted}}>Educational use only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
