@echo off
cd /d "OneDrive/Documentos/FistGig/Backend"
echo.
echo ============================================
echo Verificando estado del backend FirstGig
echo ============================================
echo.

echo 1. Verificando si el servidor está corriendo...
curl --silent --head http://localhost:4000/health 2>&1 | find "200" && echo "   ✅ Servidor activo" || echo "   ❌ Servidor no activo"

echo.
echo 2. Probando endpoint de auth login...
curl --silent -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"moderador@fistgig.com\",\"password\":\"Moderador1234\"}" 2>&1 | find "rol" && echo "   ✅ Login OK" || echo "   ❌ Login fallido"

echo.
echo 3. Probando endpoint moderador dashboard...
curl --silent -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" http://localhost:4000/api/moderador/dashboard 2>&1 | find "reportesPendientes" && echo "   ✅ Dashboard OK" || echo "   ❌ Dashboard fallido"

echo.
echo 4. Probando endpoint listar publicaciones servicio...
curl --silent -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" "http://localhost:4000/api/moderador/publicaciones?tipo=servicio&limit=2" 2>&1 | head -100 && echo "   ✅ Publicaciones servicio OK" || echo "   ❌ Publicaciones servicio fallido"

echo.
echo 5. Probando endpoint listar publicaciones proyecto...
curl --silent -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" "http://localhost:4000/api/moderador/publicaciones?tipo=proyecto&limit=2" 2>&1 | head -100 && echo "   ✅ Publicaciones proyecto OK" || echo "   ❌ Publicaciones proyecto fallido"

echo.
echo ============================================
echo Verificación completa
echo ============================================