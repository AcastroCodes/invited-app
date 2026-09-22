@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo =========================================================
echo       EXPORTADOR DE ARCHIVOS MODIFICADOS AL PENDRIVE
echo =========================================================
echo.
set /p unidad=Introduce la letra de tu pendrive (ejemplo, E): 

if "%unidad%"=="" (
    echo Error: No introdujiste ninguna letra.
    pause
    exit /b
)
:: Limpiar dos puntos si el usuario escribe E: en lugar de E
set unidad=%unidad::=%

:: Obtener la fecha y hora actual para la carpeta
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set date_str=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
set time_str=%datetime:~8,2%-%datetime:~10,2%

set destino=%unidad%:\Invited_Modificados_%date_str%_%time_str%

echo.
echo Selecciona el metodo para encontrar los archivos:
echo [1] Archivos modificados en las ultimas 24 horas (Mas rapido, incluye todo lo del dia)
echo [2] Archivos marcados por Git (nuevos o modificados sin commitear)
echo.
set /p opcion=Elige una opcion (1 o 2): 

echo.
echo Creando carpeta destino en %destino% ...
mkdir "%destino%" >nul 2>&1

if "%opcion%"=="1" (
    echo Copiando archivos modificados recientemente...
    echo (Se excluyen automaticamente carpetas pesadas como node_modules y vendor)
    echo.
    :: /MAXAGE:1 copia los de hoy y ayer. /S incluye subcarpetas. /XD excluye carpetas. 
    robocopy "%~dp0." "%destino%" /S /MAXAGE:1 /XD node_modules vendor storage\framework /XF .env modificados.bat /NJH /NJS /NDL
) else if "%opcion%"=="2" (
    echo Buscando archivos modificados en Git...
    echo.
    for /f "delims=" %%f in ('git ls-files -m -o --exclude-standard') do (
        set "filepath=%%f"
        :: Cambiar slashes por backslashes para Windows
        set "filepath=!filepath:/=\!"
        echo Copiando: !filepath!
        
        :: Crear subcarpeta de destino usando un truco de variables
        for %%A in ("%destino%\!filepath!") do mkdir "%%~dpA" 2>nul
        
        :: Copiar el archivo
        copy /Y "%~dp0!filepath!" "%destino%\!filepath!" >nul
    )
) else (
    echo Opcion invalida.
    pause
    exit /b
)

echo.
echo =========================================================
echo COPIA COMPLETADA CON EXITO EN:
echo %destino%
echo =========================================================
pause
