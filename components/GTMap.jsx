// Mapa de Guatemala — burbujas proporcionales sobre mapa neutro
// Usado por ambas variantes; cambia la paleta vía props

const GTMap = ({
  resumen,           // { id: { total, hta, dm2, ... } }
  metric,            // 'hta' | 'dm2' | 'total'
  selected,          // id seleccionado
  compared,          // id comparado (lado a lado)
  onSelect,
  searchTerm,
  theme,             // { bubble, bubbleHover, bubbleSelected, land, border, label }
  interactive = true
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

  const W = (window.GT_MAP_VIEWBOX && window.GT_MAP_VIEWBOX.width) || 800;
  const H = (window.GT_MAP_VIEWBOX && window.GT_MAP_VIEWBOX.height) || 900;

  // Estado de zoom/pan (transformación del grupo principal)
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const dragRef = React.useRef(null);
  const svgRef = React.useRef(null);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 6;

  const clampPan = React.useCallback((px, py, z) => {
    // Limitar el pan para que el mapa no se "escape" demasiado
    const maxOffset = (z - 1) * 0.6;
    const lim = (val) => Math.max(-W * maxOffset, Math.min(W * maxOffset, val));
    const limY = (val) => Math.max(-H * maxOffset, Math.min(H * maxOffset, val));
    return { x: lim(px), y: limY(py) };
  }, [W, H]);

  const setZoomAt = (newZoom, cx, cy) => {
    const nz = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    if (nz === MIN_ZOOM) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    // Ajusta el pan para mantener el punto bajo el cursor estable
    if (cx !== undefined && cy !== undefined) {
      const factor = nz / zoom;
      const newPanX = cx - (cx - pan.x) * factor;
      const newPanY = cy - (cy - pan.y) * factor;
      setPan(clampPan(newPanX, newPanY, nz));
    } else {
      setPan(clampPan(pan.x, pan.y, nz));
    }
    setZoom(nz);
  };

  const handleWheel = (e) => {
    if (!interactive) return;
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    const sy = ((e.clientY - rect.top) / rect.height) * H;
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setZoomAt(zoom * factor, sx, sy);
  };

  const handleMouseDown = (e) => {
    if (!interactive || zoom <= 1) return;
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y, moved: false };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * W;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * H;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragRef.current.moved = true;
    setPan(clampPan(dragRef.current.panX + dx, dragRef.current.panY + dy, zoom));
  };

  const handleMouseUp = () => { dragRef.current = null; };

  const handleClickFeature = (id) => {
    if (dragRef.current && dragRef.current.moved) return;
    if (interactive) onSelect && onSelect(id);
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

  const transform = `translate(${pan.x}, ${pan.y}) scale(${zoom})`;
  const cursor = !interactive ? "default" : (zoom > 1 ? (dragRef.current ? "grabbing" : "grab") : "pointer");

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <svg ref={svgRef}
         viewBox={`0 0 ${W} ${H}`}
         preserveAspectRatio="xMidYMid meet"
         style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "100%", display: "block", cursor, userSelect: "none", touchAction: "none" }}
         onWheel={handleWheel}
         onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp}>
      <defs>
        <filter id="bubble-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dy="1"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g transform={transform}>
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
              onClick={() => handleClickFeature(d.id)}
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
            <g key={d.id} style={{ cursor: interactive ? "pointer" : "default" }} onClick={() => handleClickFeature(d.id)}>
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
      </g>
    </svg>

    {/* Controles de zoom */}
    {interactive && (
      <div style={{
        position: "absolute", right: 12, bottom: 12,
        display: "flex", flexDirection: "column", gap: 4,
        background: "#fff", borderRadius: 6,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
        border: "1px solid #e2e8f0", padding: 4, zIndex: 5
      }}>
        <button onClick={() => setZoomAt(zoom * 1.4, W/2, H/2)}
                disabled={zoom >= MAX_ZOOM}
                title="Acercar"
                style={zoomBtnStyle(zoom >= MAX_ZOOM)}>+</button>
        <button onClick={() => setZoomAt(zoom / 1.4, W/2, H/2)}
                disabled={zoom <= MIN_ZOOM}
                title="Alejar"
                style={zoomBtnStyle(zoom <= MIN_ZOOM)}>−</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
                title="Restablecer vista"
                style={{...zoomBtnStyle(zoom === 1 && pan.x === 0 && pan.y === 0), fontSize: 12}}>⌂</button>
      </div>
    )}
    </div>
  );
};

const zoomBtnStyle = (disabled) => ({
  width: 32, height: 32, border: "none",
  background: disabled ? "#f1f5f9" : "#fff",
  color: disabled ? "#cbd5e1" : "#0f172a",
  borderRadius: 4, cursor: disabled ? "default" : "pointer",
  fontSize: 18, fontWeight: 600, lineHeight: 1,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "inherit"
});

window.GTMap = GTMap;
