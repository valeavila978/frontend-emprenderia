# 🚀 Guía de Ejecución y Prueba

## Requisitos Previos

✅ Node.js 18+ instalado
✅ npm o yarn
✅ El backend ejecutándose (http://localhost:5000)

---

## 1️⃣ Instalación

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
cd frontend-emprenderia
npm install
```

---

## 2️⃣ Configuración

Edita `.env.local` con la URL de tu backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 3️⃣ Ejecutar en Desarrollo

```bash
npm run dev
```

Deberías ver:

```
▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1234ms
```

Abre el navegador: **http://localhost:3000**

---

## 4️⃣ Flujo de Prueba

### 📝 Registro

1. Click en **"Empezar Ahora"** en la página principal
2. Completa el formulario:
   - Email: `prueba@email.com`
   - Contraseña: `123456`
   - Tipo de Usuario: Selecciona tu rol
3. Click en **"Registrarse"**

### ✅ Verificación

Debería:
- ✓ Registrarse exitosamente
- ✓ Iniciar sesión automáticamente
- ✓ Redirigir a /dashboard
- ✓ Mostrar los datos del usuario

### 🏠 Dashboard

Verás:
- Tu email y rol
- Botón para ver proyectos
- Botón para crear nuevo proyecto
- Estadísticas

### 📊 Crear Proyecto

1. Click en **"Nuevo Proyecto"** o **"Crear Proyecto"**
2. Completa:
   - Título: `Mi Idea Innovadora`
   - Descripción: `Aquí va la descripción del proyecto...`
3. Click en **"Crear Proyecto"**

### ✅ Verificación

Debería:
- ✓ Crear el proyecto exitosamente
- ✓ Mostrar mensaje de éxito
- ✓ Redirigir a lista de proyectos
- ✓ Ver el proyecto en la lista

### 📋 Ver Proyectos

1. Navega a **"Proyectos"** en la barra superior
2. Debería mostrar:
   - Lista de tus proyectos
   - Título y descripción
   - Fecha de creación
   - Botón para ver detalles

### 🔍 Detalles del Proyecto

1. Click en **"Ver Detalles"** de un proyecto
2. Deberías ver:
   - Título completo
   - Descripción completa
   - Información meta (ID, Owner, Fecha)
   - Botones de acción

### 🚪 Logout

1. Click en **"Cerrar Sesión"** en la barra superior
2. Deberías:
   - ✓ Limpiar la sesión
   - ✓ Redirigir a la página principal
   - ✓ No poder acceder a rutas protegidas

### 🔒 Prueba de Protección

1. Intenta acceder a `/dashboard` sin estar autenticado
2. Debería redirigir a `/login`

---

## 5️⃣ Prueba de Login

### Caso de Éxito

1. Registra un usuario: `test@email.com` / `123456`
2. Haz logout
3. Intenta login con las credenciales correctas
4. Debería funcionar y ir a dashboard

### Caso de Error

1. Intenta login con credenciales incorrectas
2. Debería mostrar error
3. Usuario no autenticado

---

## 6️⃣ Verificación de la Consola

Abre la consola del navegador (F12) y verifica:

```javascript
// Ver auth state
localStorage.getItem('token')
// Debería mostrar el JWT token

// Ver requests
// En Network tab, verifica que las requests van a:
// POST http://localhost:5000/api/auth/register
// POST http://localhost:5000/api/auth/login
// GET http://localhost:5000/api/projects
```

---

## 7️⃣ Troubleshooting

### 🔴 Error: "Cannot GET /login"

- Verifica que `npm run dev` se está ejecutando
- Reinicia el servidor

### 🔴 Error: "API Connection Failed"

- Verifica que el backend está corriendo en http://localhost:5000
- Revisa `.env.local` tiene la URL correcta
- Abre las DevTools > Network para ver los errores HTTP

### 🔴 Auth no persiste

- Limpia localStorage: `localStorage.clear()`
- Recarga la página (Ctrl + Shift + R)

### 🔴 Componentes no se actualizan

- Verifica que estás dentro de `AuthProvider`
- Usa `useAuth()` para acceder al contexto
- Revisa que los componentes son "use client"

---

## 8️⃣ Build para Producción

```bash
# Build
npm run build

# Ejecutar
npm start
```

Accede a: http://localhost:3000

---

## ✨ Checklist de Funcionalidad

- [ ] Página principal se carga
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Token se guarda
- [ ] Datos del usuario se muestran
- [ ] Dashboard protegido
- [ ] Crear proyecto funciona
- [ ] Ver proyectos funciona
- [ ] Detalles del proyecto funciona
- [ ] Logout funciona
- [ ] Newsletter se actualiza en tiempo real

---

## 🎯 Próximos Pasos

1. **Conectar más endpoints** del backend
2. **Agregar validaciones** más robustas
3. **Implementar búsqueda** de proyectos
4. **Sistema de mensajes** entre usuarios
5. **Notificaciones** en tiempo real
6. **Análisis** y reportes

---

## 📞 Soporte

Si encuentras problemas:

1. Verifica los DevTools (F12)
2. Revisa la consola del servidor (terminal)
3. Consulta DOCUMENTACION.md para más detalles

**¡Listo para probar! 🚀**
