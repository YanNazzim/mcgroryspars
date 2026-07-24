// Shared actions for SPAR reference drawings (used by the generator result
// and the Full Database tab).

// Trigger a browser download of the drawing.
export function downloadImage(src, spar) {
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = `${spar}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Open a print-ready window with just this drawing, sized to a landscape page.
export function printImage(src, spar) {
    if (!src) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${spar}</title>
        <style>
            @page { size: landscape; margin: 0.4in; }
            html, body { margin: 0; padding: 0; }
            .wrap { text-align: center; font-family: Arial, sans-serif; }
            h2 { font-size: 16pt; margin: 0 0 8px; }
            img { max-width: 100%; max-height: 92vh; object-fit: contain; }
        </style></head>
        <body>
            <div class="wrap">
                <h2>${spar}</h2>
                <img src="${src}" onload="window.focus();window.print();" />
            </div>
        </body></html>`);
    win.document.close();
}
