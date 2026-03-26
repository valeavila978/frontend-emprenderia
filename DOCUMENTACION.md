# 📚 Guía Completa del Frontend EmprendeIA

## 📁 Estructura del Proyecto

```
src/
├── app/                      # App Router de Next.js
│   ├── login/               # Página de inicio de sesión
│   ├── register/            # Página de registro
│   ├── dashboard/           # Dashboard del usuario
│   ├── projects/            # Gestión de proyectos
│   │   ├── create/          # Crear nuevo proyecto
│   │   └── [id]/            # Detalles del proyecto
│   ├── layout.tsx           # Layout raíz con Auth y Nav
│   ├── page.tsx             # Página principal
│   └── globals.css          # Estilos globales
├── components/              # Componentes reutilizables
│   ├── Navigation.tsx       # Barra de navegación
│   ├── ProtectedRoute.tsx   # Componente para rutas protegidas
│   ├── Input.tsx            # Campo de entrada
│   ├── Button.tsx           # Botón personalizado
│   └── Alert.tsx            # Alertas y notificaciones
├── context/                 # Context API
│   └── AuthContext.tsx      # Contexto de autenticación
├── services/                # Servicios de API
│   ├── authService.ts       # Llamadas a auth API
│   └── projectService.ts    # Llamadas a projects API
├── types/                   # TypeScript tipos
│   └── index.ts             # Definiciones de tipos
├── hooks/                   # Custom React hooks
├── utils/                   # Funciones utilitarias
│
├── next.config.ts           # Configuración de Next.js
├── tsconfig.json            # Configuración de TypeScript
├── tailwind.config.ts       # Configuración de Tailwind CSS
├── postcss.config.js        # Configuración de PostCSS
├── .env.local               # Variables de entorno locales
├── .eslintrc.json           # Configuración de ESLint
├── .gitignore               # Archivos a ignorar en git
└── package.json             # Dependencias del proyecto
```

---

## 🔐 Autenticación

### Flujo de Autenticación

1. **Registro**: El usuario se registra con email, contraseña y tipo de usuario
2. **Login**: El usuario inicia sesión y recibe un token JWT
3. **Almacenamiento**: El token se guarda en localStorage
4. **Autorización**: Las solicitudes API incluyen el token en el header

### Context de Autenticación

```typescript
// Usar en componentes
const { user, isAuthenticated, token, login, register, logout } = useAuth()
```

**Propiedades:**
- `user`: Datos del usuario autenticado
- `isAuthenticated`: Boolean indicando si el usuario está autenticado
- `token`: Token JWT actual
- `loading`: Estado de carga
- `login(email, password)`: Función para iniciar sesión
- `register(email, password, role)`: Función para registrarse
- `logout()`: Función para cerrar sesión

### Rutas Protegidas

```typescript
<ProtectedRoute>
  <MiComponente />
</ProtectedRoute>
```

El componente `ProtectedRoute` redirige a login si el usuario no está autenticado.

---

## 📊 Gestión de Proyectos

### Endpoints de Proyectos

```typescript
// Crear proyecto
POST /api/projects
Body: {
  ownerId: string,
  title: string,
  description: string
}

// Obtener mis proyectos
GET /api/projects

// Obtener proyecto por ID
GET /api/projects/{id}
```

### Uso en Componentes

```typescript
import { ProjectService } from '@/services/projectService'
import { useAuth } from '@/context/AuthContext'

const { token } = useAuth()

// Crear proyecto
const response = await ProjectService.createProject(
  {
    ownerId: user.userId,
    title: 'Mi Proyecto',
    description: 'Descripción...'
  },
  token
)

// Obtener proyectos
const projects = await ProjectService.getProjects(token)

// Obtener proyecto por ID
const project = await ProjectService.getProjectById('id', token)
```

---

## 🎨 Componentes Reutilizables

### Input

```typescript
<Input
  label="Email"
  type="email"
  placeholder="ejemplo@correo.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error="Error opcional"
  required
/>
```

### Button

```typescript
<Button
  variant="primary" // 'primary' | 'secondary' | 'danger'
  loading={false}
  onClick={handleClick}
  type="submit"
>
  Enviar
</Button>
```

### Alert

```typescript
<Alert
  type="success" // 'success' | 'error' | 'warning' | 'info'
  message="Operación exitosa"
  onClose={() => setError('')}
/>
```

### Navigation

Se incluye automáticamente en el layout. Muestra:
- Logo de EmprendeIA
- Links de navegación según estado de autenticación
- Información del usuario si está autenticado

### ProtectedRoute

Envuelve componentes que requieren autenticación.

---

## 🔗 Conectar con Backend

### Variables de Entorno

Actualiza `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Cambia la URL según donde esté tu backend:
- **Local**: `http://localhost:5000/api`
- **Producción**: `https://tu-dominio.com/api`

### Headers de Autenticación

Todos los servicios incluyen automáticamente el token en los headers:

```typescript
headers: {
  Authorization: `Bearer ${token}`
}
```

---

## 🚀 Ejecución del Proyecto

### Desarrollo

```bash
npm run dev
```

Accede a: `http://localhost:3000`

### Build para Producción

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 📋 Páginas Disponibles

| Página | Ruta | Requiere Auth | Descripción |
|--------|------|--------|-------------|
| Inicio | `/` | No | Landing page |
| Login | `/login` | No | Iniciar sesión |
| Registro | `/register` | No | Crear cuenta |
| Dashboard | `/dashboard` | Sí | Panel principal |
| Proyectos | `/projects` | Sí | Lista de proyectos |
| Crear Proyecto | `/projects/create` | Sí | Crear nuevo proyecto |
| Detalle Proyecto | `/projects/[id]` | Sí | Ver detalles del proyecto |

---

## 🛠️ Tipos TypeScript

### User

```typescript
interface User {
  userId: string
  email: string
  role: 'Entrepreneur' | 'Investor' | 'Mentor'
}
```

### Project

```typescript
interface Project {
  id: string
  ownerId: string
  title: string
  description: string
  createdAt: string
}
```

### Más tipos en `src/types/index.ts`

---

## 🔄 Flujo de Desarrollo

1. **Crear componente** en `src/components/`
2. **Crear servicio** en `src/services/` si necesita API
3. **Agregar tipos** en `src/types/index.ts`
4. **Usar en página** en `src/app/`
5. **Proteger ruta** si requiere autenticación
6. **Probar en navegador**

---

## 💡 Mejores Prácticas

✅ **Hacer:**
- Usar componentes reutilizables
- Manejar errores en try-catch
- Mostrar estados de carga
- Validar datos en el cliente
- Usar TypeScript para tipado

❌ **Evitar:**
- Requests directos sin servicios
- Guardar credenciales en localStorage (solo token)
- Componentes sin estado de carga
- Rutas sin protección si requieren auth

---

## 📞 Integración con Backend

### Endpoints Esperados

El backend debe proporcionar:

**Autenticación:**
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener datos del usuario
- `POST /api/auth/refresh` - Renovar token

**Proyectos:**
- `POST /api/projects` - Crear proyecto
- `GET /api/projects` - Obtener mis proyectos
- `GET /api/projects/{id}` - Obtener proyecto por ID

---

## 🎯 Próximas Funcionalidades a Implementar

- [ ] Sistema de búsqueda avanzada
- [ ] Filtros y categorización de proyectos
- [ ] Sistema de mensajería
- [ ] Comentarios y calificaciones
- [ ] Seguimiento de proyectos
- [ ] Análisis y reportes
- [ ] Integración con redes sociales
- [ ] Notificaciones en tiempo real

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**¡Happy Coding! 🚀**
