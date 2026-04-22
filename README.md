# GASTOSPE (Angular)

App de finanzas **local-first** para registrar ingresos, egresos y pagos.

## Qué hace
- Guarda movimientos de forma local en el navegador (funciona offline).
- Permite cargar gastos manualmente o importarlos desde texto de WhatsApp.
- Al recuperar internet, sincroniza pendientes a un endpoint (Google Apps Script o Firebase Function).
- Muestra resumen (ingresos, egresos y balance).

## Integraciones sugeridas

### 1) WhatsApp
- Usa el botón `Abrir WhatsApp` con mensaje plantilla.
- Copia/pega mensaje en la app con formato: `egreso 2500 supermercado`.

### 2) Notificaciones de iPhone (sin nube obligatoria)
- Crear un **Shortcut** en iPhone que pregunte: tipo, monto y categoría.
- Shortcut hace POST al endpoint de tu app (o copia formato para pegar en GASTOSPE).
- Elegir `source = iphone-shortcuts`.

### 3) Sincronizar a Google Sheet (Excel en la nube)
1. Crear Google Sheet.
2. Abrir Apps Script y pegar `google-apps-script.gs`.
3. Deploy > Web app > acceso público para tu cuenta/dispositivo.
4. Copiar la URL del Web App y pegarla en el campo `Endpoint`.

### 4) Hosting en Firebase
```bash
npm install
npm run build
npm i -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Desarrollo local
```bash
npm install
npm start
```

## Subir a GitHub
```bash
git init
git add .
git commit -m "feat: app angular de finanzas local-first con sync a sheets"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

> Nota: en este entorno no puedo autenticarme a tu cuenta de GitHub, pero dejo todo preparado para que lo subas en 1 comando final.
