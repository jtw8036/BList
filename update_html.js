import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// Replace all icon paths with absolute URLs for GitHub Pages
html = html.replace(/<link rel="apple-touch-icon".*?>/g, '');
html = html.replace(/<link rel="icon".*?>/g, '');
html = html.replace(/<link rel="shortcut icon".*?>/g, '');
html = html.replace(/<link rel="manifest".*?>/g, '');

const headInjection = `
    <link rel="manifest" href="https://jtw8036.github.io/BList/manifest.json?v=4" />
    <link rel="apple-touch-icon" sizes="180x180" href="https://jtw8036.github.io/BList/apple-icon-180-v4.png" />
    <link rel="icon" type="image/svg+xml" href="https://jtw8036.github.io/BList/icon.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="https://jtw8036.github.io/BList/pwa-icon-192.png" />
    <link rel="shortcut icon" href="https://jtw8036.github.io/BList/icon.svg" />
`;

html = html.replace('<!-- Fonts: Preconnect', headInjection + '\n    <!-- Fonts: Preconnect');

fs.writeFileSync('index.html', html);

let manifest = fs.readFileSync('public/manifest.json', 'utf8');
manifest = manifest.replace(/"src": ".*ios-icon-180.png"/, '"src": "https://jtw8036.github.io/BList/apple-icon-180-v4.png"');
manifest = manifest.replace(/"src": ".*pwa-icon-192.png"/, '"src": "https://jtw8036.github.io/BList/pwa-icon-192.png"');
manifest = manifest.replace(/"src": ".*pwa-icon-512.png"/, '"src": "https://jtw8036.github.io/BList/pwa-icon-512.png"');
manifest = manifest.replace(/"src": ".*icon.svg"/g, '"src": "https://jtw8036.github.io/BList/icon.svg"');
fs.writeFileSync('public/manifest.json', manifest);
