const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const PRODUCTS_BY_PAYMENT_LINK = {
  [process.env.PAYMENT_LINK_ARCA_DE_NOE]: {
    id: 'arca-de-noe',
    title: 'El Arca de Noé',
    pdfFile: 'products/cuentos/arca-de-noe/assets/pages/Cancion-Arca-de-Noe-Alto-Contraste.pdf'
  },
  [process.env.PAYMENT_LINK_COCODRILO_EN_LA_CUEVA]: {
    id: 'cocodrilo-en-la-cueva',
    title: 'Cocodrilo en la Cueva',
    pdfFile: 'products/cuentos/cocodrilo-en-la-cueva/assets/pages/Cocodrilo-en-la-Cueva.pdf'
  },
  [process.env.PAYMENT_LINK_ESTRELLITA_DONDE_ESTAS]: {
    id: 'estrellita-donde-estas',
    title: 'Estrellita ¿Dónde Estás?',
    pdfFile: 'products/cuentos/estrellita-donde-estas/assets/pages/Estrellita-donde-estas.pdf'
  }
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Vercel requiere leer el body raw para verificar la firma de Stripe
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Firma del webhook inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return res.status(200).send('Evento ignorado');
  }

  const session = stripeEvent.data.object;
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name ?? '';

  if (!customerEmail) {
    console.error('Sin email en la sesión:', session.id);
    return res.status(200).send('Sin email, omitido');
  }

  const paymentLinkId = session.payment_link;
  const product = PRODUCTS_BY_PAYMENT_LINK[paymentLinkId];

  if (!product) {
    console.warn('Payment link no mapeado:', paymentLinkId);
    return res.status(200).send('Producto no reconocido, omitido');
  }

  const pdfPath = path.join(process.cwd(), product.pdfFile);
  let pdfBuffer;
  try {
    pdfBuffer = fs.readFileSync(pdfPath);
  } catch (err) {
    console.error('PDF no encontrado en:', pdfPath);
    return res.status(200).send('PDF no encontrado');
  }

  try {
    await transporter.sendMail({
      from: `Golondrina Guerrera <${process.env.GMAIL_USER}>`,
      to: customerEmail,
      subject: `🎵 Tus láminas de "${product.title}" ya están aquí`,
      html: buildEmailHtml(product.title, customerName),
      attachments: [
        {
          filename: `${product.title} - Golondrina Guerrera.pdf`,
          content: pdfBuffer
        }
      ]
    });

    console.log(`✓ PDF enviado a ${customerEmail} — producto: ${product.id} — sesión: ${session.id}`);
  } catch (err) {
    console.error('Error al enviar email:', err.message);
    return res.status(500).send('Error al enviar email');
  }

  return res.status(200).send('OK');
}

function buildEmailHtml(productTitle, customerName) {
  const greeting = customerName ? `Hola ${customerName.split(' ')[0]},` : 'Hola,';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tus láminas de ${productTitle}</title>
</head>
<body style="margin:0;padding:0;background:#FFFBF5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(44,62,80,0.1);">

    <div style="background:linear-gradient(135deg,#FFD1DC 0%,#E2D9F3 100%);padding:40px 40px 32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:1px;color:#FF9EAB;text-transform:uppercase;">Golondrina Guerrera</p>
      <h1 style="margin:0;font-size:26px;font-weight:800;color:#2C3E50;line-height:1.3;">¡Ya tienes tus láminas! 🎶</h1>
    </div>

    <div style="padding:40px;">
      <p style="margin:0 0 16px;font-size:16px;color:#4A4A4A;line-height:1.7;">${greeting}</p>
      <p style="margin:0 0 16px;font-size:16px;color:#4A4A4A;line-height:1.7;">
        Adjunto encontrarás el PDF con las láminas de <strong style="color:#2C3E50;">${productTitle}</strong>. ¡Listas para imprimir y cantar! 🎵
      </p>
      <div style="background:#FFFBF5;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#2C3E50;">Cómo usarlas:</p>
        <p style="margin:0 0 8px;font-size:14px;color:#4A4A4A;line-height:1.6;">🖨️ <strong>Imprime</strong> en A4 o A5</p>
        <p style="margin:0 0 8px;font-size:14px;color:#4A4A4A;line-height:1.6;">🛡️ <strong>Plastifica</strong> para que duren más</p>
        <p style="margin:0;font-size:14px;color:#4A4A4A;line-height:1.6;">🎵 <strong>Canta</strong> mostrando cada lámina a tu bebé</p>
      </div>
      <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
        Con mucho cariño,<br>
        <strong style="color:#2C3E50;">Ainara</strong><br>
        <span style="font-size:13px;color:#888;">Golondrina Guerrera</span>
      </p>
    </div>

    <div style="background:#2C3E50;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.5);">
        ¿Alguna duda? Escríbenos a <a href="mailto:${process.env.GMAIL_USER}" style="color:#FFD1DC;">${process.env.GMAIL_USER}</a>
      </p>
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">© 2026 Golondrina Guerrera</p>
    </div>

  </div>
</body>
</html>`;
}
