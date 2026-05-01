// Guatemala — 22 departamentos con centroides y polígonos simplificados
// Coordenadas aproximadas en sistema lat/lng convertido a un canvas SVG 800x900
// Basado en GADM / IGN simplificado a mano para visualización institucional

window.GT_DEPARTAMENTOS = [
  { id: "PET", nombre: "Petén", region: "Norte", poblacion: 545600, distritos: ["Flores", "San Benito", "Poptún", "Melchor de Mencos", "La Libertad", "Sayaxché", "San Luis", "Dolores"] },
  { id: "HUE", nombre: "Huehuetenango", region: "Noroccidente", poblacion: 1364323, distritos: ["Huehuetenango", "Chiantla", "Aguacatán", "La Democracia", "San Pedro Necta", "Jacaltenango", "Barillas", "La Libertad"] },
  { id: "QUI", nombre: "Quiché", region: "Noroccidente", poblacion: 1207087, distritos: ["Santa Cruz del Quiché", "Chichicastenango", "Nebaj", "Joyabaj", "San Pedro Jocopilas", "Uspantán", "Ixcán", "Chajul"] },
  { id: "AVE", nombre: "Alta Verapaz", region: "Norte", poblacion: 1374857, distritos: ["Cobán", "San Pedro Carchá", "San Cristóbal Verapaz", "Tactic", "Tucurú", "Panzós", "Chisec", "Fray Bartolomé"] },
  { id: "BVE", nombre: "Baja Verapaz", region: "Norte", poblacion: 333242, distritos: ["Salamá", "Rabinal", "Cubulco", "San Miguel Chicaj", "San Jerónimo", "Purulhá"] },
  { id: "IZA", nombre: "Izabal", region: "Nororiente", poblacion: 489644, distritos: ["Puerto Barrios", "Livingston", "Morales", "Los Amates", "El Estor"] },
  { id: "ZAC", nombre: "Zacapa", region: "Nororiente", poblacion: 271409, distritos: ["Zacapa", "Estanzuela", "Río Hondo", "Gualán", "Teculután", "Usumatlán", "Cabañas"] },
  { id: "CHQ", nombre: "Chiquimula", region: "Nororiente", poblacion: 415063, distritos: ["Chiquimula", "Esquipulas", "Jocotán", "Camotán", "San Juan Ermita", "Olopa", "Quezaltepeque"] },
  { id: "JAL", nombre: "Jalapa", region: "Suroriente", poblacion: 372214, distritos: ["Jalapa", "San Pedro Pinula", "Mataquescuintla", "Monjas", "San Luis Jilotepeque", "San Carlos Alzatate"] },
  { id: "JUT", nombre: "Jutiapa", region: "Suroriente", poblacion: 488395, distritos: ["Jutiapa", "Asunción Mita", "El Progreso", "Moyuta", "Santa Catarina Mita", "Atescatempa", "Agua Blanca"] },
  { id: "SRO", nombre: "Santa Rosa", region: "Suroriente", poblacion: 396607, distritos: ["Cuilapa", "Barberena", "Chiquimulilla", "Taxisco", "Guazacapán", "Nueva Santa Rosa", "Casillas"] },
  { id: "ESC", nombre: "Escuintla", region: "Sur", poblacion: 808810, distritos: ["Escuintla", "Santa Lucía Cotzumalguapa", "Tiquisate", "Puerto San José", "La Gomera", "Palín", "Masagua"] },
  { id: "SAC", nombre: "Sacatepéquez", region: "Central", poblacion: 365615, distritos: ["Antigua Guatemala", "Jocotenango", "Ciudad Vieja", "Santa María de Jesús", "Sumpango", "San Lucas Sacatepéquez"] },
  { id: "GUA", nombre: "Guatemala", region: "Central", poblacion: 3353951, distritos: ["Guatemala", "Mixco", "Villa Nueva", "Villa Canales", "San Miguel Petapa", "Amatitlán", "Chinautla", "Santa Catarina Pinula"] },
  { id: "CHM", nombre: "Chimaltenango", region: "Central", poblacion: 720522, distritos: ["Chimaltenango", "San Martín Jilotepeque", "Comalapa", "Patzún", "Patzicía", "Tecpán", "Acatenango"] },
  { id: "EPR", nombre: "El Progreso", region: "Nororiente", poblacion: 176632, distritos: ["Guastatoya", "Morazán", "San Agustín Acasaguastlán", "Sanarate", "Sansare", "El Jícaro"] },
  { id: "SOL", nombre: "Sololá", region: "Suroccidente", poblacion: 504669, distritos: ["Sololá", "Panajachel", "San Lucas Tolimán", "Santiago Atitlán", "San Pedro La Laguna", "Nahualá"] },
  { id: "TOT", nombre: "Totonicapán", region: "Suroccidente", poblacion: 461838, distritos: ["Totonicapán", "Momostenango", "San Francisco El Alto", "San Cristóbal", "San Andrés Xecul", "Santa María Chiquimula"] },
  { id: "QUE", nombre: "Quetzaltenango", region: "Suroccidente", poblacion: 928931, distritos: ["Quetzaltenango", "Coatepeque", "Salcajá", "Olintepeque", "Cantel", "Almolonga", "Zunil"] },
  { id: "SMA", nombre: "San Marcos", region: "Suroccidente", poblacion: 1196400, distritos: ["San Marcos", "Malacatán", "Tajumulco", "San Pedro Sacatepéquez", "Tacaná", "Ayutla", "Catarina"] },
  { id: "RET", nombre: "Retalhuleu", region: "Suroccidente", poblacion: 388746, distritos: ["Retalhuleu", "Champerico", "San Sebastián", "Santa Cruz Muluá", "El Asintal", "Nuevo San Carlos"] },
  { id: "SUC", nombre: "Suchitepéquez", region: "Suroccidente", poblacion: 614032, distritos: ["Mazatenango", "San Antonio Suchitepéquez", "Chicacao", "Santo Domingo Suchitepéquez", "Cuyotenango", "Patulul"] }
];
