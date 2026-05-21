import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
// XAU/USD pip conventions (confirmed):
//   1 pip = $0.10 price movement  (4550 + 50 pips = 4555.00)
//   Pip values per lot:
//     0.01 lot (micro)   = $0.10 / pip
//     0.10 lot (mini)    = $1.00 / pip
//     1.00 lot (standard)= $10.00 / pip
const GOLD_PIP = 0.10;          // 1 pip = $0.10 price move on XAU/USD
const GOLD_PIP_VAL_STD = 10.00; // $10.00 per pip per standard lot (1.00)

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#080b10;}
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
  input[type=number]{-moz-appearance:textfield;}
  input,select,button{font-family:'Syne',sans-serif;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(212,175,55,0.3);border-radius:99px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
  @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
  .fade-up{animation:fadeUp 0.35s ease both;}
  .tab-content{animation:fadeUp 0.3s ease both;}
`;

const C = {
  gold: "#D4AF37",
  goldLight: "#F0D060",
  goldDim: "#8B7022",
  bg: "#080b10",
  card: "rgba(14,19,28,0.95)",
  border: "rgba(212,175,55,0.15)",
  borderHover: "rgba(212,175,55,0.4)",
  text: "#E8E0CC",
  muted: "#6B6450",
  green: "#4ADE80",
  red: "#F87171",
  blue: "#60A5FA",
  yellow: "#FBBF24",
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 6 }}>
    {children}
  </span>
);

const GoldInput = ({ label, value, onChange, prefix, suffix, placeholder, step = "any", min = "0", readOnly }) => (
  <div>
    {label && <Label>{label}</Label>}
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {prefix && <span style={{ position: "absolute", left: 12, fontSize: 13, fontFamily: "'IBM Plex Mono'", color: C.gold, pointerEvents: "none", zIndex: 1 }}>{prefix}</span>}
      <input
        type="number" value={value} onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder} step={step} min={min} readOnly={readOnly}
        style={{
          width: "100%", background: readOnly ? "rgba(212,175,55,0.04)" : "rgba(8,11,16,0.8)",
          border: `1px solid ${readOnly ? "rgba(212,175,55,0.08)" : C.border}`,
          borderRadius: 8, padding: `11px ${suffix ? "36px" : "12px"} 11px ${prefix ? "28px" : "12px"}`,
          fontSize: 14, fontFamily: "'IBM Plex Mono'", color: readOnly ? C.muted : C.text,
          outline: "none", transition: "border-color 0.2s",
        }}
        onFocus={e => { if (!readOnly) e.target.style.borderColor = C.gold; }}
        onBlur={e => { if (!readOnly) e.target.style.borderColor = C.border; }}
      />
      {suffix && <span style={{ position: "absolute", right: 12, fontSize: 12, fontFamily: "'IBM Plex Mono'", color: C.muted, pointerEvents: "none" }}>{suffix}</span>}
    </div>
  </div>
);

const Card = ({ children, style, glow }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: 20, boxShadow: glow ? `0 0 30px rgba(212,175,55,0.06)` : "none", ...style
  }}>{children}</div>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.gold }}>{children}</div>
    {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{sub}</div>}
  </div>
);

const StatBox = ({ label, value, color = C.text, sub, accent }) => (
  <div style={{
    background: "rgba(8,11,16,0.7)", border: `1px solid ${accent || C.border}`,
    borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${accent || C.goldDim}`,
  }}>
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'IBM Plex Mono'", color }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
  </div>
);

const Divider = () => <div style={{ height: 1, background: C.border, margin: "18px 0" }} />;

const Badge = ({ children, color = C.gold }) => (
  <span style={{
    background: color + "18", border: `1px solid ${color}35`, color, borderRadius: 5,
    padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase"
  }}>{children}</span>
);

function RRBar({ ratio }) {
  const capped = Math.min(ratio, 5);
  const pct = (capped / 5) * 100;
  const color = ratio >= 2 ? C.green : ratio >= 1 ? C.yellow : C.red;
  const label = ratio >= 3 ? "Excellent" : ratio >= 2 ? "Good" : ratio >= 1 ? "Fair" : "Poor";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Label>Risk-to-Reward Ratio</Label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'IBM Plex Mono'", color }}>{ratio.toFixed(2)}R</span>
          <Badge color={color}>{label}</Badge>
        </div>
      </div>
      <div style={{ height: 6, background: "rgba(8,11,16,0.8)", borderRadius: 99, overflow: "hidden", border: `1px solid ${C.border}` }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${color}60,${color})`, borderRadius: 99, transition: "width 0.5s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

// ─── TAB 1: RISK CALCULATOR ───────────────────────────────────────────────────
function RiskCalculator() {
  const [accountBal, setAccountBal] = useState("");
  const [riskPct, setRiskPct] = useState("2");
  const [entryPrice, setEntryPrice] = useState("");
  const [slPipsInput, setSlPipsInput] = useState("");
  const [rrInput, setRrInput] = useState("2");
  const [direction, setDirection] = useState("buy");
  const [r, setR] = useState(null);

  const riskPresets = ["1", "2", "3", "5"];
  const rrPresets = ["1.5", "2", "2.5", "3"];

  useEffect(() => {
    const bal = parseFloat(accountBal);
    const rPct = parseFloat(riskPct) / 100;
    const ep = parseFloat(entryPrice);
    const slPips = parseFloat(slPipsInput);
    const rrRatio = parseFloat(rrInput);
    if (!bal || !rPct || !ep || !slPips || !rrRatio || slPips <= 0 || rrRatio <= 0) { setR(null); return; }

    // Dollar risk = account × risk%
    const dollarRisk = bal * rPct;

    // Suggested lot size: dollarRisk = lots × GOLD_PIP_VAL_STD × slPips
    // lots = dollarRisk / (GOLD_PIP_VAL_STD × slPips)
    const suggestedLots = dollarRisk / (GOLD_PIP_VAL_STD * slPips);

    // TP pips from R:R
    const tpPips = slPips * rrRatio;

    // Price levels
    const slPrice = direction === "buy" ? ep - slPips * GOLD_PIP : ep + slPips * GOLD_PIP;
    const tpPrice = direction === "buy" ? ep + tpPips * GOLD_PIP : ep - tpPips * GOLD_PIP;

    // Dollar profit at suggested lots
    const dollarProfit = suggestedLots * GOLD_PIP_VAL_STD * tpPips;

    // Lot table
    const lots = [1, 0.1, 0.01];
    const lotRows = lots.map(l => ({
      l,
      profit: l * GOLD_PIP_VAL_STD * tpPips,
      loss:   l * GOLD_PIP_VAL_STD * slPips,
      pipPerLot: l * GOLD_PIP_VAL_STD,
    }));

    setR({
      slPrice: slPrice.toFixed(2), tpPrice: tpPrice.toFixed(2),
      slPips: slPips.toFixed(1), tpPips: tpPips.toFixed(1),
      rrRatio, dollarRisk, dollarProfit, suggestedLots, lotRows, bal,
    });
  }, [accountBal, riskPct, entryPrice, slPipsInput, rrInput, direction]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card glow>
        <SectionTitle sub="XAU/USD · Gold">Trade Setup</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <GoldInput label="Account Balance" value={accountBal} onChange={setAccountBal} prefix="$" placeholder="1000.00" />
          <div>
            <Label>Risk Per Trade %</Label>
            <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
              {riskPresets.map(v => (
                <button key={v} onClick={() => setRiskPct(v)} style={{
                  flex: 1, background: riskPct === v ? "rgba(212,175,55,0.15)" : "rgba(8,11,16,0.7)",
                  border: `1px solid ${riskPct === v ? C.gold + "70" : C.border}`,
                  borderRadius: 6, color: riskPct === v ? C.gold : C.muted,
                  padding: "6px 0", fontSize: 11, fontFamily: "'IBM Plex Mono'", fontWeight: 700, cursor: "pointer",
                }}>{v}%</button>
              ))}
            </div>
            <GoldInput value={riskPct} onChange={setRiskPct} placeholder="2" suffix="%" step="0.5" />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <GoldInput label="Entry Price (XAU/USD)" value={entryPrice} onChange={setEntryPrice} placeholder="4550.00" step="0.1" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <GoldInput label="Stop Loss Distance (pips)" value={slPipsInput} onChange={setSlPipsInput} placeholder="30" suffix="pips" step="1" />
          <div>
            <Label>Risk : Reward</Label>
            <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
              {rrPresets.map(v => (
                <button key={v} onClick={() => setRrInput(v)} style={{
                  flex: 1, background: rrInput === v ? "rgba(212,175,55,0.15)" : "rgba(8,11,16,0.7)",
                  border: `1px solid ${rrInput === v ? C.gold + "70" : C.border}`,
                  borderRadius: 6, color: rrInput === v ? C.gold : C.muted,
                  padding: "6px 0", fontSize: 11, fontFamily: "'IBM Plex Mono'", fontWeight: 700, cursor: "pointer",
                }}>{v}R</button>
              ))}
            </div>
            <GoldInput value={rrInput} onChange={setRrInput} placeholder="2" suffix="R" step="0.5" />
          </div>
        </div>
        <div>
          <Label>Direction</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["buy", "sell"].map(d => (
              <button key={d} onClick={() => setDirection(d)} style={{
                background: direction === d ? (d === "buy" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)") : "rgba(8,11,16,0.6)",
                border: `1px solid ${direction === d ? (d === "buy" ? C.green : C.red) + "60" : C.border}`,
                borderRadius: 9, color: direction === d ? (d === "buy" ? C.green : C.red) : C.muted,
                padding: "11px", fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all 0.15s",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                {d === "buy" ? "▲ Buy / Long" : "▼ Sell / Short"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {!r && (
        <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>◈</div>
          <div style={{ fontSize: 13 }}>Enter your trade details to see results</div>
        </div>
      )}

      {r && (<>
        <Card>
          <SectionTitle>Price Levels</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            <StatBox label="Stop Loss" value={r.slPrice} sub={`${r.slPips} pips`} accent={C.red} color={C.red} />
            <StatBox label="Entry" value={entryPrice} sub={`${direction.toUpperCase()}`} accent={C.gold} color={C.goldLight} />
            <StatBox label="Take Profit" value={r.tpPrice} sub={`${r.tpPips} pips`} accent={C.green} color={C.green} />
          </div>
          {[
            { label: "TP", price: r.tpPrice, color: C.green, pip: r.tpPips },
            { label: "ENTRY", price: entryPrice, color: C.gold, pip: null },
            { label: "SL", price: r.slPrice, color: C.red, pip: r.slPips },
          ].sort((a, b) => parseFloat(b.price) - parseFloat(a.price)).map((row, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < arr.length - 1 ? `1px dashed ${C.border}` : "none" }}>
              <span style={{ width: 44, fontSize: 10, fontWeight: 800, color: row.color, letterSpacing: "0.1em", textAlign: "right" }}>{row.label}</span>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: row.color, flexShrink: 0, boxShadow: `0 0 8px ${row.color}80` }} />
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 14, color: C.text, fontWeight: 600 }}>{row.price}</span>
              {row.pip && <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>{row.pip} pips</span>}
            </div>
          ))}
        </Card>

        <Card>
          <RRBar ratio={r.rrRatio} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
            <StatBox label="Profit Target" value={`$${r.dollarProfit.toFixed(2)}`} color={C.green} accent={C.green} />
            <StatBox label="Max Risk" value={`$${r.dollarRisk.toFixed(2)}`} color={C.red} accent={C.red} />
          </div>
        </Card>

        <Card>
          <SectionTitle sub="Same pip distance, different position sizes">P&L by Lot Size</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0, marginBottom: 8 }}>
            {["Lot", "$/pip", "Profit", "Loss"].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 0", textAlign: h === "Lot" ? "left" : "center" }}>{h}</div>
            ))}
          </div>
          {r.lotRows.map(row => (
            <div key={row.l} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0, padding: "10px 0", borderTop: `1px solid ${C.border}`, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Mono'", color: C.text }}>{row.l.toFixed(2)}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{row.l === 1 ? "Standard" : row.l === 0.1 ? "Mini" : "Micro"}</div>
              </div>
              <div style={{ textAlign: "center", fontFamily: "'IBM Plex Mono'", fontSize: 13, color: C.gold }}>${row.pipPerLot.toFixed(2)}</div>
              <div style={{ textAlign: "center", fontFamily: "'IBM Plex Mono'", fontSize: 13, color: C.green }}>+${row.profit.toFixed(2)}</div>
              <div style={{ textAlign: "center", fontFamily: "'IBM Plex Mono'", fontSize: 13, color: C.red }}>-${row.loss.toFixed(2)}</div>
            </div>
          ))}
        </Card>

        <div style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.07), rgba(212,175,55,0.03))`,
          border: `1px solid ${C.gold}35`, borderRadius: 14, padding: 20,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>✦ Suggested Position Size</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{ fontSize: 38, fontWeight: 800, fontFamily: "'IBM Plex Mono'", color: C.text, lineHeight: 1 }}>{r.suggestedLots.toFixed(2)}</span>
            <span style={{ fontSize: 16, color: C.muted }}>lots</span>
            <Badge>XAU/USD</Badge>
            <Badge color={direction === "buy" ? C.green : C.red}>{direction.toUpperCase()}</Badge>
          </div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
            At <strong style={{ color: C.text }}>{r.suggestedLots.toFixed(2)} lots</strong>, a {r.slPips}-pip stop = <strong style={{ color: C.red }}>-${r.dollarRisk.toFixed(2)}</strong> ({riskPct}% of ${parseFloat(accountBal).toFixed(2)}). Your {r.tpPips}-pip target = <strong style={{ color: C.green }}>+${r.dollarProfit.toFixed(2)}</strong>.
          </p>
          <div style={{ marginTop: 10, padding: "9px 12px", background: "rgba(251,191,36,0.06)", border: `1px solid ${C.yellow}25`, borderRadius: 7 }}>
            <span style={{ fontSize: 11, color: C.yellow }}>⚠ XAU/USD: 1 pip = $0.10 price move. Pip values: $0.10/pip (0.01 lot) · $1.00/pip (0.10 lot) · $10.00/pip (1.00 lot). Verify with your broker.</span>
          </div>
        </div>
      </>)}
    </div>
  );
}

// ─── TAB 2: PIP VALUE CALCULATOR ─────────────────────────────────────────────
function PipCalculator() {
  const [lots, setLots] = useState("0.10");
  const [pips, setPips] = useState("50");
  const [accountBal, setAccountBal] = useState("1000");

  const l = parseFloat(lots) || 0;
  const p = parseFloat(pips) || 0;
  const bal = parseFloat(accountBal) || 0;

  const pipValPerLot = GOLD_PIP_VAL_STD;
  const pipValThisLot = pipValPerLot * l;
  const totalPnl = pipValThisLot * p;
  const pctOfAccount = bal > 0 ? (totalPnl / bal) * 100 : 0;

  const presets = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card glow>
        <SectionTitle sub="XAU/USD · Gold — $1.00 per pip per standard lot">Pip Value Calculator</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <Label>Lot Size</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {presets.map(v => (
                <button key={v} onClick={() => setLots(String(v))} style={{
                  background: parseFloat(lots) === v ? "rgba(212,175,55,0.15)" : "rgba(8,11,16,0.7)",
                  border: `1px solid ${parseFloat(lots) === v ? C.gold + "70" : C.border}`,
                  borderRadius: 7, color: parseFloat(lots) === v ? C.gold : C.muted,
                  padding: "6px 12px", fontSize: 12, fontFamily: "'IBM Plex Mono'", fontWeight: 600, cursor: "pointer",
                }}>{v}</button>
              ))}
            </div>
            <GoldInput value={lots} onChange={setLots} placeholder="0.10" step="0.01" suffix="lots" />
          </div>
          <GoldInput label="Number of Pips" value={pips} onChange={setPips} placeholder="50" suffix="pips" />
          <GoldInput label="Account Balance (for % calc)" value={accountBal} onChange={setAccountBal} prefix="$" placeholder="1000.00" />
        </div>
      </Card>

      <Card>
        <SectionTitle>Results</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <StatBox label="Pip Value (this lot)" value={`$${pipValThisLot.toFixed(3)}`} color={C.gold} accent={C.gold} sub="per single pip" />
          <StatBox label="Total P&L" value={`$${totalPnl.toFixed(2)}`} color={totalPnl >= 0 ? C.green : C.red} accent={totalPnl >= 0 ? C.green : C.red} sub={`for ${p} pips`} />
        </div>
        {bal > 0 && (
          <StatBox label="% of Account Balance" value={`${pctOfAccount.toFixed(2)}%`} color={Math.abs(pctOfAccount) > 5 ? C.red : C.green} accent={Math.abs(pctOfAccount) > 5 ? C.red : C.green} sub={`of $${bal.toFixed(2)} balance`} />
        )}
        <Divider />
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
          <div style={{ marginBottom: 6, color: C.text, fontWeight: 700 }}>XAU/USD Pip Reference</div>
          {[["0.01 (Micro)", "$0.10"], ["0.10 (Mini)", "$1.00"], ["0.50", "$5.00"], ["1.00 (Standard)", "$10.00"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}` }}>
              <span>{l} lots</span>
              <span style={{ fontFamily: "'IBM Plex Mono'", color: C.gold }}>{v}/pip</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle sub="What does a move in gold mean for my account?">Quick Pip Scenarios</SectionTitle>
        {[10, 25, 50, 100, 200].map(pipCount => {
          const val = pipValThisLot * pipCount;
          const pct = bal > 0 ? (val / bal * 100).toFixed(2) : "—";
          return (
            <div key={pipCount} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, color: C.muted }}>{pipCount} pips</span>
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13, color: C.green }}>+${val.toFixed(2)}</span>
                <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13, color: C.red }}>-${val.toFixed(2)}</span>
                {bal > 0 && <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: C.muted }}>{pct}%</span>}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ─── TAB 3: MARGIN CALCULATOR ─────────────────────────────────────────────────
function MarginCalculator() {
  const [accountBal, setAccountBal] = useState("1000");
  const [leverage, setLeverage] = useState("100");
  const [lots, setLots] = useState("0.10");
  const [goldPrice, setGoldPrice] = useState("2350.00");

  const bal = parseFloat(accountBal) || 0;
  const lev = parseFloat(leverage) || 1;
  const l = parseFloat(lots) || 0;
  const gp = parseFloat(goldPrice) || 0;

  // 1 standard lot XAU/USD = 100 troy oz
  const contractSize = 100;
  const positionValue = l * contractSize * gp;
  const requiredMargin = positionValue / lev;
  const freeMargin = bal - requiredMargin;
  const marginLevel = requiredMargin > 0 ? (bal / requiredMargin) * 100 : 0;
  const marginUsedPct = bal > 0 ? (requiredMargin / bal) * 100 : 0;
  const maxLots = bal > 0 && gp > 0 ? (bal * lev) / (contractSize * gp) : 0;

  const leveragePresets = [50, 100, 200, 500];
  const marginColor = marginLevel > 200 ? C.green : marginLevel > 100 ? C.yellow : C.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card glow>
        <SectionTitle sub="How much margin does your trade lock up?">Margin Calculator</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <GoldInput label="Account Balance" value={accountBal} onChange={setAccountBal} prefix="$" placeholder="1000.00" />
          <div>
            <Label>Leverage</Label>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {leveragePresets.map(v => (
                <button key={v} onClick={() => setLeverage(String(v))} style={{
                  flex: 1, background: parseFloat(leverage) === v ? "rgba(212,175,55,0.15)" : "rgba(8,11,16,0.7)",
                  border: `1px solid ${parseFloat(leverage) === v ? C.gold + "70" : C.border}`,
                  borderRadius: 7, color: parseFloat(leverage) === v ? C.gold : C.muted,
                  padding: "7px 0", fontSize: 12, fontFamily: "'IBM Plex Mono'", fontWeight: 600, cursor: "pointer",
                }}>1:{v}</button>
              ))}
            </div>
            <GoldInput value={leverage} onChange={setLeverage} placeholder="100" prefix="1:" step="1" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <GoldInput label="Lot Size" value={lots} onChange={setLots} placeholder="0.10" step="0.01" suffix="lots" />
            <GoldInput label="Gold Price (XAU/USD)" value={goldPrice} onChange={setGoldPrice} placeholder="2350.00" step="0.01" />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Margin Breakdown</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <StatBox label="Position Value" value={`$${positionValue.toFixed(2)}`} color={C.blue} accent={C.blue} sub={`${l} lots × 100oz × $${gp}`} />
          <StatBox label="Required Margin" value={`$${requiredMargin.toFixed(2)}`} color={C.gold} accent={C.gold} sub={`at 1:${lev} leverage`} />
          <StatBox label="Free Margin" value={`$${freeMargin.toFixed(2)}`} color={freeMargin >= 0 ? C.green : C.red} accent={freeMargin >= 0 ? C.green : C.red} />
          <StatBox label="Margin Level" value={`${marginLevel.toFixed(0)}%`} color={marginColor} accent={marginColor} sub={marginLevel > 200 ? "Safe" : marginLevel > 100 ? "Caution" : "Danger"} />
        </div>
        <div style={{ marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <Label>Margin Used</Label>
            <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono'", color: marginUsedPct > 30 ? C.red : C.green }}>{marginUsedPct.toFixed(1)}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(8,11,16,0.8)", borderRadius: 99, overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div style={{ height: "100%", width: `${Math.min(marginUsedPct, 100)}%`, background: `linear-gradient(90deg,${C.green}80,${marginUsedPct > 50 ? C.red : C.green})`, borderRadius: 99, transition: "width 0.4s" }} />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle sub="Maximum tradable at your current balance & leverage">Max Position Capacity</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[{ label: "Max Lots", value: maxLots.toFixed(2), sub: "total capacity" }, { label: "Recommended", value: (maxLots * 0.1).toFixed(2), sub: "10% of capacity" }, { label: "Conservative", value: (maxLots * 0.05).toFixed(2), sub: "5% of capacity" }].map(s => (
            <StatBox key={s.label} label={s.label} value={s.value} sub={s.sub} accent={C.goldDim} />
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(248,113,113,0.05)", border: `1px solid ${C.red}20`, borderRadius: 8 }}>
          <span style={{ fontSize: 11, color: C.red }}>⚠ Never use max capacity. For $500–$5k accounts, risk no more than 1–2% per trade. Margin calls can wipe accounts in minutes during volatility.</span>
        </div>
      </Card>
    </div>
  );
}

// ─── TAB 4: TRADE JOURNAL ─────────────────────────────────────────────────────
function TradeJournal() {
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState({ date: "", direction: "buy", entry: "", exit: "", lots: "", pnl: "", notes: "" });
  const [showForm, setShowForm] = useState(false);

  const addTrade = () => {
    const pnl = parseFloat(form.pnl);
    if (!form.entry || isNaN(pnl)) return;
    setTrades(prev => [{
      ...form, id: Date.now(), pnl, entry: parseFloat(form.entry),
      exit: parseFloat(form.exit), lots: parseFloat(form.lots),
      date: form.date || new Date().toLocaleDateString(),
    }, ...prev]);
    setForm({ date: "", direction: "buy", entry: "", exit: "", lots: "", pnl: "", notes: "" });
    setShowForm(false);
  };

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {trades.length > 0 && (
        <Card glow>
          <SectionTitle>Session Stats</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <StatBox label="Total P&L" value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`} color={totalPnl >= 0 ? C.green : C.red} accent={totalPnl >= 0 ? C.green : C.red} />
            <StatBox label="Win Rate" value={`${winRate.toFixed(0)}%`} color={winRate >= 50 ? C.green : C.red} accent={winRate >= 50 ? C.green : C.red} sub={`${wins.length}W / ${losses.length}L`} />
            <StatBox label="Avg Win" value={`+$${avgWin.toFixed(2)}`} color={C.green} accent={C.green} />
            <StatBox label="Avg Loss" value={`-$${avgLoss.toFixed(2)}`} color={C.red} accent={C.red} />
          </div>
          {avgLoss > 0 && <StatBox label="Avg R:R (actual)" value={`${(avgWin / avgLoss).toFixed(2)}R`} color={avgWin / avgLoss >= 1 ? C.green : C.red} accent={C.goldDim} />}
        </Card>
      )}

      <button onClick={() => setShowForm(!showForm)} style={{
        background: showForm ? "rgba(8,11,16,0.8)" : `rgba(212,175,55,0.1)`,
        border: `1px solid ${showForm ? C.border : C.gold + "50"}`,
        borderRadius: 10, padding: "13px", color: showForm ? C.muted : C.gold,
        fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em",
        textTransform: "uppercase", transition: "all 0.15s",
      }}>
        {showForm ? "✕ Cancel" : "+ Log New Trade"}
      </button>

      {showForm && (
        <Card>
          <SectionTitle>New Trade Entry</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Date</Label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={{ width: "100%", background: "rgba(8,11,16,0.8)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 12px", fontSize: 13, fontFamily: "'IBM Plex Mono'", color: C.text, outline: "none" }} />
              </div>
              <div>
                <Label>Direction</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {["buy", "sell"].map(d => (
                    <button key={d} onClick={() => setForm(p => ({ ...p, direction: d }))} style={{
                      background: form.direction === d ? (d === "buy" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)") : "rgba(8,11,16,0.6)",
                      border: `1px solid ${form.direction === d ? (d === "buy" ? C.green : C.red) + "50" : C.border}`,
                      borderRadius: 7, color: form.direction === d ? (d === "buy" ? C.green : C.red) : C.muted,
                      padding: "11px 0", fontSize: 11, fontWeight: 800, cursor: "pointer", textTransform: "uppercase",
                    }}>{d === "buy" ? "▲ Buy" : "▼ Sell"}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <GoldInput label="Entry Price" value={form.entry} onChange={v => setForm(p => ({ ...p, entry: v }))} placeholder="2350.00" step="0.01" />
              <GoldInput label="Exit Price" value={form.exit} onChange={v => setForm(p => ({ ...p, exit: v }))} placeholder="2380.00" step="0.01" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <GoldInput label="Lot Size" value={form.lots} onChange={v => setForm(p => ({ ...p, lots: v }))} placeholder="0.10" step="0.01" suffix="lots" />
              <GoldInput label="P&L Result" value={form.pnl} onChange={v => setForm(p => ({ ...p, pnl: v }))} prefix="$" placeholder="30.00 or -20.00" />
            </div>
            <div>
              <Label>Notes / Reason for trade</Label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Setup, confluences, emotion, lesson learned..."
                style={{ width: "100%", background: "rgba(8,11,16,0.8)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 12px", fontSize: 13, fontFamily: "'Syne'", color: C.text, outline: "none", resize: "vertical", minHeight: 70, lineHeight: 1.6 }} />
            </div>
            <button onClick={addTrade} style={{
              background: "rgba(212,175,55,0.12)", border: `1px solid ${C.gold}50`,
              borderRadius: 9, color: C.gold, padding: "13px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase",
            }}>Save Trade ✦</button>
          </div>
        </Card>
      )}

      {trades.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📒</div>
          <div style={{ fontSize: 14, marginBottom: 4 }}>No trades logged yet</div>
          <div style={{ fontSize: 12 }}>Track every trade to identify patterns and improve</div>
        </div>
      )}

      {trades.map(t => (
        <div key={t.id} style={{
          background: C.card, border: `1px solid ${t.pnl >= 0 ? C.green : C.red}25`,
          borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${t.pnl >= 0 ? C.green : C.red}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge color={t.direction === "buy" ? C.green : C.red}>{t.direction}</Badge>
              <span style={{ fontSize: 11, color: C.muted }}>{t.date}</span>
              {t.lots && <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono'", color: C.muted }}>{t.lots} lots</span>}
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'IBM Plex Mono'", color: t.pnl >= 0 ? C.green : C.red }}>
              {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
            </span>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, fontFamily: "'IBM Plex Mono'", color: C.muted }}>
            {t.entry > 0 && <span>Entry: <span style={{ color: C.text }}>{t.entry.toFixed(2)}</span></span>}
            {t.exit > 0 && <span>Exit: <span style={{ color: t.pnl >= 0 ? C.green : C.red }}>{t.exit.toFixed(2)}</span></span>}
          </div>
          {t.notes && <div style={{ marginTop: 8, fontSize: 12, color: C.muted, lineHeight: 1.5, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>{t.notes}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── TAB 5: RISK OF RUIN ─────────────────────────────────────────────────────
function RiskOfRuin() {
  const [winRate, setWinRate] = useState("50");
  const [rr, setRr] = useState("1.5");
  const [riskPct, setRiskPct] = useState("2");
  const [balance, setBalance] = useState("1000");
  const [ruinPct, setRuinPct] = useState("50");

  const wr = parseFloat(winRate) / 100 || 0;
  const r = parseFloat(rr) || 1;
  const risk = parseFloat(riskPct) / 100 || 0.02;
  const bal = parseFloat(balance) || 1000;
  const ruinThreshold = parseFloat(ruinPct) / 100 || 0.5;

  const lr = 1 - wr;
  const expectancy = wr * r - lr;
  const kellyFraction = expectancy > 0 ? (wr - lr / r) : 0;

  // Monte Carlo approximation for risk of ruin
  let rorEstimate = 0;
  if (expectancy <= 0) {
    rorEstimate = 100;
  } else {
    const q = 1 - wr;
    const edge = wr * r - q;
    const variance = wr * r * r + q;
    const z = (2 * edge) / variance;
    rorEstimate = Math.max(0, Math.min(100, Math.exp(-z * (ruinThreshold * bal / (risk * bal))) * 100));
  }

  const consecutiveLossesFor20Pct = Math.ceil(Math.log(0.8) / Math.log(1 - risk));
  const maxConsecLosses50Pct = Math.floor(Math.log(0.5) / Math.log(1 - risk));

  const expectancyColor = expectancy > 0 ? C.green : C.red;
  const rorColor = rorEstimate < 5 ? C.green : rorEstimate < 20 ? C.yellow : C.red;

  const scenarios = [1, 2, 3, 5, 10];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card glow>
        <SectionTitle sub="How likely is your strategy to blow up your account?">Risk of Ruin Calculator</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <GoldInput label="Win Rate %" value={winRate} onChange={setWinRate} placeholder="50" suffix="%" max="100" />
            <GoldInput label="Avg Risk:Reward" value={rr} onChange={setRr} placeholder="1.5" step="0.1" suffix="R" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <GoldInput label="Risk Per Trade %" value={riskPct} onChange={setRiskPct} placeholder="2" suffix="%" step="0.5" />
            <GoldInput label="Account Balance" value={balance} onChange={setBalance} prefix="$" placeholder="1000" />
          </div>
          <GoldInput label="Ruin Threshold (% drawdown = 'blown')" value={ruinPct} onChange={setRuinPct} placeholder="50" suffix="%" />
        </div>
      </Card>

      <Card>
        <SectionTitle>Strategy Assessment</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <StatBox label="Expectancy per R" value={`${expectancy >= 0 ? "+" : ""}${expectancy.toFixed(3)}R`} color={expectancyColor} accent={expectancyColor} sub={expectancy > 0 ? "Positive edge ✓" : "Negative edge ✗"} />
          <StatBox label="Risk of Ruin" value={`${rorEstimate.toFixed(1)}%`} color={rorColor} accent={rorColor} sub={rorEstimate < 5 ? "Very safe" : rorEstimate < 20 ? "Manageable" : "High risk"} />
          <StatBox label="Kelly Criterion" value={`${(kellyFraction * 100).toFixed(1)}%`} color={C.blue} accent={C.blue} sub="optimal risk per trade" />
          <StatBox label="Half-Kelly" value={`${(kellyFraction * 50).toFixed(1)}%`} color={C.gold} accent={C.gold} sub="safer Kelly sizing" />
        </div>
        <div style={{ padding: "10px 12px", background: "rgba(212,175,55,0.05)", border: `1px solid ${C.gold}20`, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: C.text, fontWeight: 700, marginBottom: 4 }}>📊 What this means:</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
            {expectancy > 0
              ? `Your strategy has a positive edge of ${(expectancy * 100).toFixed(1)}¢ per $1 risked. Keep consistent and let the math work.`
              : "Your current setup has a negative expectancy. Increase win rate, improve R:R, or reduce risk per trade."}
            {" "}Risking {riskPct}% per trade with this strategy, your risk of losing {ruinPct}% of your account is approximately <strong style={{ color: rorColor }}>{rorEstimate.toFixed(1)}%</strong>.
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle sub="How much do you lose on a losing streak?">Consecutive Loss Impact</SectionTitle>
        {scenarios.map(n => {
          const remaining = Math.pow(1 - risk, n) * 100;
          const lost = 100 - remaining;
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ width: 80, fontSize: 12, color: C.muted }}>{n} loss{n > 1 ? "es" : ""}</span>
              <div style={{ flex: 1, height: 6, background: "rgba(8,11,16,0.8)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${lost}%`, background: `linear-gradient(90deg, ${C.yellow}80, ${C.red})`, borderRadius: 99 }} />
              </div>
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, color: C.red, width: 52, textAlign: "right" }}>-{lost.toFixed(1)}%</span>
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, color: C.text, width: 60, textAlign: "right" }}>${(bal * remaining / 100).toFixed(0)}</span>
            </div>
          );
        })}
        <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>
          At {riskPct}% risk/trade, it takes <strong style={{ color: C.text }}>{consecutiveLossesFor20Pct} consecutive losses</strong> to lose 20% of your account. <strong style={{ color: C.text }}>{maxConsecLosses50Pct} losses</strong> = 50% drawdown.
        </div>
      </Card>
    </div>
  );
}

// ─── TAB 6: PRE-TRADE CHECKLIST ───────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  { id: "trend", category: "Analysis", text: "I've identified the higher timeframe trend", critical: true },
  { id: "level", category: "Analysis", text: "My entry is near a key support / resistance level", critical: true },
  { id: "confluence", category: "Analysis", text: "I have at least 2 confluences for this setup", critical: false },
  { id: "session", category: "Timing", text: "This is during London or New York session (peak gold volatility)", critical: false },
  { id: "news", category: "Timing", text: "No major news (NFP, CPI, Fed) within the next 30 minutes", critical: true },
  { id: "sl_defined", category: "Risk", text: "My stop loss is defined BEFORE entering", critical: true },
  { id: "sl_size", category: "Risk", text: "My risk on this trade is 1–2% of my account or less", critical: true },
  { id: "lot_calc", category: "Risk", text: "I've calculated my exact lot size using the Risk Calculator", critical: true },
  { id: "rr", category: "Risk", text: "My R:R is at least 1:1.5 (preferably 1:2 or better)", critical: false },
  { id: "revenge", category: "Psychology", text: "I am NOT trading to recover a previous loss (revenge trading)", critical: true },
  { id: "fomo", category: "Psychology", text: "I am NOT entering because I fear missing out (FOMO)", critical: true },
  { id: "plan", category: "Psychology", text: "I would be at peace if this trade hits my stop loss", critical: false },
  { id: "screen_time", category: "Psychology", text: "I will not move my stop loss once the trade is live", critical: true },
  { id: "journal", category: "Discipline", text: "I have a reason for this trade I can write in my journal", critical: false },
  { id: "max_trades", category: "Discipline", text: "I haven't already hit my daily loss limit today", critical: true },
];

function PreTradeChecklist() {
  const [checked, setChecked] = useState({});
  const [tradeCleared, setTradeCleared] = useState(false);

  const toggle = id => setChecked(p => ({ ...p, [id]: !p[id] }));
  const reset = () => { setChecked({}); setTradeCleared(false); };

  const criticalItems = CHECKLIST_ITEMS.filter(i => i.critical);
  const allCritical = criticalItems.every(i => checked[i.id]);
  const totalChecked = CHECKLIST_ITEMS.filter(i => checked[i.id]).length;
  const pct = Math.round((totalChecked / CHECKLIST_ITEMS.length) * 100);
  const categories = [...new Set(CHECKLIST_ITEMS.map(i => i.category))];
  const readyColor = allCritical ? C.green : pct > 50 ? C.yellow : C.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card glow>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <SectionTitle sub="Complete before every single trade">Pre-Trade Checklist</SectionTitle>
          <button onClick={reset} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.muted, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Reset</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 8, background: "rgba(8,11,16,0.8)", borderRadius: 99, overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${readyColor}60,${readyColor})`, borderRadius: 99, transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'IBM Plex Mono'", color: readyColor, whiteSpace: "nowrap" }}>{totalChecked}/{CHECKLIST_ITEMS.length}</span>
        </div>
        <div style={{
          padding: "12px 14px", borderRadius: 9,
          background: allCritical ? "rgba(74,222,128,0.07)" : "rgba(248,113,113,0.07)",
          border: `1px solid ${allCritical ? C.green : C.red}25`,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: allCritical ? C.green : C.red }}>
            {allCritical ? "✓ All critical checks passed — trade is cleared" : `✗ ${criticalItems.filter(i => !checked[i.id]).length} critical item${criticalItems.filter(i => !checked[i.id]).length !== 1 ? "s" : ""} remaining`}
          </span>
        </div>
      </Card>

      {categories.map(cat => (
        <Card key={cat}>
          <SectionTitle>{cat}</SectionTitle>
          {CHECKLIST_ITEMS.filter(i => i.category === cat).map(item => (
            <div key={item.id} onClick={() => toggle(item.id)} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0",
              borderBottom: `1px solid ${C.border}`, cursor: "pointer",
              opacity: checked[item.id] ? 0.7 : 1, transition: "opacity 0.15s",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                background: checked[item.id] ? (item.critical ? C.green : C.gold) : "transparent",
                border: `2px solid ${checked[item.id] ? (item.critical ? C.green : C.gold) : C.muted}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", fontSize: 11,
              }}>{checked[item.id] ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, color: checked[item.id] ? C.muted : C.text, textDecoration: checked[item.id] ? "line-through" : "none", lineHeight: 1.5 }}>{item.text}</span>
                {item.critical && <div style={{ marginTop: 2 }}><Badge color={C.red}>Critical</Badge></div>}
              </div>
            </div>
          ))}
        </Card>
      ))}

      {allCritical && (
        <div style={{ background: "rgba(74,222,128,0.08)", border: `1px solid ${C.green}30`, borderRadius: 14, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✦</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.green, marginBottom: 4 }}>Trade Cleared</div>
          <div style={{ fontSize: 13, color: C.muted }}>You've completed all critical checks. Execute your plan with discipline and trust your analysis.</div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "risk", label: "Risk Calc", icon: "◈" },
  { id: "pip", label: "Pip Value", icon: "⬡" },
  { id: "margin", label: "Margin", icon: "▣" },
  { id: "journal", label: "Journal", icon: "◎" },
  { id: "ruin", label: "Risk/Ruin", icon: "△" },
  { id: "checklist", label: "Checklist", icon: "✦" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("risk");

  const renderTab = () => {
    switch (activeTab) {
      case "risk": return <RiskCalculator />;
      case "pip": return <PipCalculator />;
      case "margin": return <MarginCalculator />;
      case "journal": return <TradeJournal />;
      case "ruin": return <RiskOfRuin />;
      case "checklist": return <PreTradeChecklist />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Syne', sans-serif", color: C.text }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{
        background: "rgba(10,14,22,0.98)", borderBottom: `1px solid ${C.border}`,
        padding: "18px 20px 14px", position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(16px)",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: C.bg, flexShrink: 0,
            }}>Au</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.1 }}>XAU/USD Pro Toolkit</div>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Gold Trading Platform</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
              <span style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>LIVE</span>
            </div>
          </div>

          {/* Tab Bar */}
          <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 2 }}>
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: "0 0 auto", background: active ? "rgba(212,175,55,0.12)" : "transparent",
                  border: `1px solid ${active ? C.gold + "50" : "transparent"}`,
                  borderRadius: 8, padding: "7px 12px", cursor: "pointer",
                  color: active ? C.gold : C.muted, fontFamily: "'Syne'",
                  fontSize: 11, fontWeight: 700, transition: "all 0.15s",
                  letterSpacing: "0.06em", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ fontSize: 10 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 80px" }}>
        <div className="tab-content" key={activeTab}>
          {renderTab()}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "16px", borderTop: `1px solid ${C.border}`, background: "rgba(10,14,22,0.95)" }}>
        <span style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>XAU/USD PRO TOOLKIT · FOR EDUCATIONAL PURPOSES ONLY · NOT FINANCIAL ADVICE</span>
      </div>
    </div>
  );
}
