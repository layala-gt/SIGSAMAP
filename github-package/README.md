# SIGSA — Tablero de morbilidad HTA / DM2

Dashboard interactivo del mapa de Guatemala que carga automáticamente los CSV mensuales del repositorio.

## Estructura del repositorio

```
.
├── index.html                ← dashboard cifrado (renombrar SIGSA Dashboard.html cifrado a index.html)
├── components/               ← código del dashboard (NO TOCAR)
│   ├── ComparePanel.jsx
│   ├── Dashboard.jsx
│   ├── DetailPanel.jsx
│   ├── GTMap.jsx
│   └── themes.js
├── data/
│   ├── guatemala-geo.js      ← metadata de departamentos (NO TOCAR)
│   ├── guatemala-shapes.js   ← polígonos del mapa (NO TOCAR)
│   ├── utils.js              ← parser CSV (NO TOCAR)
│   ├── manifest.json         ← lista de CSVs a cargar ⭐ ESTE SÍ SE EDITA
│   └── csv/
│       ├── 2025-02.csv       ← un archivo por mes
│       └── 2025-03.csv
└── README.md
```

## Cómo agregar un mes nuevo

1. **Subí el CSV** a la carpeta `data/csv/` con el nombre `AAAA-MM.csv` (ej: `2025-03.csv`)
2. **Editá `data/manifest.json`** y agregá el archivo a la lista:
   ```json
   {
     "archivos": [
       "2025-02.csv",
       "2025-03.csv"
     ]
   }
   ```
3. **Commit** en GitHub
4. Los visitantes verán los datos acumulados al refrescar

## Requisitos del CSV

Cada archivo debe tener estas columnas (mismo formato que el archivo de prueba):

- `DDRISS` — nombre del departamento en mayúsculas (ej: `SOLOLÁ`, `JUTIAPA`)
- `DistritodeSalud` — nombre del distrito de salud
- `FechaConsulta` — formato `21feb2025` (día + mes abreviado en español + año)
- `dx_type` — uno de: `Solo HTA`, `Solo DM (E:11/E:14)`, `HTA + DM`
- Otras columnas son opcionales

## Publicar en GitHub Pages

1. Crear repositorio en GitHub (privado o público)
2. Subir todos los archivos de la lista de arriba
3. Settings → Pages → Source: `main` branch, root folder
4. Esperar 1-2 minutos → el sitio queda en `https://TU-USUARIO.github.io/NOMBRE-REPO/`

## Seguridad

- El HTML está cifrado con StatiCrypt — requiere contraseña para abrir
- Los CSVs no están cifrados (datos desidentificados/agregados)
- Solo usuarios con acceso de escritura al repositorio pueden subir CSVs nuevos
- Los visitantes solo pueden ver, no modificar
