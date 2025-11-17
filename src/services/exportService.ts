import { toast } from "sonner";

/**
 * Lightweight, dependency‑free export helpers for front‑end only rollout.
 * Strategy: open a temporary print window containing a cloned element, apply basic print styles,
 * then trigger window.print(). User can choose “Save as PDF” in the print dialog.
 */
export type PrintOptions = {
  title?: string;
  fileName?: string; // retained for future PDF generation; not used by window.print
  page?: "A4" | "Letter";
  extraStyles?: string; // optional extra CSS injected into print window
};

async function ensureLibrariesLoaded(): Promise<void> {
  // Prefer bundled libs (Option B), fallback to CDN, then print.
  const win: any = window as any;
  const hasHtml2Canvas = typeof win.html2canvas === "function";
  const hasJsPDF = typeof win.jspdf?.jsPDF === "function";
  if (hasHtml2Canvas && hasJsPDF) return;

  // Try dynamic ESM imports first (requires npm installs):
  // npm i html2canvas jspdf (or use CDN ESM below)
  try {
    if (!hasHtml2Canvas) {
      const mod = await import(
        /* @vite-ignore */ "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js"
      );
      win.html2canvas = mod.default || mod;
    }
    if (!hasJsPDF) {
      // Try ESM build first; if unavailable, we'll load UMD script below
      try {
        const mod = await import(
          /* @vite-ignore */ "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.es.min.js"
        );
        win.jspdf = mod;
      } catch {
        // ignore, will load UMD next
      }
    }
    if (typeof win.html2canvas === "function" && win.jspdf?.jsPDF) return;
  } catch {
    // ignore and proceed to script loading
  }

  const loaders: Promise<void>[] = [];
  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.crossOrigin = "anonymous";
      s.referrerPolicy = "no-referrer";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }
  if (!hasHtml2Canvas) {
    loaders.push(loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"));
  }
  if (!hasJsPDF) {
    loaders.push(loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"));
  }
  if (loaders.length) await Promise.all(loaders);
}

/**
 * Export a DOM element directly to a PDF file and trigger download (no print dialog).
 * Uses html2canvas + jsPDF via CDN. Assumes the element is styled as A4 (we measure pixels).
 */
export async function exportElementToPdf(el: HTMLElement | null, fileName = "resume.pdf") {
  try {
    if (!el) {
      toast.error("Nothing to export. Please make sure the preview is visible.");
      return;
    }
    // Ensure layout is flushed before capture
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await ensureLibrariesLoaded();
    const html2canvas = (window as any).html2canvas as (node: HTMLElement, opts?: any) => Promise<HTMLCanvasElement>;
    const { jsPDF } = (window as any).jspdf;
    if (!html2canvas || !jsPDF) {
      throw new Error("PDF libraries not available");
    }

    // Scale up for crisp rendering
    const scale = 2;
    const canvas = await html2canvas(el, {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      removeContainer: true,
      allowTaint: true,
      logging: false,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    // A4 in jsPDF is 210 x 297 mm → in points 595.28 x 841.89 (default unit 'pt'), but we will use 'mm'
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const pageHeight = 297;

    // Determine image size relative to page while preserving aspect ratio
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    // Assume 96 DPI for CSS pixels; compute mm per px on A4 width
    // We instead fit by width in mm and scale height proportionally
    const margin = 0;
    const renderWidth = pageWidth - margin * 2;
    const renderHeight = (imgHeightPx / imgWidthPx) * renderWidth;

    let y = margin;

    if (renderHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, "PNG", margin, y, renderWidth, renderHeight, undefined, "FAST");
    } else {
      // Split across pages
      let remainingHeight = renderHeight;
      const pageContentHeight = pageHeight - margin * 2;
      let canvasOffset = 0;

      while (remainingHeight > 0) {
        const sliceHeightPx = Math.round((pageContentHeight / renderHeight) * imgHeightPx);
        // Create a temporary canvas slice
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = imgWidthPx;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) break;
        ctx.drawImage(
          canvas,
          0,
          canvasOffset,
          imgWidthPx,
          sliceHeightPx,
          0,
          0,
          imgWidthPx,
          sliceHeightPx
        );
        const sliceData = sliceCanvas.toDataURL("image/png");
        pdf.addImage(sliceData, "PNG", margin, margin, renderWidth, pageContentHeight, undefined, "FAST");

        remainingHeight -= pageContentHeight;
        canvasOffset += sliceHeightPx;
        if (remainingHeight > 0) pdf.addPage();
      }
    }

    pdf.save(fileName);
    toast.success("PDF downloaded");
  } catch (e) {
    console.error(e);
    // Fallback to print-based export to avoid blocking user
    if (el) {
      toast.info("Direct PDF failed; falling back to print-to-PDF...");
      exportElementToPrint(el, { title: fileName.replace(/\.pdf$/i, "") });
      return;
    }
    toast.error("Failed to generate PDF.");
  }
}

function collectHeadStyles(): string {
  // Copy <style> and <link rel="stylesheet"> tags from current document into the print window
  const parts: string[] = [];
  const nodes = document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
    'style, link[rel="stylesheet"]'
  );
  nodes.forEach((n) => {
    if (n.tagName.toLowerCase() === "style") {
      parts.push(`<style>${(n as HTMLStyleElement).innerHTML}</style>`);
    } else if (n.tagName.toLowerCase() === "link") {
      const link = n as HTMLLinkElement;
      const href = link.getAttribute("href");
      if (href) {
        // Keep rel and href
        const media = link.getAttribute("media");
        parts.push(
          `<link rel="stylesheet"${media ? ` media="${media}"` : ""} href="${href}">`
        );
      }
    }
  });
  return parts.join("\n");
}

export function exportElementToPrint(el: HTMLElement | null, opts: PrintOptions = {}) {
  if (!el) {
    toast.error("Nothing to export. Please make sure the preview is visible.");
    return;
  }
  const title = opts.title || document.title || "Export";
  const page = opts.page || "A4";

  const printWin = window.open("", "_blank", "noopener,noreferrer,width=1024,height=768");
  if (!printWin) {
    toast.error("Pop‑up blocked. Please allow pop‑ups and try again.");
    return;
  }

  const headStyles = collectHeadStyles();
  const printCss = `
    <style>
      @page { size: ${page}; margin: 12mm; }
      html, body { height: auto; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      /* Ensure backgrounds and gradients render in print */
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      /* Avoid page breaks inside common blocks */
      .no-break, .no-break * { break-inside: avoid; page-break-inside: avoid; }
      ${opts.extraStyles || ""}
    </style>
  `;

  // Clone the element content
  const wrapper = document.createElement("div");
  const clone = el.cloneNode(true) as HTMLElement;
  // Remove any UI-only toggles that shouldn't appear in print (heuristic)
  clone.querySelectorAll("[data-no-print],[data-print-hidden]").forEach((n) => n.remove());
  wrapper.appendChild(clone);

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${headStyles}
        ${printCss}
      </head>
      <body>
        <div id="print-root">${wrapper.innerHTML}</div>
        <script>
          // Defer print until styles apply
          window.addEventListener('load', function () {
            setTimeout(function () {
              window.print();
              window.close();
            }, 300);
          });
        </script>
      </body>
    </html>
  `;

  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
}

/**
 * Trigger a JSON download. Useful for “Download My Data” exports.
 */
export function exportJSON(data: unknown, fileName = "export.json") {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  } catch (e) {
    console.error(e);
    toast.error("Failed to export JSON");
  }
}


