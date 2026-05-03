# Roscio 360° Explorer

Una experiencia educativa 3D interactiva para explorar el relieve del municipio Juan Germán Roscio, estado Guárico, Venezuela.

## Características
- **Lobby 3D Interactivo**: Sistema de selección de zonas usando esferas flotantes animadas.
- **Terrenos Procedurales**: Modelado matemático para representar la topografía de Los Morros, el Valle y el Piedemonte.
- **Tours Guiados**: Rutas automáticas de cámara a través de los puntos de interés.
- **Hotspots Educativos**: Información sobre hitos geográficos importantes.
- **Modos de Vista**: Alterna entre mapas de elevación (topográfico) y texturas realistas (satélite).
- **Desafíos Interactivos**: Módulos de quiz integrados en el recorrido.

## Stack Tecnológico
- **React 19**
- **Vite 8**
- **Three.js** con `@react-three/fiber` y `@react-three/drei`
- **Framer Motion** para transiciones de UI
- **Simplex-Noise** para generación procedural de relieve

## Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Compilar para producción:
   ```bash
   npm run build
   ```

## Despliegue en Vercel

Este proyecto está configurado y optimizado para ser desplegado en Vercel.

1. Haz push de este repositorio a GitHub.
2. En tu cuenta de Vercel, crea un nuevo proyecto e importa el repositorio de GitHub.
3. Vercel detectará automáticamente que es un proyecto **Vite**.
4. Haz clic en **Deploy**.

No se requieren variables de entorno.
