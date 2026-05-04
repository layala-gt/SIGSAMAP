// Generador de dataset sintético para SIGSA dashboard
// Genera datos con la MISMA estructura que el CSV real:
// - DDRISS en MAYÚSCULAS
// - DistritodeSalud
// - Fecha tipo "21feb2025"
// - dx_type: "Solo HTA" | "Solo DM (E:11/E:14)" | "HTA + DM"

(function() {
  const departamentos = window.GT_DEPARTAMENTOS;

  // Distribución por región: probabilidades aproximadas de cada categoría
  // (para que el mapa muestre patrones interesantes entre departamentos)
  const PERFIL = {
    "Central":       { hta: 0.50, dm: 0.32, ambas: 0.18 },
    "Sur":           { hta: 0.52, dm: 0.30, ambas: 0.18 },
    "Suroccidente":  { hta: 0.55, dm: 0.32, ambas: 0.13 },
    "Suroriente":    { hta: 0.48, dm: 0.34, ambas: 0.18 },
    "Nororiente":    { hta: 0.50, dm: 0.34, ambas: 0.16 },
    "Norte":         { hta: 0.62, dm: 0.28, ambas: 0.10 },
    "Noroccidente":  { hta: 0.65, dm: 0.27, ambas: 0.08 }
  };

  const MES_ABBR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }
  function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function fechaSIGSA() {
    const start = new Date(2024, 0, 1).getTime();
    const end = new Date(2026, 3, 27).getTime();
    const t = start + Math.random() * (end - start);
    const d = new Date(t);
    return {
      str: pad2(d.getDate()) + MES_ABBR[d.getMonth()] + d.getFullYear(),
      ts: t
    };
  }

  function generarRegistro(depto) {
    const distrito = randomChoice(depto.distritos);
    const fecha = fechaSIGSA();
    const perfil = PERFIL[depto.region];
    const r = Math.random();

    let tipo;
    if (r < perfil.hta) tipo = "HTA";
    else if (r < perfil.hta + perfil.dm) tipo = "DM2";
    else tipo = "HTA_DM";

    return {
      DDRISS: depto.nombre.toUpperCase(),
      Distrito: distrito.toUpperCase(),
      FechaConsulta: fecha.str,
      _tipo: tipo,
      _timestamp: fecha.ts
    };
  }

  function generar() {
    const registros = [];
    const totalPob = departamentos.reduce((s, d) => s + d.poblacion, 0);
    const TOTAL = 5500;

    departamentos.forEach(depto => {
      const base = Math.round((depto.poblacion / totalPob) * TOTAL);
      const jitter = 0.85 + Math.random() * 0.3;
      const count = Math.max(40, Math.round(base * jitter));
      for (let i = 0; i < count; i++) {
        registros.push(generarRegistro(depto));
      }
    });
    return registros;
  }

  window.GT_DATASET = generar();
  console.log(`Dataset SIGSA demo: ${window.GT_DATASET.length} registros (HTA / DM2 / HTA+DM2)`);
})();
