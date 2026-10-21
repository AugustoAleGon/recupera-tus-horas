# Recupera tus horas

Presentación web de Augusto González: 15 diapositivas en español para una charla de 8–10 minutos con participación de Andrés y del público sobre automatización e IA. Construida con Astro, TypeScript y CSS; tipografía e ilustraciones locales.

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

También hay botones y navegación por deslizamiento horizontal en móvil. Cada diapositiva tiene un enlace directo, por ejemplo `/#/12`. El cronómetro es manual; las diapositivas no avanzan solas. Los tiempos sugeridos suman 600 segundos y sirven como referencia para ensayar el guion completo. Reservan 45 segundos para Andrés y 60 segundos para el público; ampliar estas intervenciones requiere abreviar el relato.

### Notas privadas con dos pantallas

1. Configura las pantallas en modo **extendido**, sin duplicarlas.
2. Pulsa **Vista del presentador ↗**, arriba en la presentación. Si el navegador bloquea la ventana, permite ventanas emergentes para este sitio y vuelve a pulsar el botón.
3. Deja la nueva ventana con las notas en tu pantalla y mueve la ventana original a la pantalla del público.
4. En la ventana del público, pulsa **F** para mostrar solo la diapositiva a pantalla completa.
5. Avanza con **← / →** o los botones desde cualquiera de las dos ventanas. Las notas y la vista previa se actualizan juntas. Puedes controlar el cronómetro desde la vista del presentador con **T**.

La vista del presentador muestra las notas completas, el tiempo sugerido, la diapositiva actual y el título de la siguiente. Puedes recargar cualquiera de las ventanas y vuelven a conectarse; al recargar la presentación se reinicia el cronómetro. Si cierras la vista del presentador, pulsa **N** en la presentación para abrirla otra vez.

Antes de abrir la vista del presentador, **Notas / N** permite consultar las notas sobre la misma diapositiva para ensayar. Una vez abierta la vista privada, **N** lleva a esa ventana y las notas no se superponen a la proyección.

Puedes imprimir las 15 diapositivas o guardarlas como PDF desde el navegador; activa los gráficos de fondo y desactiva los encabezados y pies del navegador.

Los tres hallazgos se desarrollan solo dentro de la historia de Juan. Después aparece el caso personal de Augusto: pasaba horas extrayendo facturas para la declaración de renta y lo resolvió con un agente que extrae los archivos y los comprime en un ZIP. Las notas incluyen la intervención de Andrés en la diapositiva 10 y la participación del público en la diapositiva 14 y la reflexión final y el llamado a la acción en la diapositiva 15. El cierre invita a escanear el código QR y comentar la palabra **AI** en el post de Instagram para acceder a un recurso gratuito.

## Editar

- `src/pages/index.astro`: texto visible, diagramas, gráfico y composición de las 15 diapositivas.
- `src/data/presentation.ts`: contacto, títulos del índice, tiempos y notas del relato.
- `src/styles/global.css`: identidad visual, diseño adaptable y estilos de impresión.
- `src/scripts/presentation.ts`: controles, enlaces, notas y cronómetro.
- `public/images/`: 12 ilustraciones WebP optimizadas, aproximadamente 812 KB en total.
- `assets/originals/`: originales PNG de las ilustraciones.
- `assets/prompts-first-batch.json` y `assets/prompts-second-batch.json`: prompts usados con la herramienta integrada de generación de imágenes.

El botón y el QR del cierre apuntan a **https://www.instagram.com/reels/DerUMk4BeHG/**. El llamado a la acción es comentar la palabra **AI** en ese post. El QR se genera durante la compilación a partir del contacto configurado. Juan es un personaje ilustrado; sus resultados se presentan como parte de la historia del pitch.

## Verificar

```sh
npm run build
npm run test:e2e
```

Las pruebas de navegador usan Google Chrome instalado y comprueban las 15 diapositivas, navegación e historial, contacto, imágenes, notas, cronómetro, límites del diseño, móvil e impresión.
