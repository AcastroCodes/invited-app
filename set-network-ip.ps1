# Obtener la dirección IP local IPv4 activa
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.InterfaceAlias -notlike "*VirtualBox*" -and 
    $_.InterfaceAlias -notlike "*VMware*" -and 
    $_.InterfaceAlias -notlike "*vEthernet*" -and
    $_.IPAddress -notlike "169.254.*"
}

$localIp = ($ips | Where-Object { $_.IPAddress -like "192.168.*" } | Select-Object -First 1).IPAddress
if (-not $localIp) { $localIp = ($ips | Select-Object -First 1).IPAddress }

if (-not $localIp) {
    Write-Host "No se detecto IP."
    exit
}

# Dominio dinámico
$domain = $localIp

# Leer .env
$envPath = ".env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Reemplazo multilínea preciso con llaves para evitar ambigüedad en la variable
    $envContent = [regex]::Replace($envContent, "(?m)^APP_URL=.*", "APP_URL=https://${domain}:5173")
    
    if ($envContent -match "VITE_DEV_DOMAIN=") {
        $envContent = [regex]::Replace($envContent, "(?m)^VITE_DEV_DOMAIN=.*", "VITE_DEV_DOMAIN=${domain}")
    } else {
        $envContent += "`nVITE_DEV_DOMAIN=${domain}"
    }

    $stateful = "localhost,localhost:8000,localhost:5173,127.0.0.1,127.0.0.1:8000,127.0.0.1:5173,127.0.0.1:8081,${domain},${domain}:8000,${domain}:5173,${domain}:8081"
    if ($envContent -match "SANCTUM_STATEFUL_DOMAINS=") {
        $envContent = [regex]::Replace($envContent, "(?m)^SANCTUM_STATEFUL_DOMAINS=.*", "SANCTUM_STATEFUL_DOMAINS=`"${stateful}`"")
    } else {
        $envContent += "`nSANCTUM_STATEFUL_DOMAINS=`"${stateful}`""
    }
    
    # Guardar forzando UTF8 para que Laravel no tenga problemas
    [System.IO.File]::WriteAllText($envPath, $envContent, [System.Text.Encoding]::UTF8)
}

Write-Host "Configuracion actualizada correctamente para: $domain"
