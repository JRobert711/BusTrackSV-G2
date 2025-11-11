# 🔧 Instrucciones para Corregir Errores de Dependencias

## ❌ Problema Detectado

Los siguientes módulos no se pueden encontrar:
- `@radix-ui/react-accordion@1.2.3`
- `lucide-react@0.487.0`

**Causa:** Las dependencias están declaradas en `package.json` pero **no están instaladas** en `node_modules`.

---

## ✅ Solución

### Paso 1: Ir al directorio del frontend

```bash
cd frontend/web
```

### Paso 2: Instalar todas las dependencias

```bash
npm install
```

**Tiempo estimado:** 2-3 minutos (dependiendo de tu conexión)

### Paso 3: Verificar instalación

Después de la instalación, deberías ver:
```bash
added 487 packages in 2m
```

### Paso 4: Iniciar el servidor de desarrollo

```bash
npm run dev
```

**El frontend debería iniciar sin errores en:** `http://localhost:5173`

---

## 🔍 Verificación Manual

Si aún hay errores, verifica que los paquetes se instalaron correctamente:

```bash
# Verificar node_modules
ls node_modules/@radix-ui/react-accordion
ls node_modules/lucide-react
```

Si alguno de estos comandos no muestra archivos, intenta:

```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Dependencias Instaladas

Después de `npm install`, tendrás:

**UI Components (Radix UI):**
- `@radix-ui/react-accordion` ✓
- `@radix-ui/react-dialog` ✓
- `@radix-ui/react-tabs` ✓
- Y 20+ componentes más...

**Icons:**
- `lucide-react` ✓ (487+ iconos)

**Otros:**
- `react` + `react-dom` ✓
- `tailwind-merge` + `clsx` ✓
- `recharts` (gráficos) ✓
- Y más...

---

## ⚠️ Nota Importante

**NO EDITES los archivos `.tsx` para "corregir" estos errores.**

Los errores son de **dependencias faltantes**, NO de código incorrecto.

La única solución es: **`npm install`**

---

## 🚀 Quick Fix

```bash
# Una sola línea para resolver todo:
cd frontend/web && npm install && npm run dev
```

---

## ✅ Checklist

- [ ] Navegaste a `frontend/web`
- [ ] Ejecutaste `npm install`
- [ ] Viste mensaje "added X packages"
- [ ] Verificaste que `node_modules` se creó
- [ ] Ejecutaste `npm run dev`
- [ ] El servidor inició sin errores
- [ ] Abriste `http://localhost:5173` en el navegador

---

**Después de esto, todos los errores de módulos faltantes deberían desaparecer.** ✨
