# Recupera tus horas

Presentación web de Augusto González: 15 diapositivas en español para un pitch de cinco minutos sobre automatización e IA. Construida con Astro, TypeScript y CSS; tipografía e ilustraciones locales.

## Ejecutar

Requiere Node.js 22.12 o superior compatible con Astro 7.

```sh
npm install
npm run dev
```

Abre la dirección que indique la terminal. Para generar la versión estática:

```sh
npm run build
npm run preview
```

La carpeta `dist/` contiene el sitio listo para un alojamiento estático. Los enlaces a imágenes presuponen publicación en la raíz del dominio.

## Presentar

| Acción | Tecla |
| --- | --- |
| Avanzar / retroceder | → / ←, PageDown / PageUp |
| Avanzar | Espacio |
| Primera / última | Home / End |
| Pantalla completa | F |
| Índice de diapositivas | O |
| Notas del relato | N |
| Iniciar / pausar cronómetro | T |
| Cerrar un panel | Escape |

También hay botones y navegación por deslizamiento horizontal en móvil. Cada diapositiva tiene un enlace directo, por ejemplo `/#/12`. El cronómetro es manual; las diapositivas no avanzan solas. Las notas se muestran en la misma pantalla: ciérralas durante la proyección si no quieres que el público las vea. Los tiempos sugeridos suman 300 segundos.

Puedes imprimir las 15 diapositivas o guardarlas como PDF desde el navegador; activa los gráficos de fondo y desactiva los encabezados y pies del navegador.

Los tres hallazgos se desarrollan solo dentro de la historia de Juan. Después aparece el caso personal de Augusto: pasaba horas extrayendo facturas para la declaración de renta y lo resolvió con un agente que extrae los archivos y los comprime en un ZIP. El cierre invita a identificar una tarea propia y solicitar un diagnóstico; no vuelve a enumerar los hallazgos.

## Editar

- `src/pages/index.astro`: texto visible, diagramas, gráfico y composición de las 15 diapositivas.
- `src/data/presentation.ts`: contacto, títulos del índice, tiempos y notas del relato.
- `src/styles/global.css`: identidad visual, diseño adaptable y estilos de impresión.
- `src/scripts/presentation.ts`: controles, enlaces, notas y cronómetro.
- `public/images/`: 12 ilustraciones WebP optimizadas, aproximadamente 812 KB en total.
- `assets/originals/`: originales PNG de las ilustraciones.
- `assets/prompts-first-batch.json` y `assets/prompts-second-batch.json`: prompts usados con la herramienta integrada de generación de imágenes.

El botón y el QR del cierre apuntan a **https://github.com/AugustoAleGon**, según lo solicitado. El QR se genera durante la compilación a partir del contacto configurado. No se ha configurado un servicio de reservas. La marca personal usa un monograma AG, sin inventar un retrato de Augusto. Juan es un personaje ilustrado; sus resultados se presentan como parte de la historia del pitch.

## Verificar

```sh
npm run build
npm run test:e2e
```

Las pruebas de navegador usan Google Chrome instalado y comprueban las 15 diapositivas, navegación e historial, contacto, imágenes, notas, cronómetro, límites del diseño, móvil e impresión.
