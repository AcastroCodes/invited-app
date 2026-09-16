import os from 'os';
import fs from 'fs';
import path from 'path';
import concurrently from 'concurrently';

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    let bestIp = '127.0.0.1';
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
                    return iface.address;
                }
                bestIp = iface.address;
            }
        }
    }
    return bestIp;
}

const ip = getLocalIp();

// Actualizar archivo .env con la IP, dominio de Vite HTTPS y Sanctum
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    if (envContent.includes('APP_URL=')) {
        envContent = envContent.replace(/^APP_URL=.*/m, `APP_URL=https://${ip}:5173`);
    } else {
        envContent += `\nAPP_URL=https://${ip}:5173`;
    }

    if (envContent.includes('VITE_DEV_DOMAIN=')) {
        envContent = envContent.replace(/^VITE_DEV_DOMAIN=.*/m, `VITE_DEV_DOMAIN=${ip}`);
    } else {
        envContent += `\nVITE_DEV_DOMAIN=${ip}`;
    }

    const statefulDomains = `localhost,localhost:8000,localhost:5173,127.0.0.1,127.0.0.1:8000,127.0.0.1:5173,127.0.0.1:8081,${ip},${ip}:8000,${ip}:5173,${ip}:8081`;
    if (envContent.includes('SANCTUM_STATEFUL_DOMAINS=')) {
        envContent = envContent.replace(/^SANCTUM_STATEFUL_DOMAINS=.*/m, `SANCTUM_STATEFUL_DOMAINS="${statefulDomains}"`);
    } else {
        envContent += `\nSANCTUM_STATEFUL_DOMAINS="${statefulDomains}"`;
    }

    fs.writeFileSync(envPath, envContent, 'utf-8');
}

console.log(`\n\x1b[42m\x1b[30m INICIANDO EN RED LOCAL HTTPS \x1b[0m \x1b[32mIP detectada: ${ip}\x1b[0m`);
console.log(`\x1b[36mAccede desde tu dispositivo Android a: https://${ip}:5173\x1b[0m\n`);

concurrently([
    { command: `php artisan serve --host=0.0.0.0 --port=8081`, name: 'laravel', prefixColor: '#93c5fd' },
    { command: `npx vite --host`, name: 'vite', prefixColor: '#c4b5fd' }
], {
    killOthersOn: ['failure', 'success'],
});

