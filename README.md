# Minehub Cup

Web de clasificaciones. Todo el mundo ve `index.html`; solo quien tenga acceso al repositorio puede cambiar los puntos.

## Publicarla (GitHub Pages, gratis)
1. Crea una cuenta en github.com y un repositorio nuevo (por ejemplo `minehub-cup`).
2. Sube todo el contenido de esta carpeta a la raíz del repositorio (Add file > Upload files).
3. En el repositorio: Settings > Pages > Source: "Deploy from a branch" > rama `main`, carpeta `/ (root)` > Save.
4. En un par de minutos la web estará en `https://TU-USUARIO.github.io/minehub-cup/`.

## Cambiar puntos
1. Abre `admin.html` (en tu web publicada o desde la carpeta en tu ordenador).
2. Añade jugadores, cambia puntos o quita jugadores. La cabeza de cada skin sale al escribir el nombre.
3. Pulsa "Descargar data.json".
4. En GitHub, sube ese `data.json` al repositorio (Add file > Upload files, sobrescribe el existente).
5. En un minuto, todos verán los puntos nuevos.

Nadie más puede cambiar los puntos: aunque otros abran `admin.html`, no pueden subir nada a tu repositorio.

## Archivos
- `index.html`: la web pública.
- `admin.html`: el editor (no aparece enlazado en la web pública).
- `data.json`: los puntos. Es el único archivo que cambias.
- `app.js`, `style.css`, imágenes: el diseño.
