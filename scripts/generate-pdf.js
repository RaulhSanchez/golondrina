/**
 * Genera el PDF de un producto a partir de sus imágenes (JPG/PNG).
 * Ejecutar UNA VEZ antes de desplegar, cada vez que cambies las imágenes.
 *
 * Uso:
 *   npm run generate-pdf
 *   node scripts/generate-pdf.js arca-de-noe cuentos
 */

const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const [,, productId = 'arca-de-noe', category = 'cuentos'] = process.argv;

async function generatePDF(productId, category) {
  const basePath  = path.join('products', category, productId);
  const metaPath  = path.join(basePath, 'meta.json');
  const pagesPath = path.join(basePath, 'assets', 'pages');
  const outputPath = path.join(basePath, 'assets', `${productId}.pdf`);

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

  console.log(`Generando PDF para: ${meta.title}`);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(meta.title);
  pdfDoc.setAuthor('Golondrina Guerrera');
  pdfDoc.setSubject(meta.subtitle ?? '');

  let pagesAdded = 0;

  for (const page of meta.pages) {
    const imgPath = path.join(pagesPath, page.file);

    if (!fs.existsSync(imgPath)) {
      console.warn(`  ⚠ Imagen no encontrada, saltando: ${imgPath}`);
      continue;
    }

    const imgBytes = fs.readFileSync(imgPath);
    const ext = path.extname(page.file).toLowerCase();

    let image;
    try {
      if (ext === '.jpg' || ext === '.jpeg') {
        image = await pdfDoc.embedJpg(imgBytes);
      } else if (ext === '.png') {
        image = await pdfDoc.embedPng(imgBytes);
      } else {
        console.warn(`  ⚠ Formato no soportado (${ext}), saltando: ${page.file}`);
        console.warn('     Convierte las imágenes a JPG o PNG antes de generar el PDF.');
        continue;
      }
    } catch (err) {
      console.warn(`  ⚠ No se pudo incrustar ${page.file}: ${err.message}`);
      continue;
    }

    // Página A4 apaisada (297 × 210 mm en puntos)
    const A4_W = 841.89;
    const A4_H = 595.28;

    const pdfPage = pdfDoc.addPage([A4_W, A4_H]);

    // Escalar imagen para que quepa en la página manteniendo proporción
    const scale = Math.min(A4_W / image.width, A4_H / image.height);
    const w = image.width  * scale;
    const h = image.height * scale;
    const x = (A4_W - w) / 2;
    const y = (A4_H - h) / 2;

    pdfPage.drawImage(image, { x, y, width: w, height: h });
    pagesAdded++;
    console.log(`  ✓ Lámina ${pagesAdded}: ${page.file}`);
  }

  if (pagesAdded === 0) {
    console.error('\n✗ No se añadió ninguna página. Comprueba que las imágenes existen en:');
    console.error(`  ${pagesPath}`);
    process.exit(1);
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  const sizeKB = Math.round(pdfBytes.length / 1024);
  console.log(`\n✓ PDF generado: ${outputPath} (${sizeKB} KB, ${pagesAdded} páginas)`);
}

generatePDF(productId, category).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
