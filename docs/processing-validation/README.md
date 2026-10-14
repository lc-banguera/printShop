# Validación de procesamiento del Diseñador 3

Los archivos de `latest/` son artefactos reproducibles generados por:

```powershell
cd engine
npm run build
node tools/production-quality.mjs
```

La prueba usa únicamente recursos PNG locales del repositorio. Conserva copias `before-*`, genera resultados `after-*` y escribe `report.json` con dimensiones, parámetros, proporción de píxeles modificados y datos de vectorización.

La salida 4K significa que el lado mayor mide realmente 3840 píxeles; no es una etiqueta DPI ni un cambio de CSS. La prueba no declara calidad neuronal ni recuperación de información perdida: valida el escalado determinista Lanczos, sus dimensiones y la conservación del formato RGBA.

## Validación neuronal SESR

La mejora IA usa `SESR_int8.onnx` de AMD, descargado fuera de Git mediante
`processing-service/install-sesr-model.ps1`. El script comprueba el
SHA-256 publicado antes de instalar el peso en `processing-service/models/`.

En Windows con Python disponible:

```powershell
cd processing-service
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
.\install-sesr-model.ps1
py test_all_engines.py
```

La evidencia local de esta fase conserva el original de `img1.jpg`, el
resultado 4× y sus dimensiones en `latest/sesr-validation.json`. El resultado
4× se describe como `SESR INT8 x2 + Precision Resample to x4 (Lanczos)`: la
primera ampliación sí ejecuta inferencia neuronal y la segunda no se presenta
como IA.
