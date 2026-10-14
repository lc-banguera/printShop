# Matriz de evidencia del motor de imágenes

| Capacidad | Evidencia actual | Estado |
| --- | --- | --- |
| Escalado bilineal, bicúbico, Lanczos y enfoque | Engine tests + salida local 2160×3840 | Verificado |
| Objetivo 4K | `latest/report.json` reabre 2160×3840 | Verificado para salida determinista |
| Ajustes fotográficos | Salida local con 55.2 % de bytes RGB modificados | Verificado |
| Semitonos | Salida local con controles de ángulo, intensidad, contraste, forma e inversión | Verificado en engine |
| Módulo C++ dedicado | No se incorpora un binding nativo no utilizado; el motor portable actual es TypeScript y el servicio opcional usa OpenCV desde Python | Pendiente de toolchain/decisión de distribución |
| Vectorización a color | SVG local con 1.591 rutas, 12 colores y sin `<image>` | Verificado en engine/artefacto |
| Persistencia de rutas en documento | Pruebas de serialización de paths existentes | Verificado en engine |
| Vista previa y descarte de resultados obsoletos | Worker + abort controller + typecheck/build | Verificado por contrato; falta prueba manual en navegador |
| Eliminación de fondo | Implementación local y contrato ONNX existentes | Engine verificado; servicio Python pendiente |
| Borrado mágico/inpainting | OpenCV service contract + borrado local por máscara | Engine/contrato verificados; servicio Python pendiente |
| Mejora IA neuronal | SESR INT8 real por ONNX Runtime; 2× neuronal y composición declarada para 4× | Verificado con imagen local y dimensiones conservadas; pesos fuera de Git, descarga con SHA-256 |
| Capas mágicas y edición mágica | El contrato actual no define un modelo de segmentación/edición ejecutable | Pendiente de especificación/modelo autorizado |
| E2E del microservicio Python | Runtime Python 3.12 local del entorno + dependencias fijadas | Endpoint SESR verificado directamente; suite completa no se repitió porque incluye pruebas previas pesadas |

La matriz evita convertir compilación o respuesta HTTP en una afirmación de calidad visual. Los artefactos en `latest/` son resultados reales generados con recursos locales del repositorio.
