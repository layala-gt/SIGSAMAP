// Panel de comparación lado a lado entre 2 departamentos
const ComparePanel = ({ aId, bId, resumen, onCloseB, onSwap, theme }) => {
  const t = theme || {};
  if (!aId || !bId) return null;
  const a = resumen[aId], b = resumen[bId];
  if (!a || !b) return null;
  const utils = window.SIGSA_UTILS;

  const rows = [
    { label: "Total pacientes", a: a.total, b: b.total, fmt: "num" },
    { label: "Pacientes HTA", a: a.hta, b: b.hta, fmt: "num" },
    { label: "Pacientes DM2", a: a.dm2, b: b.dm2, fmt: "num" },
    { label: "% HTA del total", a: utils.pct(a.hta, a.total), b: utils.pct(b.hta, b.total), fmt: "pct" },
    { label: "% DM2 del total", a: utils.pct(a.dm2, a.total), b: utils.pct(b.dm2, b.total), fmt: "pct" },
    { label: "Distritos con registros", a: Object.keys(a.distritos).length, b: Object.keys(b.distritos).length, fmt: "num" }
  ];

  const fmt = (v, type) => type === "pct" ? `${v.toFixed(1)}%` : utils.fmtNum(Math.round(v));

  return (
    <div style={{
      borderTop: `1px solid ${t.border || "#e2e8f0"}`,
      background: t.panelBg || "#ffffff",
      padding: "16px 24px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                      color: t.muted || "#64748b", textTransform: "uppercase" }}>
          Comparación
        </div>
        <button onClick={onCloseB} style={{
          fontSize: 11, padding: "4px 10px", background: "transparent",
          color: t.muted || "#64748b", border: `1px solid ${t.border || "#e2e8f0"}`,
          borderRadius: 4, cursor: "pointer"
        }}>Cerrar comparación</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "6px 0", color: t.muted, fontWeight: 600 }}></th>
            <th style={{ textAlign: "right", padding: "6px 12px", color: t.heading || "#0b2a6f", fontWeight: 700 }}>{a.nombre}</th>
            <th style={{ textAlign: "right", padding: "6px 12px", color: t.bubbleCompare || "#0891b2", fontWeight: 700 }}>{b.nombre}</th>
            <th style={{ textAlign: "right", padding: "6px 0", color: t.muted, fontWeight: 600, width: 80 }}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const delta = r.a - r.b;
            return (
              <tr key={r.label} style={{ borderTop: `1px solid ${t.border || "#f1f5f9"}` }}>
                <td style={{ padding: "8px 0", color: t.text }}>{r.label}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmt(r.a, r.fmt)}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmt(r.b, r.fmt)}</td>
                <td style={{ padding: "8px 0", textAlign: "right", fontVariantNumeric: "tabular-nums",
                             color: delta >= 0 ? "#047857" : "#b91c1c", fontWeight: 600 }}>
                  {delta >= 0 ? "+" : ""}{fmt(Math.abs(delta), r.fmt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

window.ComparePanel = ComparePanel;
