// Shell del dashboard: header + filtros + mapa + panel detalle + comparación
// Recibe `theme` para variar paleta entre v1/v2

const Dashboard = ({ theme, variantLabel }) => {
  const utils = window.SIGSA_UTILS;
  const t = theme;

  const [registros, setRegistros] = React.useState([]);
  const [csvName, setCsvName] = React.useState("Cargando datos…");
  const [loadStatus, setLoadStatus] = React.useState("loading"); // loading | ok | empty | error
  const [loadError, setLoadError] = React.useState(null);
  const [tipo, setTipo] = React.useState("todos"); // todos | hta | dm2 | ambas
  const [mes, setMes] = React.useState("todos");   // "todos" o 0..11
  const [año, setAño] = React.useState("todos"); // "todos" o un año
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const [compared, setCompared] = React.useState(null);
  const [comparing, setComparing] = React.useState(false); // modo "elegir B"

  // Métrica del mapa: total | hta | dm2 | ambas (sincronía con tipo)
  const metric = tipo === "hta" ? "hta" : tipo === "dm2" ? "dm2" : tipo === "ambas" ? "ambas" : "total";

  // Años y meses disponibles en el dataset
  const aniosDisp = React.useMemo(() => {
    const set = new Set();
    registros.forEach(r => {
      if (r._timestamp) set.add(new Date(r._timestamp).getFullYear());
    });
    return [...set].sort((a, b) => b - a);
  }, [registros]);

  const mesesDisp = React.useMemo(() => {
    const set = new Set();
    registros.forEach(r => {
      if (r._timestamp) {
        const d = new Date(r._timestamp);
        if (año === "todos" || d.getFullYear() === +año) {
          set.add(d.getMonth());
        }
      }
    });
    return [...set].sort((a, b) => a - b);
  }, [registros, año]);

  const filtros = React.useMemo(() => {
    let desde = null, hasta = null;
    if (año !== "todos") {
      const y = +año;
      if (mes !== "todos") {
        const m = +mes;
        desde = new Date(y, m, 1).getTime();
        hasta = new Date(y, m + 1, 0, 23, 59, 59).getTime();
      } else {
        desde = new Date(y, 0, 1).getTime();
        hasta = new Date(y, 11, 31, 23, 59, 59).getTime();
      }
    }
    return { tipo, desde, hasta };
  }, [tipo, mes, año]);

  const resumen = React.useMemo(
    () => utils.resumenPorDepartamento(registros, filtros),
    [registros, filtros]
  );

  const totalNacional = React.useMemo(() => {
    return Object.values(resumen).reduce((acc, d) => ({
      total: acc.total + d.total,
      hta: acc.hta + d.hta,
      dm2: acc.dm2 + d.dm2,
      ambas: acc.ambas + d.ambas
    }), { total: 0, hta: 0, dm2: 0, ambas: 0 });
  }, [resumen]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = utils.parseCSV(ev.target.result);
        if (data.length === 0) {
          alert("El archivo no contiene registros válidos.");
          return;
        }
        setRegistros(data);
        setCsvName(file.name);
        setSelected(null);
        setCompared(null);
      } catch (err) {
        alert("Error al procesar CSV: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Carga automática desde data/manifest.json + data/csv/*.csv
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mr = await fetch("data/manifest.json", { cache: "no-store" });
        if (!mr.ok) throw new Error("manifest.json no encontrado (" + mr.status + ")");
        const manifest = await mr.json();
        const archivos = Array.isArray(manifest) ? manifest : (manifest.archivos || []);
        if (!archivos.length) {
          if (!cancelled) { setLoadStatus("empty"); setCsvName("Sin datos cargados"); }
          return;
        }
        const todos = [];
        for (const nombre of archivos) {
          try {
            const r = await fetch("data/csv/" + nombre, { cache: "no-store" });
            if (!r.ok) {
              console.warn("No se pudo cargar " + nombre + " (" + r.status + ")");
              continue;
            }
            const txt = await r.text();
            const recs = utils.parseCSV(txt);
            recs.forEach(rec => { rec._archivo = nombre; });
            todos.push(...recs);
          } catch (err) {
            console.warn("Error en " + nombre, err);
          }
        }
        if (cancelled) return;
        if (todos.length === 0) {
          setLoadStatus("error");
          setLoadError("No se pudo leer ningún CSV del manifiesto.");
          setCsvName("Error al cargar datos");
        } else {
          setRegistros(todos);
          setLoadStatus("ok");
          setCsvName(archivos.length + " archivo" + (archivos.length === 1 ? "" : "s") + " cargado" + (archivos.length === 1 ? "" : "s"));
        }
      } catch (err) {
        if (cancelled) return;
        setLoadStatus("error");
        setLoadError(err.message);
        setCsvName("Sin datos");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSelect = (id) => {
    if (comparing) {
      if (id !== selected) setCompared(id);
      setComparing(false);
      return;
    }
    if (id === selected) {
      setSelected(null);
      setCompared(null);
    } else {
      setSelected(id);
      setCompared(null);
    }
  };

  const handleCompare = () => {
    if (compared) {
      setCompared(null);
      setComparing(false);
    } else {
      setComparing(true);
    }
  };

  // Departamentos sugeridos por búsqueda
  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const sugerencias = search.trim().length > 0
    ? window.GT_DEPARTAMENTOS.filter(d => norm(d.nombre).includes(norm(search))).slice(0, 6)
    : [];

  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column",
      background: t.appBg, color: t.text,
      fontFamily: t.font || "'Inter', system-ui, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        padding: "16px 28px", borderBottom: `1px solid ${t.border}`,
        background: t.headerBg, display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 24, flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 6, background: t.accent,
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, letterSpacing: "0.05em"
          }}>+</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                          color: t.muted, textTransform: "uppercase" }}>
              SIGSA · MSPAS Guatemala {variantLabel ? `· ${variantLabel}` : ""}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.heading, marginTop: 2 }}>
              Tablero de morbilidad — HTA / DM2
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: t.muted, fontWeight: 500 }}>
            {csvName}{registros.length ? " · " + utils.fmtNum(registros.length) + " registros" : ""}
          </span>
        </div>
      </header>

      {/* Filtros bar */}
      <div style={{
        padding: "12px 28px", borderBottom: `1px solid ${t.border}`,
        background: t.filterBg, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap"
      }}>
        <FilterGroup label="Tipo de caso" theme={t}>
          {[["todos", "Todos"], ["hta", "HTA"], ["dm2", "DM2"], ["ambas", "HTA + DM2"]].map(([k, lbl]) => (
            <button key={k} onClick={() => setTipo(k)} style={{
              fontSize: 12, padding: "6px 12px", fontWeight: 600,
              background: tipo === k ? t.accent : "transparent",
              color: tipo === k ? "#fff" : t.text,
              border: `1px solid ${tipo === k ? t.accent : t.border}`,
              borderRadius: 4, cursor: "pointer",
              borderRight: 0
            }}>{lbl}</button>
          ))}
        </FilterGroup>

        <FilterGroup label="Periodo" theme={t}>
          <select value={año} onChange={e => setAño(e.target.value)} style={selectStyle(t)}>
            <option value="todos">Todos los años</option>
            {aniosDisp.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={mes} onChange={e => setMes(e.target.value)}
                  disabled={año === "todos"}
                  style={{...selectStyle(t), opacity: año === "todos" ? 0.5 : 1}}>
            <option value="todos">Todos los meses</option>
            {MESES_NOMBRE.map((nombre, i) => (
              mesesDisp.includes(i) || año === "todos"
                ? <option key={i} value={i}>{nombre}</option>
                : null
            ))}
          </select>
          {(año !== "todos" || mes !== "todos") && (
            <button onClick={() => { setAño("todos"); setMes("todos"); }} style={{
              fontSize: 11, padding: "4px 8px", marginLeft: 4,
              background: "transparent", color: t.muted, border: "none", cursor: "pointer"
            }}>limpiar</button>
          )}
        </FilterGroup>

        <div style={{ flex: 1 }}></div>

        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Buscar departamento…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle(t), width: 220 }}
          />
          {sugerencias.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", right: 0,
              background: t.panelBg, border: `1px solid ${t.border}`, borderRadius: 4,
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)", zIndex: 10, minWidth: 220
            }}>
              {sugerencias.map(d => (
                <button key={d.id} onClick={() => { handleSelect(d.id); setSearch(""); }}
                        style={{
                          display: "block", width: "100%", textAlign: "left", padding: "8px 12px",
                          background: "transparent", border: "none", cursor: "pointer",
                          fontSize: 13, color: t.text, fontFamily: "inherit"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = t.hover || "#f1f5f9"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {d.nombre}
                  <span style={{ fontSize: 11, color: t.muted, marginLeft: 8 }}>{d.region}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body: Mapa + Panel */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Mapa + KPIs nacionales */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0,
                      background: t.mapBg, position: "relative" }}>
          {/* National KPIs strip */}
          <div style={{
            display: "flex", padding: "16px 28px", gap: 32,
            borderBottom: `1px solid ${t.border}`, background: t.panelBg
          }}>
            <NationalKPI label="Pacientes totales" value={registros.length ? utils.fmtNum(totalNacional.total) : "—"} theme={t} />
            <NationalKPI label="Solo HTA"
                         value={registros.length ? utils.fmtNum(totalNacional.hta) : "—"}
                         sub={registros.length ? `${utils.pct(totalNacional.hta, totalNacional.total).toFixed(1)}% del total` : null}
                         theme={t} accent="#1d4ed8" />
            <NationalKPI label="Solo DM2"
                         value={registros.length ? utils.fmtNum(totalNacional.dm2) : "—"}
                         sub={registros.length ? `${utils.pct(totalNacional.dm2, totalNacional.total).toFixed(1)}% del total` : null}
                         theme={t} accent="#0891b2" />
            <NationalKPI label="HTA + DM2"
                         value={registros.length ? utils.fmtNum(totalNacional.ambas) : "—"}
                         sub={registros.length ? `${utils.pct(totalNacional.ambas, totalNacional.total).toFixed(1)}% del total` : null}
                         theme={t} accent="#7c3aed" />
            <div style={{ flex: 1 }}></div>
            <div style={{ alignSelf: "center", fontSize: 11, color: t.muted }}>
              {comparing && (
                <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 10px",
                               borderRadius: 4, fontWeight: 600 }}>
                  Selecciona otro departamento para comparar →
                </span>
              )}
            </div>
          </div>

          {/* Mapa */}
          <div style={{ flex: 1, padding: 8, display: "flex", justifyContent: "center",
                        alignItems: "stretch", overflow: "hidden", minHeight: 0, position: "relative" }}>
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <window.GTMap
                resumen={resumen}
                metric={metric}
                selected={selected}
                compared={compared}
                onSelect={handleSelect}
                searchTerm={search}
                theme={t.map}
              />
            </div>
            {registros.length === 0 && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: "rgba(248, 250, 252, 0.92)",
                backdropFilter: "blur(2px)",
                pointerEvents: "auto"
              }}>
                {loadStatus === "loading" && (
                  <>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      border: `3px solid ${t.border}`,
                      borderTopColor: t.accent,
                      animation: "spin 0.8s linear infinite",
                      marginBottom: 18
                    }}/>
                    <div style={{ fontSize: 16, fontWeight: 600, color: t.heading, marginBottom: 4 }}>
                      Cargando datos…
                    </div>
                    <div style={{ fontSize: 12, color: t.muted }}>
                      Leyendo archivos del repositorio
                    </div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </>
                )}
                {loadStatus === "empty" && (
                  <>
                    <div style={{ fontSize: 16, fontWeight: 600, color: t.heading, marginBottom: 6 }}>
                      No hay archivos cargados
                    </div>
                    <div style={{ fontSize: 13, color: t.muted, maxWidth: 420, textAlign: "center" }}>
                      El manifiesto está vacío. Subí los CSV mensuales a <code style={{ background: t.filterBg, padding: "1px 6px", borderRadius: 3 }}>data/csv/</code> y agregalos a <code style={{ background: t.filterBg, padding: "1px 6px", borderRadius: 3 }}>data/manifest.json</code>.
                    </div>
                  </>
                )}
                {loadStatus === "error" && (
                  <>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: "#fef2f2", color: "#b91c1c",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 24, fontWeight: 700, marginBottom: 14
                    }}>!</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: t.heading, marginBottom: 6 }}>
                      No se pudieron cargar los datos
                    </div>
                    <div style={{ fontSize: 12, color: t.muted, maxWidth: 460, textAlign: "center" }}>
                      {loadError || "Verificá que data/manifest.json exista y que los CSV listados estén en data/csv/."}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Leyenda + footer */}
          <div style={{ padding: "10px 28px", borderTop: `1px solid ${t.border}`,
                        background: t.panelBg, display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: 16, fontSize: 11, color: t.muted }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span>Tamaño de burbuja = {metric === "hta" ? "pacientes solo HTA" : metric === "dm2" ? "pacientes solo DM2" : metric === "ambas" ? "pacientes con HTA + DM2" : "total de pacientes"}</span>
              <BubbleLegend theme={t.map} />
            </div>
            <span>Click en un departamento para ver detalle por distrito</span>
          </div>
        </div>

        {/* Panel detalle */}
        {selected && (
          <div style={{ width: 460, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <window.DetailPanel
                deptoId={selected}
                resumen={resumen}
                onClose={() => { setSelected(null); setCompared(null); setComparing(false); }}
                onCompare={handleCompare}
                comparedId={compared}
                theme={t}
                totalNacional={totalNacional}
              />
            </div>
            {compared && (
              <window.ComparePanel
                aId={selected}
                bId={compared}
                resumen={resumen}
                onCloseB={() => setCompared(null)}
                theme={t}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FilterGroup = ({ label, children, theme }) => (
  <div>
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                  color: theme.muted, textTransform: "uppercase", marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
  </div>
);

const inputStyle = (t) => ({
  fontSize: 12, padding: "6px 10px",
  background: t.panelBg, color: t.text,
  border: `1px solid ${t.border}`, borderRadius: 4,
  fontFamily: "inherit"
});

const selectStyle = (t) => ({
  fontSize: 12, padding: "6px 10px",
  background: t.panelBg, color: t.text,
  border: `1px solid ${t.border}`, borderRadius: 4,
  fontFamily: "inherit",
  cursor: "pointer"
});

const MESES_NOMBRE = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const NationalKPI = ({ label, value, sub, theme, accent }) => (
  <div>
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                  color: theme.muted, textTransform: "uppercase" }}>
      {label}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4,
                  color: accent || theme.heading,
                  fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>{sub}</div>}
  </div>
);

const BubbleLegend = ({ theme }) => {
  const t = theme || {};
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {[10, 18, 28].map((r, i) => (
        <svg key={i} width={r * 2} height={r * 2 + 4} style={{ display: "block" }}>
          <circle cx={r} cy={r} r={r - 1} fill={t.bubble || "#1d4ed8"}
                  fillOpacity={0.4} stroke={t.bubble || "#1d4ed8"} strokeWidth={1}/>
        </svg>
      ))}
    </div>
  );
};

window.Dashboard = Dashboard;
