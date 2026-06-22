import os

template = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Golondrina Guerrera</title>
    <meta name="description" content="{description}">
    <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <div class="container nav-container">
            <div class="logo">
                <a href="index.html" style="display:flex; align-items:center; gap:10px;">
                    <img src="image.png" alt="Logo" class="logo-image">
                    <span class="logo-text">Golondrina <span>Guerrera</span></span>
                </a>
            </div>
            <nav class="nav-links">
                <a href="index.html#proyectos">Proyectos</a>
            </nav>
            <a href="index.html#proyectos" class="btn btn-primary btn-sm">Volver</a>
        </div>
    </header>

    <main style="padding: 150px 0 100px; min-height: 70vh;">
        <div class="container">
            <div class="section-header">
                <h2>{title}</h2>
            </div>
            {content}
        </div>
    </main>

    <footer class="footer">
        <div class="container footer-container">
            <div class="footer-brand">
                <div class="logo">
                    <img src="image.png" alt="Logo" class="logo-image">
                    <span class="logo-text">Golondrina <span>Guerrera</span></span>
                </div>
                <p>Inspiración, juegos y amor para ti y tu bebé.</p>
            </div>
            <div class="footer-links">
                <div class="link-group">
                    <h4>Legal</h4>
                    <a href="terminos.html">Términos y Condiciones</a>
                    <a href="privacidad.html">Política de Privacidad</a>
                    <a href="envios.html">Envíos y Devoluciones</a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>"""

pages = [
    ("Cuentos y Canciones", "cuentos.html", "Descubre nuestra colección de cuentos sensoriales y canciones para bebés.", "<div class='proyectos-grid'><div class='producto-card'><div class='producto-img bg-pink' style='font-size:50px;'><i class='fa-solid fa-book'></i></div><div class='producto-info'><h3>Cuento del pajarito</h3><p>Un cuento sensorial lleno de magia...</p><button class='btn btn-primary'>Comprar ahora</button></div></div></div>"),
    ("Juegos y Manualidades", "juegos.html", "Ideas creativas, juegos y manualidades para disfrutar y aprender con tu bebé en casa.", "<div class='proyectos-grid'><div class='producto-card'><div class='producto-img bg-lilac' style='font-size:50px;'><i class='fa-solid fa-gamepad'></i></div><div class='producto-info'><h3>Pack de manualidades</h3><p>Crea con tu bebé en casa...</p><button class='btn btn-primary'>Comprar ahora</button></div></div></div>"),
    ("Términos y Condiciones", "terminos.html", "Términos y condiciones de uso de la web Golondrina Guerrera.", "<div style='max-width:800px; margin:0 auto; font-size:1.1rem; color:#666;'><p>Bienvenido a Golondrina Guerrera. Al utilizar este sitio web, aceptas los siguientes términos...</p><p><b>1. Uso del sitio</b><br>El contenido de las páginas de este sitio web es para tu información general y uso exclusivo.</p></div>"),
    ("Política de Privacidad", "privacidad.html", "Política de privacidad y protección de datos de Golondrina Guerrera.", "<div style='max-width:800px; margin:0 auto; font-size:1.1rem; color:#666;'><p>Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información.</p><p><b>Recopilación de datos</b><br>Recopilamos información cuando te registras en nuestro sitio o realizas un pedido.</p></div>"),
    ("Envíos y Devoluciones", "envios.html", "Información detallada sobre nuestra política de envíos y devoluciones en Golondrina Guerrera.", "<div style='max-width:800px; margin:0 auto; font-size:1.1rem; color:#666;'><p>Información detallada sobre nuestra política de envíos y devoluciones.</p><p><b>Envíos</b><br>Realizamos envíos a toda la península en 24/48 horas.</p><p><b>Devoluciones</b><br>Tienes 14 días para devolver cualquier producto en su estado original.</p></div>"),
]

for title, filename, description, content in pages:
    with open(filename, "w", encoding="utf-8") as f:
        f.write(template.format(title=title, description=description, content=content))

print("Páginas generadas correctamente.")
