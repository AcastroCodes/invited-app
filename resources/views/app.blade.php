<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Invited</title>
    <script>
        window.onerror = function(message, source, lineno, colno, error) {
            alert('Global Error: ' + message + '\nLine: ' + lineno);
        };
    </script>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />
    
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="font-sans antialiased text-slate-900 bg-slate-50">
    <div id="app"></div>
</body>
</html>
