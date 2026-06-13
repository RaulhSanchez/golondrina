/**
 * Prueba de envío de email con PDF adjunto.
 * Ejecutar ANTES de desplegar para verificar que Resend funciona.
 *
 * Uso:
 *   node scripts/test-email.js tu@correo.com
 */

require('dotenv').config({ path: '.env' });
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const destinatario = process.argv[2];

if (!destinatario) {
    console.error('❌ Falta el email de destino.');
    console.error('   Uso: node scripts/test-email.js tu@correo.com');
    process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
    console.error('❌ Falta RESEND_API_KEY en el archivo .env');
    console.error('   Crea el archivo .env con: RESEND_API_KEY=re_...');
    process.exit(1);
}

const PDF_PATH = path.join(
    'products', 'cuentos', 'arca-de-noe', 'assets', 'pages',
    'Canción Arca de Noe Alto Contraste.pdf'
);

async function main() {
    console.log(`\n📧 Enviando PDF a: ${destinatario}`);
    console.log(`📄 PDF: ${PDF_PATH}`);

    if (!fs.existsSync(PDF_PATH)) {
        console.error(`❌ PDF no encontrado en: ${PDF_PATH}`);
        process.exit(1);
    }

    const pdfBuffer = fs.readFileSync(PDF_PATH);
    console.log(`✓ PDF leído (${Math.round(pdfBuffer.length / 1024)} KB)`);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',   // dominio de prueba de Resend, funciona sin verificar
        to: destinatario,
        subject: '🎵 TEST — Tus láminas de El Arca de Noé',
        html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
                <h2 style="color:#2C3E50;">✅ Test de envío correcto</h2>
                <p>Este es un email de prueba de Golondrina Guerrera.</p>
                <p>Adjunto encontrarás el PDF <strong>El Arca de Noé</strong>.</p>
                <p style="color:#888;font-size:13px;">Este email se envía desde el script de test local.</p>
            </div>
        `,
        attachments: [
            {
                filename: 'El Arca de Noé · Golondrina Guerrera.pdf',
                content: pdfBuffer.toString('base64')
            }
        ]
    });

    if (error) {
        console.error('❌ Error de Resend:', JSON.stringify(error, null, 2));
        process.exit(1);
    }

    console.log(`\n✅ Email enviado correctamente`);
    console.log(`   ID: ${data.id}`);
    console.log(`\n👉 Revisa la bandeja de ${destinatario}`);
    console.log('   (y la carpeta de spam por si acaso)\n');
}

main().catch(err => {
    console.error('❌ Error inesperado:', err.message);
    process.exit(1);
});
