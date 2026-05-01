// Mapa de Guatemala — burbujas proporcionales sobre mapa neutro
// Usado por ambas variantes; cambia la paleta vía props

const GTMap = ({
  resumen,           // { id: { total, hta, dm2, ... } }
  metric,            // 'hta' | 'dm2' | 'total'
  selected,          // id seleccionado
  compared,          // id comparado (lado a lado)
  onSelect,
  searchTerm,
  theme              // { bubble, bubbleHover, bubbleSelected, land, border, label }
}) => {
  const t = theme || {
    bubble: "#1d4ed8",
    bubbleSelected: "#0b2a6f",
    bubbleCompare: "#0891b2",
    bubbleDim: "#94a3b8",
    land: "#f1f5f9",
    border: "#cbd5e1",
    label: "#334155"
  };

  // Calcular max para escalar burbujas
  const valores = Object.values(resumen).map(d => d[metric] || 0);
  const max = Math.max(1, ...valores);

  const radio = (v) => {
    if (!v || v <= 0) return 0;
    const minR = 6, maxR = 38;
    const ratio = v / max;
    return minR + Math.sqrt(ratio) * (maxR - minR);
  };

  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const term = norm(searchTerm || "");

  return (
    <svg viewBox={`0 0 ${(window.GT_MAP_VIEWBOX && window.GT_MAP_VIEWBOX.width) || 800} ${(window.GT_MAP_VIEWBOX && window.GT_MAP_VIEWBOX.height) || 900}`} preserveAspectRatio="xMidYMid meet" style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "100%", display: "block" }}>
      <defs>
        <filter id="bubble-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dy="1"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Polígonos departamentales */}
      <g>
        {window.GT_DEPARTAMENTOS.map(d => {
          const path = window.GT_POLIGONOS[d.id];
          const isSel = selected === d.id;
          const isCmp = compared === d.id;
          const matchSearch = term && norm(d.nombre).includes(term);
          let fill = t.land;
          if (isSel) fill = t.landSelected || "#dbeafe";
          else if (isCmp) fill = t.landCompare || "#cffafe";
          else if (matchSearch) fill = "#fef9c3";
          return (
            <path
              key={d.id}
              d={path}
              fill={fill}
              stroke={t.border}
              strokeWidth={isSel || isCmp ? 1.5 : 0.8}
              style={{ cursor: "pointer", transition: "fill 200ms" }}
              onClick={() => onSelect && onSelect(d.id)}
            >
              <title>{d.nombre}</title>
            </path>
          );
        })}
      </g>

      {/* Burbujas */}
      <g>
        {window.GT_DEPARTAMENTOS.map(d => {
          const c = window.GT_CENTROIDES[d.id];
          const acc = resumen[d.id] || { total: 0, hta: 0, dm2: 0 };
          const v = acc[metric] || 0;
          const r = radio(v);
          if (r === 0) return null;
          const isSel = selected === d.id;
          const isCmp = compared === d.id;
          let color = t.bubble;
          if (isSel) color = t.bubbleSelected;
          else if (isCmp) color = t.bubbleCompare;
          else if (selected || compared) color = t.bubbleDim;
          return (
            <g key={d.id} style={{ cursor: "pointer" }} onClick={() => onSelect && onSelect(d.id)}>
              <circle
                cx={c.x}
                cy={c.y}
                r={r}
                fill={color}
                fillOpacity={0.78}
                stroke="#fff"
                strokeWidth={1.5}
                filter="url(#bubble-shadow)"
                style={{ transition: "all 220ms" }}
              />
              {(isSel || isCmp || v > max * 0.4) && (
                <text
                  x={c.x}
                  y={c.y + 3}
                  textAnchor="middle"
                  fontSize={r > 18 ? 11 : 10}
                  fontWeight="600"
                  fill="#fff"
                  style={{ pointerEvents: "none" }}
                >
                  {window.SIGSA_UTILS.fmtNum(v)}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* Etiquetas de departamento (solo seleccionado / comparado / hover-target) */}
      <g style={{ pointerEvents: "none" }}>
        {window.GT_DEPARTAMENTOS.map(d => {
          const c = window.GT_CENTROIDES[d.id];
          const acc = resumen[d.id] || { total: 0 };
          const v = acc[metric] || 0;
          const r = radio(v);
          const isSel = selected === d.id;
          const isCmp = compared === d.id;
          if (!isSel && !isCmp) return null;
          return (
            <text
              key={d.id}
              x={c.x}
              y={c.y - r - 6}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill={t.label}
            >
              {d.nombre}
            </text>
          );
        })}
      </g>
    </svg>
  );
};

window.GTMap = GTMap;
