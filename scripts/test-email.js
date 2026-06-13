/**
 * Prueba de envío de email con PDF adjunto via Gmail SMTP.
 * Uso: node scripts/test-email.js tu@correo.com
 */

require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const destinatario = process.argv[2];

if (!destinatario) {
    console.error('❌ Falta el email de destino.');
    console.error('   Uso: node scripts/test-email.js tu@correo.com');
    process.exit(1);
}

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Faltan GMAIL_USER o GMAIL_APP_PASSWORD en .env');
    process.exit(1);
}

const PDF_PATH = path.join(
    'products', 'cuentos', 'arca-de-noe', 'assets', 'pages',
    'Cancion-Arca-de-Noe-Alto-Contraste.pdf'
);

async function main() {
    console.log(`\n📧 Enviando PDF a: ${destinatario}`);
    console.log(`📄 PDF: ${PDF_PATH}`);

    const pdfBuffer = fs.readFileSync(PDF_PATH);
    console.log(`✓ PDF leído (${Math.round(pdfBuffer.length / 1024)} KB)`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `Golondrina Guerrera <${process.env.GMAIL_USER}>`,
        to: destinatario,
        subject: '🎵 Tus láminas de "El Arca de Noé" ya están aquí',
        html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
                <h2 style="color:#2C3E50;">🎵 ¡Ya tienes tus láminas!</h2>
                <p>Adjunto encontrarás el PDF <strong>El Arca de Noé</strong>. ¡Listas para imprimir y cantar!</p>
                <p style="color:#888;font-size:13px;">Email enviado desde el script de prueba local.</p>
            </div>
        `,
        attachments: [
            {
                filename: 'El Arca de Noé · Golondrina Guerrera.pdf',
                content: pdfBuffer
            }
        ]
    });

    console.log(`\n✅ Email enviado correctamente a ${destinatario}`);
    console.log('   Revisa la bandeja de entrada (y spam por si acaso)\n');
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
