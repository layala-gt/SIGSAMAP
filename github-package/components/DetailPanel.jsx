// Panel lateral derecho — detalle de departamento
// Muestra KPIs, tabla por distrito, exportable

const DetailPanel = ({ deptoId, resumen, onClose, onCompare, comparedId, theme, totalNacional }) => {
  if (!deptoId) return null;
  const acc = resumen[deptoId];
  if (!acc) return null;

  const t = theme || {};
  const distritos = Object.values(acc.distritos || {}).sort((a, b) => b.total - a.total);
  const utils = window.SIGSA_UTILS;
  const pctHTA = utils.pct(acc.hta, acc.total);
  const pctDM2 = utils.pct(acc.dm2, acc.total);
  const pctAmbas = utils.pct(acc.ambas, acc.total);
  const promHTA = totalNacional ? utils.pct(totalNacional.hta, totalNacional.total) : 0;
  const promDM2 = totalNacional ? utils.pct(totalNacional.dm2, totalNacional.total) : 0;
  const promAmbas = totalNacional ? utils.pct(totalNacional.ambas, totalNacional.total) : 0;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: t.panelBg || "#ffffff",
      borderLeft: `1px solid ${t.border || "#e2e8f0"}`,
      color: t.text || "#0f172a"
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${t.border || "#e2e8f0"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                          color: t.muted || "#64748b", textTransform: "uppercase" }}>
              Departamento · {acc.region}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: t.heading || "#0b2a6f" }}>
              {acc.nombre}
            </div>
            <div style={{ fontSize: 12, color: t.muted || "#64748b", marginTop: 2 }}>
              Población estimada: {utils.fmtNum(acc.poblacion)}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", fontSize: 22,
            cursor: "pointer", color: t.muted || "#64748b", padding: 4, lineHeight: 1
          }} aria-label="Cerrar">×</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={() => onCompare && onCompare(deptoId)} style={{
            fontSize: 12, padding: "6px 12px",
            background: comparedId ? (t.accent || "#0b2a6f") : "transparent",
            color: comparedId ? "#fff" : (t.accent || "#0b2a6f"),
            border: `1px solid ${t.accent || "#0b2a6f"}`,
            borderRadius: 4, cursor: "pointer", fontWeight: 600
          }}>
            {comparedId ? "Cancelar comparación" : "Comparar con otro"}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${t.border || "#e2e8f0"}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <KPI label="Total" value={utils.fmtNum(acc.total)} theme={t} />
          <KPI label="Solo HTA" value={utils.fmtNum(acc.hta)} sub={`${pctHTA.toFixed(1)}%`}
               delta={pctHTA - promHTA} theme={t} accent="#1d4ed8" />
          <KPI label="Solo DM2" value={utils.fmtNum(acc.dm2)} sub={`${pctDM2.toFixed(1)}%`}
               delta={pctDM2 - promDM2} theme={t} accent="#0891b2" />
          <KPI label="HTA + DM2" value={utils.fmtNum(acc.ambas)} sub={`${pctAmbas.toFixed(1)}%`}
               delta={pctAmbas - promAmbas} theme={t} accent="#7c3aed" />
        </div>
      </div>

      {/* Tabla por distrito */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "16px 24px 8px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                        color: t.muted || "#64748b", textTransform: "uppercase" }}>
            Pacientes por distrito de salud
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: t.tableHeadBg || "#f8fafc" }}>
              <th style={thStyle(t)}>Distrito</th>
              <th style={{...thStyle(t), textAlign: "right"}}>HTA</th>
              <th style={{...thStyle(t), textAlign: "right"}}>DM2</th>
              <th style={{...thStyle(t), textAlign: "right"}}>HTA+DM2</th>
              <th style={{...thStyle(t), textAlign: "right"}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {distritos.length === 0 && (
              <tr><td colSpan="5" style={{ padding: 24, textAlign: "center", color: t.muted || "#64748b" }}>
                Sin registros para este departamento
              </td></tr>
            )}
            {distritos.map((d, i) => {
              const maxTotal = distritos[0]?.total || 1;
              return (
                <tr key={d.distrito} style={{
                  borderTop: `1px solid ${t.border || "#e2e8f0"}`,
                  background: i % 2 === 0 ? "transparent" : (t.tableAltBg || "#fafbfc")
                }}>
                  <td style={tdStyle(t)}>
                    <div>{d.distrito}</div>
                    <div style={{ marginTop: 4, height: 3, background: t.barBg || "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(d.total / maxTotal) * 100}%`,
                                    background: t.accent || "#1d4ed8" }}/>
                    </div>
                  </td>
                  <td style={{...tdStyle(t), textAlign: "right", fontVariantNumeric: "tabular-nums"}}>{utils.fmtNum(d.hta)}</td>
                  <td style={{...tdStyle(t), textAlign: "right", fontVariantNumeric: "tabular-nums"}}>{utils.fmtNum(d.dm2)}</td>
                  <td style={{...tdStyle(t), textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#7c3aed"}}>{utils.fmtNum(d.ambas)}</td>
                  <td style={{...tdStyle(t), textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums"}}>{utils.fmtNum(d.total)}</td>
                </tr>
              );
            })}
          </tbody>
          {distritos.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: `2px solid ${t.border || "#cbd5e1"}`, background: t.tableHeadBg || "#f8fafc" }}>
                <td style={{...tdStyle(t), fontWeight: 700}}>Total departamento</td>
                <td style={{...tdStyle(t), textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums"}}>{utils.fmtNum(acc.hta)}</td>
                <td style={{...tdStyle(t), textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums"}}>{utils.fmtNum(acc.dm2)}</td>
                <td style={{...tdStyle(t), textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#7c3aed"}}>{utils.fmtNum(acc.ambas)}</td>
                <td style={{...tdStyle(t), textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums"}}>{utils.fmtNum(acc.total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

const KPI = ({ label, value, sub, delta, theme, accent }) => {
  const t = theme || {};
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                    color: t.muted || "#64748b", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: accent || t.heading || "#0b2a6f",
                    fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub !== undefined && (
        <div style={{ fontSize: 11, color: t.muted || "#64748b", marginTop: 2,
                      display: "flex", alignItems: "center", gap: 6 }}>
          <span>{sub}</span>
          {delta !== undefined && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: delta >= 0 ? "#b91c1c" : "#047857"
            }}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)} pp vs nac.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const thStyle = (t) => ({
  textAlign: "left", padding: "10px 24px", fontSize: 11,
  fontWeight: 600, letterSpacing: "0.05em",
  color: t.muted || "#64748b", textTransform: "uppercase",
  borderBottom: `1px solid ${t.border || "#e2e8f0"}`
});

const tdStyle = (t) => ({
  padding: "10px 24px",
  color: t.text || "#0f172a"
});

window.DetailPanel = DetailPanel;
