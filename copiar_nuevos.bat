@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Copiar Archivos Nuevos y Modificados

:: Configuracion de la ruta destino
set "DEST=X:\Nueva carpeta (7)\nuevos"

:: Asegurar que el script se ejecute desde la raiz del proyecto
cd /d "%~dp0"

:MENU
cls
echo ======================================================================
echo               COPIAR ARCHIVOS NUEVOS / MODIFICADOS
echo ======================================================================
echo  Origen:  %CD%
echo  Destino: %DEST%
echo ======================================================================
echo.
echo  [1] Cambios actuales sin guardar (Modificados y nuevos en trabajo)
echo  [2] Archivos del ultimo commit realizado (HEAD)
echo  [3] Ambos (Ultimo commit + cambios actuales sin guardar)
echo  [4] Salir
echo.
echo ======================================================================
choice /c 1234 /n /m "Selecciona una opcion (1-4): "

if %errorlevel%==1 goto COPIAR_ACTUALES
if %errorlevel%==2 goto COPIAR_COMMIT
if %errorlevel%==3 goto COPIAR_AMBOS
if %errorlevel%==4 goto SALIR

goto MENU

:COPIAR_ACTUALES
cls
echo ======================================================================
echo  Buscando y copiando cambios actuales sin guardar...
echo ======================================================================
echo.
set "COPIADOS=0"
set "TMPLIST=%TEMP%\git_files_act_%RANDOM%.txt"
if exist "%TMPLIST%" del /f /q "%TMPLIST%"

REM Obtener archivos modificados (staged o no) y nuevos untracked
git diff --name-only HEAD > "%TMPLIST%" 2>nul
git ls-files --others --exclude-standard >> "%TMPLIST%" 2>nul

call :ProcesarLista "%TMPLIST%"
goto FIN_PROCESO

:COPIAR_COMMIT
cls
echo ======================================================================
echo  Buscando y copiando archivos del ultimo commit (HEAD)...
echo ======================================================================
echo.
set "COPIADOS=0"
set "TMPLIST=%TEMP%\git_files_cmt_%RANDOM%.txt"
if exist "%TMPLIST%" del /f /q "%TMPLIST%"

REM Obtener archivos del ultimo commit
git diff-tree --no-commit-id --name-only -r HEAD > "%TMPLIST%" 2>nul

call :ProcesarLista "%TMPLIST%"
goto FIN_PROCESO

:COPIAR_AMBOS
cls
echo ======================================================================
echo  Buscando y copiando ultimo commit y cambios actuales...
echo ======================================================================
echo.
set "COPIADOS=0"
set "TMPLIST=%TEMP%\git_files_amb_%RANDOM%.txt"
if exist "%TMPLIST%" del /f /q "%TMPLIST%"

REM Combinar lista del ultimo commit con cambios actuales
git diff-tree --no-commit-id --name-only -r HEAD > "%TMPLIST%" 2>nul
git diff --name-only HEAD >> "%TMPLIST%" 2>nul
git ls-files --others --exclude-standard >> "%TMPLIST%" 2>nul

call :ProcesarLista "%TMPLIST%"
goto FIN_PROCESO

:ProcesarLista
set "LISTFILE=%~1"
if not exist "%LISTFILE%" (
    echo No se encontro lista de archivos.
    goto :eof
)

REM Filtrar duplicados y lineas vacias con PowerShell
set "SORTEDLIST=%TEMP%\git_files_sorted_%RANDOM%.txt"
powershell -NoProfile -Command "if (Test-Path '%LISTFILE%') { Get-Content -Path '%LISTFILE%' | Where-Object { $_.Trim() -ne '' } | Select-Object -Unique | Set-Content -Path '%SORTEDLIST%' }" 2>nul

if not exist "%SORTEDLIST%" (
    set "SORTEDLIST=%LISTFILE%"
)

REM Asegurar que la carpeta raiz de destino exista
if not exist "%DEST%" (
    mkdir "%DEST%" >nul 2>&1
)

REM Iterar y copiar cada archivo
for /f "usebackq delims=" %%F in ("%SORTEDLIST%") do (
    call :CopiarArchivo "%%F"
)

REM Limpieza de archivos temporales
if exist "%LISTFILE%" del /f /q "%LISTFILE%" 2>nul
if exist "%SORTEDLIST%" del /f /q "%SORTEDLIST%" 2>nul
goto :eof

:CopiarArchivo
set "RELFILE=%~1"
if "%RELFILE%"=="" goto :eof

REM Convertir diagonales normales / a formato Windows \
set "RELFILE=%RELFILE:/=\%"

REM Si el archivo fue borrado en Git o no existe fisicamente en el disco, omitir
if not exist "%CD%\%RELFILE%" (
    echo   [OMITIDO / NO EXISTE] %RELFILE%
    goto :eof
)

set "TARGETFILE=%DEST%\%RELFILE%"

REM Extraer la ruta de la carpeta contenedora en destino
for %%D in ("%TARGETFILE%") do set "TARGETDIR=%%~dpD"

REM Crear carpeta destino manteniendo la estructura
if not exist "%TARGETDIR%" (
    mkdir "%TARGETDIR%" >nul 2>&1
)

REM Copiar archivo
copy /y "%CD%\%RELFILE%" "%TARGETFILE%" >nul 2>&1
if errorlevel 1 (
    echo   [ERROR AL COPIAR] %RELFILE%
) else (
    echo   [COPIADO] %RELFILE%
    set /a COPIADOS+=1
)
goto :eof

:FIN_PROCESO
echo.
echo ======================================================================
echo  Proceso finalizado.
echo  Total de archivos copiados: %COPIADOS%
echo  Ubicacion destino: %DEST%
echo ======================================================================
echo.
pause
goto MENU

:SALIR
echo Saliendo...
exit /b 0
