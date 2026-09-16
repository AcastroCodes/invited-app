@echo off
setlocal enabledelayedexpansion
color 0A

echo ========================================================
echo       RESPALDO ESENCIAL DE PROYECTO (Invited Pro)
echo ========================================================
echo.

:: 1. Solicitar Unidad
set /p drive="1. Ingresa la letra de la unidad destino (ej. E, F, G): "
:: Eliminar dos puntos si el usuario los escribió (ej. E:)
set drive=%drive::=%

:: 2. Solicitar Nombre de Carpeta
set /p folder="2. Ingresa el nombre de la carpeta (ej. Respaldo_Invited): "

:: 3. Construir ruta de destino
set "dest=%drive%:\%folder%"

echo.
echo Verificando destino: %dest%
if not exist "%dest%" (
    echo - La carpeta no existe. Creandola...
    mkdir "%dest%"
    if errorlevel 1 (
        echo [ERROR] No se pudo crear la carpeta en la unidad %drive%. Asegurate de que la unidad exista.
        pause
        exit /b 1
    )
) else (
    echo - La carpeta ya existe. Actualizando su contenido...
)

echo.
echo Iniciando copia esencial a %dest%...
echo (Omitiendo carpetas pesadas: node_modules, vendor, .git, etc.)
echo.

:: El directorio actual (donde está este archivo .bat)
set "source=%~dp0"
:: Remover la barra final \ del source para robocopy
if "%source:~-1%"=="\" set "source=%source:~0,-1%"

:: 4. Ejecutar Robocopy
:: /MIR = Espejo (Copia directorios y elimina en destino lo que ya no existe en origen)
:: /XD = Excluir Directorios
:: /XF = Excluir Archivos
:: /NFL /NDL /NJH /NJS /nc /ns /np = Oculta detalles innecesarios en la pantalla para no saturarla
robocopy "%source%" "%dest%" /MIR /XD node_modules vendor .vscode .idea public\build storage\logs storage\framework\views storage\framework\cache storage\framework\sessions /XF .DS_Store Thumbs.db backup.bat /NFL /NDL /NJH /NJS /nc /ns /np

:: Robocopy retorna exit code menor a 8 cuando es exitoso
if %errorlevel% leq 7 (
    echo ========================================================
    echo      [EXITO] COPIA ESENCIAL COMPLETADA
    echo      Tus archivos estan a salvo en: %dest%
    echo ========================================================
) else (
    echo [ERROR] Ocurrio un problema durante el respaldo. Codigo Robocopy: %errorlevel%
)

echo.
pause
