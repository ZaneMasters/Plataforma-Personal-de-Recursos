# 🌌 LinkVault - Plataforma Personal de Recursos

**LinkVault** es una aplicación web moderna diseñada para actuar como un repositorio personal de alto nivel para enlaces, recursos, herramientas y bibliografía. Construida con una arquitectura *SaaS (Software as a Service)*, ofrece espacios privados e independientes para cada usuario gracias a la autenticación inteligente de Google.

![Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop) *(Visual referencial de la estructura de la aplicación)*

## 🚀 Características Principales

- **☁️ Firebase SaaS Architecture**: Integración total y nativa con el ecosistema de Google Cloud.
- **🔐 Cuentas Privadas (Google Auth)**: Sistema de inicio de sesión obligatorio. Cada usuario tiene un entorno de base de datos aislado y cifrado que impide mezclarse con colecciones públicas.
- **⚡ Sincronización en Tiempo Real (`onSnapshot`)**: Base de datos conectada en vivo por WebSocket. Al agregar o editar una tarjeta, los cambios se propagan a todos tus dispositivos activos simultáneamente, sin necesidad de actualizar la página.
- **🖼️ Subida Custom de Imágenes**: Implementada una zona *"Arrastrar y Soltar"* (Drag & Drop) acoplada a `Firebase Storage` para guardar las imágenes de tus miniaturas de por vida.
- **✨ Animaciones de Grado Nativo (`Framer Motion`)**: Transiciones suaves al expandir las tarjetas al estilo iOS/MacOS y explosiones de partículas dinámicas en el motor de Favoritos.
- **🔔 Notificaciones Inteligentes**: Implementación de `react-hot-toast` para otorgar información inmediata al usuario (cargas asíncronas, éxitos de red o catástrofes de conexión).
- **📂 Exportación (Backup)**: Descarga todo tu repositorio de base de datos personal al instante con un archivo JSON estructurado pulsando "Exportar Respaldo".

---

## 🛠️ Stack Tecnológico

- **Framework Core**: React 18 + TypeScript (Vite)
- **Estilos**: Tailwind CSS + Diseño UI personalizado "Arbor Slate"
- **Iconografía**: Lucide React
- **Animaciones**: Framer Motion
- **Autenticación**: Firebase Auth (Google Provider)
- **Base de Datos**: Firebase Firestore (NoSQL)
- **Almacenamiento**: Firebase Storage

---

## ⚙️ Instalación y Configuración Local

Sigue estos pasos para arrancar la maquinaria de código en tu dispositivo:

```bash
# 1. Clona este repositorio o descomprímelo
cd links

# 2. Instala las dependencias principales
npm install

# 3. Arranca el servidor local
npm run dev
```

> **NOTA DE SEGURIDAD**: Si la instalación arranca y te encuentras con una pantalla de error o el modo Offline (Guardado local estricto), **debes** configurar `Firebase` según las pautas inferiores. La aplicación intentará buscar credenciales siempre en el archivo `.env`.

---

## 🔥 Configuración de Firebase (Backend)

La columna vertebral de este proyecto se sostiene gracias a tu cuenta de **Firebase Console**. Sigue los pasos al pie de la letra.

### 1. Variables de Entorno
Copia la plantilla `.env.example` en un nuevo archivo invisible llamado estrictamente `.env` y rellena tus claves:

```env
VITE_FIREBASE_API_KEY="tu_llave"
VITE_FIREBASE_AUTH_DOMAIN="tu_app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tu_id"
VITE_FIREBASE_STORAGE_BUCKET="tu_almacen.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="439055932847"
VITE_FIREBASE_APP_ID="1:xxx:web:xxx"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXX"
```

### 2. Autenticación (Google Auth)
Para que el inicio de sesión funcione con éxito debes encender el interruptor:
- Ve a tu Consola Firebase > **Authentication**.
- Pestaña **Sign-in method** > Añade el proveedor de **Google**.
- Guárdalo.

### 3. Base de Datos Rápida (Test Mode)
En Firebase > **Firestore Database** asegúrate de ir a las *Reglas* (Rules) para permitir a la app sobreescribir tus documentos sin chocar con barreras administrativas estrictas (Procura añadir validaciones en producción final).

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Regla permisiva temporal
      allow read, write: if true; 
    }
  }
}
```

### 4. Permisos de Subida CORS (Storage)
Para que `Firebase Storage` acepte subir tus imágenes directamente desde `http://localhost:5173`, necesitas abrir permisos **CORS** obligatorios vía Consola de Comando Cloud (`Google Cloud Shell`).
Escribe el siguiente archivo adentro marcando tu ID de Storage respectivo:

```bash
cat <<EOF > cors.json
[
  {
    "origin": ["*"],
    "method": ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Inyectalo a tu Storage
gsutil cors set cors.json gs://TU-PROYECTO.firebasestorage.app
```

---

## 👨‍💻 Acerca del Autor
Desarrollado y estructurado orgánicamente a partir del despliegue en React & Firebase.
- Github: [@ZaneMasters](https://github.com/ZaneMasters)
