# G&G — Sitio Corporativo (Landing)

Descripción
-
Sitio de presentación para G&G, una consultora de ingeniería y gestión en Seguridad y Salud en el Trabajo (SG-SST). Proyecto construido con React + Vite y estilos con Tailwind CSS. Está pensado como landing corporativa para mostrar servicios, proyectos y facilitar el contacto comercial.

Estructura del repositorio
-
- `index.html` — plantilla raíz usada por Vite.
- `src/` — código fuente en React (componentes, entradas y estilos).
- `public/` — activos estáticos opcionales.
- `package.json` — metadatos del proyecto y scripts útiles.

Instalación y ejecución
-
1. Instalar dependencias:

```bash
npm install
```

2. Iniciar servidor de desarrollo (hot-reload):

```bash
npm run dev
```

3. Compilar para producción:

```bash
npm run build
```

Despliegue rápido
-
- El contenido de producción se genera en la carpeta `dist/` tras `npm run build` y puede servirse en Netlify, Vercel, GitHub Pages o cualquier servidor estático.

Dependencias
-
Dependencias del proyecto (definidas en `package.json`):

- Dependencias (runtime):
	- `react` ^18.3.1
	- `react-dom` ^18.3.1

- Dependencias de desarrollo (devDependencies):
	- `@vitejs/plugin-react` ^4.3.1
	- `autoprefixer` ^10.4.19
	- `postcss` ^8.4.35
	- `tailwindcss` ^3.4.4
	- `vite` ^5.4.1

Comandos de instalación (alternativas):

- Instalar desde `package.json` (recomendado):

```bash
npm install
```

- Instalar explicitando paquetes (instala exactamente las dependencias listadas arriba):

```bash
npm install react@^18.3.1 react-dom@^18.3.1
npm install -D @vitejs/plugin-react@^4.3.1 autoprefixer@^10.4.19 postcss@^8.4.35 tailwindcss@^3.4.4 vite@^5.4.1
```

Convenciones y personalización
-
- Colores y tipografías se gestionan desde Tailwind; ajusta `tailwind.config.js` según la identidad de marca.
- Las rutas y el contenido principal están en `src/App.jsx` y los componentes en `src/components/`.

Contacto
-
Para consultas o cambios en el proyecto, contacta a: `proyectos@gng.co`.

Licencia
-
Este repositorio es un ejemplo de landing; adapta la licencia según tu organización antes de distribuir.
