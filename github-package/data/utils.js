// CSV Parser y utilidades de datos para SIGSA
window.SIGSA_UTILS = (function() {

  // Mapa de mes abreviado en español → número (para fechas tipo "21feb2025")
  const MES_ES = {
    ene: 0, enero: 0,
    feb: 1, febrero: 1,
    mar: 2, marzo: 2,
    abr: 3, abril: 3,
    may: 4, mayo: 4,
    jun: 5, junio: 5,
    jul: 6, julio: 6,
    ago: 7, agosto: 7,
    sep: 8, sept: 8, septiembre: 8,
    oct: 9, octubre: 9,
    nov: 10, noviembre: 10,
    dic: 11, diciembre: 11
  };

  function parseFechaSIGSA(s) {
    if (!s) return null;
    s = s.trim();
    // Formato 1: "21feb2025"
    const m1 = s.toLowerCase().match(/^(\d{1,2})([a-záéíóúñ]+)(\d{4})$/);
    if (m1) {
      const dia = parseInt(m1[1], 10);
      const mes = MES_ES[m1[2]];
      const año = parseInt(m1[3], 10);
      if (mes !== undefined) return new Date(año, mes, dia).getTime();
    }
    // Formato 2: "2025-02-21" o "2025/02/21"
    const m2 = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m2) return new Date(+m2[1], +m2[2] - 1, +m2[3]).getTime();
    // Formato 3: "21/02/2025" o "21-02-2025"
    const m3 = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (m3) return new Date(+m3[3], +m3[2] - 1, +m3[1]).getTime();
    // Fallback
    const t = Date.parse(s);
    return isNaN(t) ? null : t;
  }

  function parseLine(line, sep) {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQuotes = !inQuotes; continue; }
      if (c === sep && !inQuotes) { result.push(cur); cur = ""; continue; }
      cur += c;
    }
    result.push(cur);
    return result;
  }

  // Normaliza nombre (quita acentos, espacios, lowercase) — para hacer match
  function norm(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  }

  // Localiza una columna por nombre tolerante a espacios/case/acentos
  function findCol(headers, candidates) {
    const normHeaders = headers.map(norm);
    for (const c of candidates) {
      const idx = normHeaders.indexOf(norm(c));
      if (idx !== -1) return idx;
    }
    return -1;
  }

  // Determina tipo de caso desde dx_type o, si falta, desde htn_patient/dm_patient o CIE10
  function detectarTipo(rec, idxDxType, idxHtnP, idxDmP, idxCie, cols) {
    if (idxDxType !== -1) {
      const v = (cols[idxDxType] || "").toLowerCase();
      if (v.includes("hta") && v.includes("dm")) return "HTA_DM";
      if (v.includes("hta") || v.includes("htn") || v.includes("hipert")) return "HTA";
      if (v.includes("dm") || v.includes("diabet")) return "DM2";
    }
    if (idxHtnP !== -1 && idxDmP !== -1) {
      const h = parseInt(cols[idxHtnP] || "0", 10);
      const d = parseInt(cols[idxDmP] || "0", 10);
      if (h && d) return "HTA_DM";
      if (h) return "HTA";
      if (d) return "DM2";
    }
    // Fallback CIE10
    const cie = (idxCie !== -1 ? cols[idxCie] : "").toUpperCase().replace(/[:.]/g, "");
    if (cie.startsWith("I10") || cie.startsWith("I11") || cie.startsWith("I12") ||
        cie.startsWith("I13") || cie.startsWith("I15")) return "HTA";
    if (cie.startsWith("E11") || cie.startsWith("E14")) return "DM2";
    return "OTRO";
  }

  function parseCSV(text) {
    // Detectar separador
    const firstLine = text.split(/\r?\n/)[0];
    const sep = firstLine.includes("\t") ? "\t" :
                firstLine.includes(";") && !firstLine.includes(",") ? ";" : ",";

    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = parseLine(lines[0], sep).map(h => h.trim());

    // Indexar columnas conocidas (tolerante)
    const idxDDRISS = findCol(headers, ["DDRISS", "Departamento"]);
    const idxDist = findCol(headers, ["DistritodeSalud", "Distrito de Salud", "Distrito"]);
    const idxFecha = findCol(headers, ["FechaConsulta", "Fecha Consulta", "Fecha"]);
    const idxDxType = findCol(headers, ["dx_type", "tipo", "tipo_dx"]);
    const idxHtnP = findCol(headers, ["htn_patient"]);
    const idxDmP = findCol(headers, ["dm_patient"]);
    const idxCie = findCol(headers, ["CIE10", "CIE 10"]);
    const idxAño = findCol(headers, ["Año", "Anio", "Year"]);
    const idxMes = findCol(headers, ["Mes"]);

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i], sep);
      const tipo = detectarTipo(null, idxDxType, idxHtnP, idxDmP, idxCie, cols);

      const fechaStr = idxFecha !== -1 ? cols[idxFecha] : null;
      const ts = parseFechaSIGSA(fechaStr);

      const rec = {
        DDRISS: idxDDRISS !== -1 ? cols[idxDDRISS] : "",
        Distrito: idxDist !== -1 ? cols[idxDist] : "",
        FechaConsulta: fechaStr,
        _tipo: tipo,           // "HTA" | "DM2" | "HTA_DM" | "OTRO"
        _timestamp: ts,
        _año: idxAño !== -1 ? cols[idxAño] : null,
        _mes: idxMes !== -1 ? cols[idxMes] : null
      };
      // Solo registros con tipo relevante (excluir OTRO si quieres ver dataset clínico estricto)
      records.push(rec);
    }
    return records;
  }

  // Resumen agrupado por departamento
  function resumenPorDepartamento(registros, filtros) {
    const f = filtros || {};
    const filtrados = registros.filter(r => filtroAplica(r, f));
    const map = {};
    const deptos = window.GT_DEPARTAMENTOS;

    deptos.forEach(d => {
      map[d.id] = {
        id: d.id,
        nombre: d.nombre,
        region: d.region,
        poblacion: d.poblacion,
        total: 0,
        hta: 0,         // solo HTA
        dm2: 0,         // solo DM2
        ambas: 0,       // HTA + DM2
        distritos: {}
      };
    });

    const byNorm = {};
    deptos.forEach(d => { byNorm[norm(d.nombre)] = d.id; });

    filtrados.forEach(r => {
      const id = byNorm[norm(r.DDRISS)];
      if (!id) return;
      const acc = map[id];
      acc.total++;
      if (r._tipo === "HTA") acc.hta++;
      else if (r._tipo === "DM2") acc.dm2++;
      else if (r._tipo === "HTA_DM") acc.ambas++;

      const dist = (r.Distrito || "Sin distrito").trim();
      if (!acc.distritos[dist]) acc.distritos[dist] = { distrito: dist, total: 0, hta: 0, dm2: 0, ambas: 0 };
      const dacc = acc.distritos[dist];
      dacc.total++;
      if (r._tipo === "HTA") dacc.hta++;
      else if (r._tipo === "DM2") dacc.dm2++;
      else if (r._tipo === "HTA_DM") dacc.ambas++;
    });

    return map;
  }

  function filtroAplica(r, f) {
    if (f.tipo && f.tipo !== "todos") {
      if (f.tipo === "hta" && r._tipo !== "HTA") return false;
      if (f.tipo === "dm2" && r._tipo !== "DM2") return false;
      if (f.tipo === "ambas" && r._tipo !== "HTA_DM") return false;
    } else {
      // "todos" → excluir OTRO si existe (para que el dashboard sea solo HTA/DM2)
      if (r._tipo === "OTRO") return false;
    }
    if (f.desde && (!r._timestamp || r._timestamp < f.desde)) return false;
    if (f.hasta && (!r._timestamp || r._timestamp > f.hasta)) return false;
    return true;
  }

  function fmtNum(n) {
    return (n || 0).toLocaleString("es-GT");
  }

  function pct(num, den) {
    if (!den) return 0;
    return (num / den) * 100;
  }

  return { parseCSV, resumenPorDepartamento, normDep: norm, fmtNum, pct, parseFechaSIGSA };
})();
