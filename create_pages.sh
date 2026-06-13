#!/bin/bash

# Generar plantilla base
generate_page() {
    title="$1"
    content="$2"
    filename="$3"

cat <<HTML > "$filename"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title | Golondrina Guerrera</title>
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
                <h2>$title</h2>
            </div>
            $content
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
</html>
HTML
}

generate_page "Cuentos y Canciones" "<div class='proyectos-grid'><div class='producto-card'><div class='producto-info'><h3>Cuento del pajarito</h3><p>Un cuento sensorial...</p><button class='btn btn-primary'>Comprar ahora</button></div></div></div>" "cuentos.html"
generate_page "Juegos y Manualidades" "<div class='proyectos-grid'><div class='producto-card'><div class='producto-info'><h3>Pack de manualidades</h3><p>Crea con tu bebé...</p><button class='btn btn-primary'>Comprar ahora</button></div></div></div>" "juegos.html"

generate_page "Términos y Condiciones" "<p>Términos y condiciones de uso de Golondrina Guerrera...</p>" "terminos.html"
generate_page "Política de Privacidad" "<p>Política de privacidad y protección de datos...</p>" "privacidad.html"
generate_page "Envíos y Devoluciones" "<p>Información sobre envíos y política de devoluciones de nuestros materiales...</p>" "envios.html"

chmod +x create_pages.sh
./create_pages.sh
rm create_pages.sh
