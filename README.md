# Frontend EmprendeIA

Frontend de la plataforma EmprendeIA construido con Next.js 16, React 19, TypeScript y Tailwind CSS.

## 🚀 Características

- **Next.js 16**: Framework React moderno con App Router
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Utilidades CSS para estilos rápidos
- **ESLint**: Linting de código
- **React 19**: Última versión de React

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx       # Layout raíz
│   ├── page.tsx         # Página principal
│   └── globals.css      # Estilos globales
└── components/          # Componentes React (crear según sea necesario)
```

## 🛠️ Instalación

Las dependencias ya han sido instaladas. Para instalar nuevas dependencias:

```bash
npm install nombre-del-paquete
```

## 🏃 Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 🏗️ Build para Producción

```bash
npm run build
npm start
```

## 📝 Linting

Para verificar la calidad del código:

```bash
npm run lint
```

## 🔗 Conectar con Backend

El backend de EmprendeIA está ubicado en la carpeta `backend-emprenderia-main`.

Base URL del API: `http://localhost:5000` (ajusta según tu configuración)

### Ejemplo de conexión con el backend:

```typescript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
})
```

## 📚 Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación de React](https://react.dev)

## 📄 Licencia

Este proyecto es parte de EmprendeIA.
