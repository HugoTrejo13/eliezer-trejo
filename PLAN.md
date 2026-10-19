# Portafolio web — Hugo Eliezer Trejo

> Documento de definición: qué se construye, cómo se ve y con qué. Se aprueba antes de escribir código.

- **Dominio:** `hugo-eliezer.lat` · **Hosting:** Vercel (Hobby, gratis)
- **Referencias:** [cesar-cortez.com](https://cesar-cortez.com/) (principal: estructura y arte low-poly 3D) · [juan-bovio.xyz](https://www.juan-bovio.xyz/) (detalles: HUD, proyectos con Problema→Solución→Impacto)
- **Tema:** Green Hill Zone (saga Sonic). El 3D lo trae muy marcado; el resto del sitio es un portafolio profesional con guiños sutiles.
- **Principio:** el mínimo de archivos y de código que siga siendo funcional y se vea bien en escritorio y celular.

---

## 1. Objetivo
Una sola página, en inglés, que en 30 segundos le deje claro a un reclutador:
1. Que Hugo es un estudiante de Ingeniería en Computación con enfoque Backend & Cloud, **open to internships**.
2. Qué ha construido (MonPoint, HPE Top 6 Finalist) y dónde trabajó (iNBest).
3. Con qué tecnologías trabaja y qué certificaciones tiene.
4. Cómo contactarlo (formulario, email, LinkedIn, GitHub, CV).

## 2. Stack
| Pieza | Elección |
|---|---|
| Base | **React + Vite** (JavaScript/JSX, sin TypeScript, para tener menos configuración) |
| Estilos | **Tailwind CSS v4** (`@tailwindcss/vite`, los tokens van en `@theme` dentro del CSS) |
| 3D | **Three.js** con `@react-three/fiber` + `@react-three/drei` |
| Animaciones | CSS + un `IntersectionObserver` (sin Framer Motion) |
| Formulario | **Web3Forms** (gratis, sin backend, envía al Gmail) |
| SEO / compartir | Meta tags **Open Graph** + Twitter card en `index.html`, imagen `og.png` 1200×630 |
| Deploy | **Vercel** conectado a GitHub (detecta Vite solo) + Vercel Analytics |

Dependencias: `react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`, `tailwindcss`, `@tailwindcss/vite`, `@vercel/analytics`. Nada más.

## 3. Estructura de archivos (≈15 archivos)
```
eliezer-trejo/
├─ index.html          # meta tags + OG + Google Fonts
├─ package.json
├─ vite.config.js      # react + tailwind
├─ vercel.json         # rewrite de todo a index.html (para el 404 GAME OVER)
├─ .gitignore          # ver sección 11.1
├─ .env.example        # nombres de variables, sin valores
├─ public/
│  ├─ models/props.glb # palmeras, flores, rocas (CC0)
│  ├─ og.png           # imagen al compartir (captura del hero)
│  ├─ favicon.svg      # anillo dorado
│  └─ Hugo_Eliezer_Trejo_CV.pdf
└─ src/
   ├─ main.jsx         # monta App + Analytics
   ├─ index.css        # Tailwind + tokens + animaciones
   ├─ data.js          # TODO el contenido (sale del CV); editar aquí = editar el sitio
   ├─ App.jsx          # layout + secciones + HUD + konami + 404
   └─ Planet.jsx       # escena 3D (planeta, anillos, rocas, estrellas)
```
Si `App.jsx` pasa de ~400 líneas, se separa en `Sections.jsx`, pero no antes.

## 4. Identidad visual

### 4.1 Paleta "Noche Green Hill"
| Token | Hex | Uso |
|---|---|---|
| `bg` | `#070B1A` | Fondo (azul noche) |
| `surface` | `#0F1630` | Tarjetas, navbar, formulario |
| `border` | `#1C2547` | Bordes |
| `text` | `#E9EDF7` | Texto principal |
| `muted` | `#8E97B5` | Texto secundario |
| `grass` | `#3DDC6A` | Acento principal (links, sección activa) |
| `ring` | `#FFC93C` | Anillos, HUD, CTA principal, modo Super |
| `sonic` | `#2F6BFF` | Degradados, botones secundarios |
| `soil` | `#C8743A` / `#8A4A22` | Patrón de cuadros (detalles y planeta) |

El nombre del hero va en degradado `sonic → grass`. En **modo Super** (Konami) el acento pasa a `ring` y el degradado a dorado.

### 4.2 Tipografía
- **Poppins** (400/500/700/800): títulos y texto.
- **Press Start 2P**: solo HUD, rótulos de zona (`ABOUT ZONE · ACT 1`), `ACT CLEAR!` y `GAME OVER`.
- Las dos se cargan con Google Fonts en `index.html` (`display=swap`).

### 4.3 Patrón de encabezado de sección (de César, con guiño)
```
ABOUT ZONE · ACT 1        ← Press Start 2P, 10–12px, color grass
Overview.                 ← Poppins 800, 40–60px
```

### 4.4 Movimiento
- Las secciones entran con fade + subida (clase CSS que se activa con IntersectionObserver).
- Las tarjetas se elevan y se inclinan levemente al pasar el mouse (solo CSS).
- Fondo de estrellas dentro del canvas 3D del hero; en el resto del sitio, estrellas CSS sutiles.
- Con `prefers-reduced-motion`: sin autorrotación ni animaciones de entrada.

## 5. El planeta Green Hill (Planet.jsx)
Inspirado en el planeta low-poly de César, pero con estética Green Hill. Ninguna pieza usa assets de SEGA.

**Cómo lo hace César:** carga el modelo "Stylized planet" de Sketchfab (autor cmzw, licencia CC-BY): un `.gltf` con un `.bin` de ~1.6 MB y 2 texturas. Se ve bien, pero es genérico y pide crédito.

**Cómo lo hacemos nosotros (híbrido):**
| Pieza | Cómo | Por qué |
|---|---|---|
| Planeta | **Hecho con código.** Icosfera low-poly con `flatShading` y un color por cara | Ningún modelo existente se ve como Green Hill; así tenemos control total y pesa 0 KB |
| Palmeras, girasoles, arbustos, rocas | **Un solo `public/models/props.glb`** armado con modelos **CC0** (Quaternius / Kenney), comprimido y con meta de ≤ 300 KB | Se ven mucho más pulidos que conos y cilindros, y CC0 no exige crédito (igual lo damos en el footer) |
| Loop, tótem, poste de checkpoint, anillos | **Hechos con código** (torus, cilindros, cajas) | Son formas simples y muy de la saga; no hay modelos libres que encajen |

- **Núcleo:** la parte de arriba es pasto en 2 tonos de verde. Hay **acantilados con el patrón de cuadros café/naranja** donde el terreno sube, y 1–2 **lagos azules** (Green Hill tiene agua y cascadas). Las caras se elevan un poco al azar para que el relieve parezca de "tiles", como en César.
- **Decoración en la superficie:** 5–7 palmeras, 4–6 girasoles, arbustos, **un loop** (torus a medio enterrar), un tótem y un poste de checkpoint.
- **Alrededor:** rocas low-poly flotando (como César) y **anillos dorados** (torus metálico dorado) en 2–3 órbitas inclinadas, girando sobre su eje.
- Si `props.glb` no llegara a verse bien, el plan B es hacer esas piezas con código. El resto del plan no cambia.
- **Fondo:** campo de estrellas (`<Stars>` de drei).
- **Interacción:** `OrbitControls` con autorrotación lenta, sin zoom ni pan. El planeta sigue un poco al mouse. **Clic en un anillo** = destello, desaparece, `RINGS +1` en el HUD y reaparece a los pocos segundos.
- **Celular:** el mismo planeta con la mitad de anillos y rocas, `dpr` máximo 1.5 y menos estrellas.
- **Carga:** con `lazy()` + `Suspense`. Mientras carga, el texto del hero ya se ve y el espacio del canvas muestra un anillo girando hecho con CSS.

## 6. Layout y secciones

```
┌──────────────────────────────────────────────────────────┐
│ HUGO ELIEZER        About  Work  Projects  Stack  Contact│ navbar fijo
│ RINGS 012   TIME 0:42   ● OPEN TO INTERNSHIPS            │ HUD (pixel, dorado)
├──────────────────────────────────────────────────────────┤
│ HERO      texto a la izquierda │ planeta 3D a la derecha │ (móvil: texto arriba,
│                                │                         │  planeta abajo)
├──────────────────────────────────────────────────────────┤
│ ABOUT · WORK · PROJECTS · STACK · EMERALDS · CONTACT     │
│ FOOTER                                  [resorte ↑]      │
└──────────────────────────────────────────────────────────┘
```
En el celular, los links del navbar pasan a un menú hamburguesa y el HUD queda en una sola línea compacta (`RINGS 12 · 0:42 · ●`).

### 6.1 HUD
- `RINGS` = anillos recogidos en el planeta (3 dígitos, como en el juego).
- `TIME` = tiempo en la página (`m:ss`).
- `● OPEN TO INTERNSHIPS` con un punto verde que parpadea.

### 6.2 Hero
- `Hi, I'm` **`Hugo Eliezer`** (degradado) + línea vertical decorativa con punto, como César.
- Rol: **Backend & Cloud Engineer**
- Tagline: *Computer Science Engineering student building backend systems with Java, Spring & the cloud.*
- Chips: `AWS Certified` · `HPE Innovation Challenge Top 6` · `GPA 94/100`
- CTAs: **View projects** (dorado) · **Contact me** (contorno) · *Download CV ↓*
- Indicador de scroll abajo.

### 6.3 About — `ABOUT ZONE · ACT 1` / `Overview.`
Párrafo adaptado del Professional Summary del CV + 4 tarjetas:
1. **Backend Development:** Java, Spring Boot, REST APIs, microservices.
2. **Cloud & Infrastructure:** AWS, Azure, Docker, Linux.
3. **Data & Databases:** PostgreSQL, MySQL, MongoDB, Power BI.
4. **Agile Delivery:** Scrum, Azure DevOps, sprint planning (experiencia PMO).

### 6.4 Experience — `WORK ZONE · ACT 2` / `Experience.`
Timeline vertical en la que cada nodo es un **poste de checkpoint**:
- **iNBest:** PMO Intern · Jul 2025 – May 2026 · los 4 bullets del CV.
- **Universidad de Guadalajara (CUTONALÁ):** B.S. Computer Science Engineering · 2024 – 2027 · GPA 94.13 · 6th semester.

### 6.5 Projects — `PROJECT ZONE · ACT 3` / `Projects.`
3 tarjetas. Cada una con tags, **Problem → Solution → Impact** en pocas líneas y links (GitHub / demo):
1. **MonPoint: POS Monolith to Microservices** · Java, Spring Boot, Spring Security, JWT, RabbitMQ, MongoDB, Eureka, Gateway · *In progress*
2. **HPE Stock Rotation Automation** · Excel VBA, SAP S/4HANA · **Top 6 Finalist, HPE Innovation Challenge 2026** · 5 h → <3 min (97% faster)
3. **This portfolio** · React, Three.js, Tailwind, Vercel · link al repo
Sin modal ni páginas extra: todo cabe en la tarjeta.

### 6.6 Stack — `TECH ZONE` / `Stack.`
Grupos tomados del CV, como chips con ícono:
Languages · Frameworks & APIs · Databases · Cloud & Infra · Project & Data Tools · Dev Tools. Sin barras de porcentaje.

### 6.7 Certifications — `SPECIAL STAGE` / `Chaos Emeralds.`
7 esmeraldas hechas con SVG/CSS (gema low-poly con brillo; **no** son 7 canvas 3D):
| Esmeralda | Certificación | Estado |
|---|---|---|
| 🟢 verde | AWS Certified Cloud Practitioner | ✔ (válida hasta Feb 2029) |
| 🔵 azul | Scrum Fundamentals Certified | ✔ |
| 🟣 morada | Claude Code in Action (Anthropic) | ✔ |
| 🟡 amarilla | Google Prompting Essentials | ✔ Jun 2026 |
| 🔴 roja | MongoDB Java Developer Path | ⏳ apagada, Est. Dec 2026 |
| 🩵 cian | Master Microservices with Spring Boot & Spring Cloud | ⏳ apagada, Est. Dec 2026 |
| ⚪ gris | **???**, la siguiente | silueta |
Debajo: `6 / 7 EMERALDS`. Al pasar el mouse se ve el emisor y la fecha.

### 6.8 Contact — `FINAL ZONE` / `Contact.`
- **Izquierda:** formulario (name, email, message) con Web3Forms, campo honeypot y estados: sending / error.
- **Al enviar con éxito:** banner animado `HUGO GOT THROUGH · ACT CLEAR!` en pixel.
- **Derecha:** links (email con botón de copiar, LinkedIn, GitHub, Download CV).
- El teléfono no aparece como texto en la página, pero el **CV descargable sí lo incluye** (decisión de Hugo).

### 6.9 Footer
`© 2026 Hugo Eliezer Trejo · Built with React & Three.js` + redes + una línea pequeña de créditos de los modelos 3D (Quaternius / Kenney, CC0). El **resorte amarillo** (fijo abajo a la derecha, aparece después del hero) hace un "boing" con CSS y sube al inicio con scroll suave.

## 7. Easter eggs
| Easter egg | Cómo funciona |
|---|---|
| Anillos clicables | Clic en un anillo del planeta → `RINGS +1` en el HUD |
| Konami code | `↑ ↑ ↓ ↓ ← → ← → B A` → **modo Super**: acento dorado, el planeta brilla, chispas en el cursor. Se repite para desactivar |
| Resorte | Botón para volver arriba |
| 404 GAME OVER | Cualquier ruta distinta de `/` muestra una pantalla `GAME OVER` en pixel + `CONTINUE? 9…8…7` con cuenta regresiva que regresa al inicio (o el botón **CONTINUE**). Funciona con un `if` sobre `location.pathname` + `vercel.json`, sin router |

Sin sonido. Nada usa sprites, logos, música ni el personaje de SEGA: todo es arte propio inspirado en Green Hill.

## 8. Responsive
- **Breakpoints de Tailwind:** base (móvil) → `md` (tablet) → `lg` (escritorio).
- **Hero:** una columna en móvil (texto y luego planeta de ~320px de alto); dos columnas en `lg`.
- **Grids:** 1 columna en móvil → 2 en `md` → 3 o 4 en `lg` (tarjetas, proyectos, esmeraldas).
- **Navbar:** hamburguesa debajo de `md`.
- Nada de scroll horizontal y botones táctiles de al menos 44px.
- Se prueba en 375px (iPhone SE), 390px, 768px y 1440px.

## 9. SEO y Open Graph (en index.html)
- `<title>`: `Hugo Eliezer Trejo | Backend & Cloud Engineer`
- `description`: `Computer Science Engineering student building backend systems with Java, Spring Boot and the cloud. AWS Certified. Open to internships.`
- `og:title`, `og:description`, `og:url` (`https://hugo-eliezer.lat/`), `og:image` (`/og.png` 1200×630), `og:type=website`, `twitter:card=summary_large_image`
- `theme-color` `#070B1A` y favicon del anillo.

## 10. Calidad mínima
- Lighthouse ≥ 90 en Performance (móvil) y ≥ 95 en Accessibility y SEO.
- `alt` y `aria-label` en íconos y botones, y contraste AA (el dorado y el verde sobre `#070B1A` lo pasan).
- `prefers-reduced-motion` respetado.

## 11. Despliegue
1. Crear el repo **público** `HugoTrejo13/hugo-eliezer` (lo hago yo con `gh`). Antes del primer commit reviso `git status` para confirmar que no se cuela nada de 11.1.
2. En Vercel: **Import Project** → detecta Vite → Deploy.
3. Variable de entorno en Vercel: `VITE_WEB3FORMS_KEY` (se saca gratis en web3forms.com con hugo.trejo02@gmail.com). En local va en `.env.local`, que no se sube.
4. En Vercel → **Domains**: agregar `hugo-eliezer.lat` y `www.hugo-eliezer.lat` (www redirige a la raíz).
5. DNS en **Namecheap** (ver 11.2).
6. Subir `og.png` real (captura del hero) y probar el preview en LinkedIn Post Inspector y en WhatsApp.

### 11.1 Qué NO se sube al repo público (`.gitignore`)
```
node_modules/
dist/
.vercel/
.env
.env.*
!.env.example
.DS_Store
*.log
```
- Las llaves solo viven en `.env.local` y en Vercel. En el repo va `.env.example` con los nombres y sin valores.
- La key de Web3Forms termina dentro del JavaScript del sitio, porque así funciona ese servicio y por eso es pública. Aun así no se escribe directo en el código, para poder cambiarla sin tocar nada. En Web3Forms se restringe al dominio `hugo-eliezer.lat`.
- El CV en `public/` sí se sube, con teléfono (decisión de Hugo). Eso implica que el número queda en GitHub y en el sitio.
- Nada más del sistema: ni el backup `.sql` ni otras carpetas de `~/Developer`, porque el repo solo contiene `eliezer-trejo/`.

### 11.2 DNS en Namecheap
**Domain List** → `hugo-eliezer.lat` → **Manage** → pestaña **Advanced DNS**:
1. **Borrar** los registros que Namecheap pone por defecto: `CNAME www → parkingpage.namecheap.com` y `URL Redirect @`.
2. **Agregar:**
   | Type | Host | Value | TTL |
   |---|---|---|---|
   | A Record | `@` | `76.76.21.21` | Automatic |
   | CNAME Record | `www` | `cname.vercel-dns.com` | Automatic |
   *(Si Vercel muestra valores distintos al agregar el dominio, se usan los de Vercel.)*
3. Esperar de 5 a 30 min (puede tardar hasta 48 h). Vercel emite el HTTPS solo.
- Los nameservers se dejan en **Namecheap BasicDNS**; no hay que cambiarlos.

## 12. Fases
| Fase | Entregable |
|---|---|
| 1. Base | Vite + React + Tailwind, tokens, fuentes, navbar + HUD, `data.js` con el CV. **Deploy a Vercel + dominio conectado** |
| 2. Planeta | `Planet.jsx` completo (planeta, anillos clicables, rocas, estrellas) + versión móvil |
| 3. Secciones | Hero, About, Experience, Projects, Stack, Emeralds, Contact, Footer |
| 4. Detalles | Konami/Super, resorte, 404 GAME OVER, ACT CLEAR, animaciones de entrada |
| 5. Pulido | OG image, responsive en 4 anchos, Lighthouse, accesibilidad → 🚀 |

## 13. Herramientas y lo que hace cada quien

### Ya está listo (verificado)
- Node 24 + npm 11, git y `gh` con sesión iniciada como **HugoTrejo13**: puedo crear el repo y hacer push yo.
- Claude in Chrome: puedo abrir el sitio, tomar capturas en 375, 768 y 1440 px y compararlo contra cesar-cortez.com para iterar el diseño visualmente.

### Lo que solo Hugo puede hacer (≈10 min en total)
| Cuándo | Qué | Por qué |
|---|---|---|
| Fase 1 | Crear cuenta en **vercel.com** con "Continue with GitHub" | El deploy se liga a tu GitHub |
| Fase 1 | Correr `! npx vercel login` en esta sesión (o importar el repo desde la web de Vercel) | Para que yo pueda desplegar desde aquí |
| Fase 1 | Entrar al panel del registrador del dominio y poner los 2 registros DNS que te dé | Nadie más tiene acceso a tu cuenta del dominio |
| Fase 3 | Sacar la key gratis en **web3forms.com** con tu Gmail y pasármela | El formulario la necesita (es pública, no es secreta) |
| Fase 5 | Revisar el sitio en **tu celular real** y decirme qué no te gusta | DevTools no sustituye a un teléfono de verdad |

### Opcional, sube el nivel
- Capturas o un GIF corto de MonPoint (Postman, diagrama de arquitectura) y del tool de HPE (sin datos de HPE) para las tarjetas de proyecto.

## 14. Decisiones cerradas
- [x] Dominio en **Namecheap** → DNS según 11.2.
- [x] Repo **público**, con `.gitignore` estricto (11.1).
- [x] CV con teléfono en `public/`.
- [x] 3D híbrido: planeta hecho con código + `props.glb` CC0 (sección 5), con libertad para ajustar si algo se ve mejor de otra forma.

## 15. Pendientes de Hugo (no bloquean la Fase 1)
- [ ] Link del repo de MonPoint (si es público).
- [ ] Key de Web3Forms (Fase 3).
- [ ] Cuenta de Vercel + `! npx vercel login` (al terminar la Fase 1).
