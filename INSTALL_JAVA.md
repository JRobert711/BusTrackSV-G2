# ☕ Instalación de Java para Firebase Emulator

## ⚠️ Problema Detectado

El emulador de Firebase requiere **Java 11 o superior** para funcionar.

Error recibido:
```
Error: Could not spawn `java -version`. Please make sure Java is installed and on your system PATH.
```

---

## ✅ Solución: Instalar Java

### Opción 1: Amazon Corretto (Recomendado)

**Amazon Corretto** es una distribución gratuita de OpenJDK con soporte a largo plazo.

**1. Descargar:**
- Ve a: https://docs.aws.amazon.com/corretto/latest/corretto-11-ug/downloads-list.html
- Descarga: **Amazon Corretto 11 (Windows x64 MSI)**

**2. Instalar:**
- Ejecuta el instalador `.msi`
- Sigue las instrucciones (Next, Next, Install)
- El instalador configura el PATH automáticamente

**3. Verificar:**
```powershell
java -version
```

Deberías ver:
```
openjdk version "11.0.X" 2023-XX-XX LTS
OpenJDK Runtime Environment Corretto-11.0.X
OpenJDK 64-Bit Server VM Corretto-11.0.X
```

---

### Opción 2: Oracle JDK

**1. Descargar:**
- Ve a: https://www.oracle.com/java/technologies/downloads/#java11
- Descarga: **Windows x64 Installer**

**2. Instalar:**
- Ejecuta el instalador
- Acepta términos y condiciones
- Instalar en ruta por defecto

**3. Configurar PATH (si es necesario):**
```powershell
# Agrega Java al PATH
setx JAVA_HOME "C:\Program Files\Java\jdk-11"
setx PATH "%PATH%;%JAVA_HOME%\bin"
```

**4. Verificar:**
```powershell
java -version
```

---

### Opción 3: Chocolatey (Más rápido)

Si tienes **Chocolatey** instalado:

```powershell
# Abre PowerShell como Administrador
choco install openjdk11
```

---

## 🔄 Después de Instalar Java

### 1. Reinicia las terminales
Cierra y abre nuevas terminales para que reconozcan Java.

### 2. Verifica Java
```powershell
java -version
```

### 3. Inicia el emulador
```powershell
cd backend
firebase emulators:start --only firestore
```

**Deberías ver:**
```
✔  firestore: Emulator started at http://localhost:8080
✔  firestore: View Emulator UI at http://localhost:4000/firestore
```

---

## 🎯 Alternativa: Usar Firebase Real (Sin Emulador)

Si no quieres instalar Java, puedes usar Firebase real:

### 1. Crea un proyecto en Firebase Console
- Ve a: https://console.firebase.google.com/
- Click en "Agregar proyecto"
- Nombre: `BusTrack-SV-Dev`
- Habilita Firestore

### 2. Descarga Service Account
- Ve a: Project Settings > Service Accounts
- Click "Generate new private key"
- Guarda como `backend/serviceAccount.json`

### 3. Actualiza .env
```env
# Comenta el emulador
# FIRESTORE_EMULATOR_HOST=localhost:8080

# Descomenta y configura
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
```

### 4. Inicia solo el backend
```powershell
cd backend
npm run dev
```

**No necesitas el emulador, conectará directamente a Firebase.**

---

## 📋 Checklist de Verificación

- [ ] Java 11+ instalado
- [ ] `java -version` funciona en terminal
- [ ] Terminal reiniciada después de instalar Java
- [ ] Firebase emulator inicia sin errores
- [ ] UI del emulador accesible en http://localhost:4000

---

## 🐛 Troubleshooting

### Java instalado pero comando no funciona

**Solución:** Configurar PATH manualmente

1. Busca donde está instalado Java:
   ```powershell
   # Busca java.exe
   dir "C:\Program Files\Java" /s /b | findstr java.exe
   ```

2. Agrega al PATH:
   ```powershell
   setx PATH "%PATH%;C:\Program Files\Java\jdk-11\bin"
   ```

3. Reinicia terminal y verifica:
   ```powershell
   java -version
   ```

### Error: "JAVA_HOME not set"

```powershell
setx JAVA_HOME "C:\Program Files\Java\jdk-11"
```

### Quiero desinstalar Java después

**Windows:**
1. Configuración > Aplicaciones
2. Busca "Java"
3. Click en Desinstalar

---

## ✅ Resumen

**Necesitas Java para:**
- ✅ Emulador de Firestore (desarrollo local)
- ✅ Emulador UI (visualizar datos)

**NO necesitas Java si:**
- ❌ Usas Firebase real (en la nube)
- ❌ Solo pruebas el frontend sin backend

---

**Recomendación:** Instala **Amazon Corretto 11** - es gratis, estable y se configura automáticamente.

**Descargar:** https://docs.aws.amazon.com/corretto/latest/corretto-11-ug/downloads-list.html
