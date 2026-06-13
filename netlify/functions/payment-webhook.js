const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Mapa: Payment Link ID → producto
// El ID del payment link está en Stripe Dashboard > Payment Links > detalle del link
// Es "plink_XXXXXX", diferente a la URL buy.stripe.com/...
const PRODUCTS_BY_PAYMENT_LINK = {
  [process.env.PAYMENT_LINK_ARCA_DE_NOE]: {
    id: 'arca-de-noe',
    category: 'cuentos',
    title: 'El Arca de Noé',
    pdfFile: 'products/cuentos/arca-de-noe/assets/pages/Cancion-Arca-de-Noe-Alto-Contraste.pdf'
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Netlify puede base64-encodear el body según el Content-Type
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  const sig = event.headers['stripe-signature'];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Firma del webhook inválida:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Solo procesamos pagos completados
  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: 'Evento ignorado' };
  }

  const session = stripeEvent.data.object;

  // El email lo recoge Stripe automáticamente durante el pago
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name ?? '';

  if (!customerEmail) {
    console.error('Sin email en la sesión:', session.id);
    return { statusCode: 200, body: 'Sin email, omitido' };
  }

  // Identificar el producto por el ID del payment link
  const paymentLinkId = session.payment_link;
  const product = PRODUCTS_BY_PAYMENT_LINK[paymentLinkId];

  if (!product) {
    // Payment link desconocido — no es un error, puede ser otro producto futuro
    console.warn('Payment link no mapeado:', paymentLinkId);
    return { statusCode: 200, body: 'Producto no reconocido, omitido' };
  }

  // Leer el PDF pre-generado
  const pdfPath = path.join(process.cwd(), product.pdfFile);
  let pdfBuffer;
  try {
    pdfBuffer = fs.readFileSync(pdfPath);
  } catch (err) {
    console.error('PDF no encontrado en:', pdfPath);
    // Devolvemos 200 para que Stripe no reintente — registramos el error para revisión manual
    return { statusCode: 200, body: 'PDF no encontrado' };
  }

  // Enviar email con el PDF adjunto
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: 'Golondrina Guerrera <onboarding@resend.dev>',
      to: customerEmail,
      subject: `🎵 Tus láminas de "${product.title}" ya están aquí`,
      html: buildEmailHtml(product.title, customerName),
      attachments: [
        {
          filename: `${product.title} · Golondrina Guerrera.pdf`,
          content: pdfBuffer.toString('base64')
        }
      ]
    });

    if (error) throw new Error(JSON.stringify(error));

    console.log(`✓ PDF enviado a ${customerEmail} — producto: ${product.id} — sesión: ${session.id}`);
  } catch (err) {
    console.error('Error al enviar email:', err);
    return { statusCode: 500, body: 'Error al enviar email' };
  }

  return { statusCode: 200, body: 'OK' };
};

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

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#FFD1DC 0%,#E2D9F3 100%);padding:40px 40px 32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:1px;color:#FF9EAB;text-transform:uppercase;">Golondrina Guerrera</p>
      <h1 style="margin:0;font-size:26px;font-weight:800;color:#2C3E50;line-height:1.3;">
        ¡Ya tienes tus láminas! 🎶
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <p style="margin:0 0 16px;font-size:16px;color:#4A4A4A;line-height:1.7;">${greeting}</p>
      <p style="margin:0 0 16px;font-size:16px;color:#4A4A4A;line-height:1.7;">
        Adjunto a este correo encontrarás el PDF con las láminas de
        <strong style="color:#2C3E50;">${productTitle}</strong>.
        Están listas para imprimir y cantar. 🎵
      </p>

      <!-- Instrucciones -->
      <div style="background:#FFFBF5;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#2C3E50;">Cómo usarlas:</p>
        <p style="margin:0 0 8px;font-size:14px;color:#4A4A4A;line-height:1.6;">
          🖨️ <strong>Imprime</strong> en A4 o A5 — el PDF ya viene con el tamaño perfecto
        </p>
        <p style="margin:0 0 8px;font-size:14px;color:#4A4A4A;line-height:1.6;">
          🛡️ <strong>Plastifica</strong> las láminas para que aguanten el paso del tiempo
        </p>
        <p style="margin:0;font-size:14px;color:#4A4A4A;line-height:1.6;">
          🎵 <strong>Canta</strong> mostrando cada lámina a tu bebé — señala los animales con el dedo
        </p>
      </div>

      <p style="margin:0 0 8px;font-size:15px;color:#4A4A4A;line-height:1.7;">
        Gracias por confiar en Golondrina Guerrera. Espero que disfrutéis un montón. 💛
      </p>
      <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
        Con mucho cariño,<br>
        <strong style="color:#2C3E50;">Ainara</strong><br>
        <span style="font-size:13px;color:#888;">Golondrina Guerrera</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#2C3E50;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.5);">
        ¿Alguna duda? Escríbenos a
        <a href="mailto:${process.env.FROM_EMAIL}" style="color:#FFD1DC;">${process.env.FROM_EMAIL}</a>
      </p>
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">
        © 2026 Golondrina Guerrera · Has recibido este email porque compraste en nuestra tienda.
      </p>
    </div>

  </div>
</body>
</html>`;
}
