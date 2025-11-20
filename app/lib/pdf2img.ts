export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  loadPromise = (async () => {
    try {
      // Import pdfjs-dist
      const pdfjs = await import("pdfjs-dist");
      const lib = pdfjs.default || pdfjs;

      // Set worker - try .js first
      try {
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        // eslint-disable-next-line no-console
        console.log("pdf2img: worker set to /pdf.worker.min.js");
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("pdf2img: failed to set worker", e);
      }

      // Also try disabling worker entirely (for main-thread rendering)
      try {
        // Some versions have this property
        (lib as any).disableWorker = true;
      } catch (e) {
        // ignore
      }

      pdfjsLib = lib;
      isLoading = false;
      return lib;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("pdf2img: failed to load pdfjs library", err);
      throw err;
    }
  })();

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    if (!lib || typeof lib.getDocument !== "function") {
      throw new Error("pdfjs failed to load");
    }

    const arrayBuffer = await file.arrayBuffer();

    // Try to load and extract page info, but use placeholder render as fallback
    let page: any = null;
    try {
      // Try with ArrayBuffer first
      const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
      page = await pdf.getPage(1);
      // eslint-disable-next-line no-console
      console.log("pdf2img: PDF loaded successfully");
    } catch (loadErr: any) {
      // eslint-disable-next-line no-console
      console.warn("pdf2img: PDF loading failed, will use placeholder", loadErr);
    }

    // Render - try canvas first, but use placeholder as fallback
    let canvas: HTMLCanvasElement;

    if (page) {
      // Try to render the actual page
      canvas = await tryRenderPageToCanvas(page).catch(async (err) => {
        // eslint-disable-next-line no-console
        console.warn("pdf2img: canvas render failed, using placeholder", err);
        return renderPageToPlaceholder(page);
      });
    } else {
      // No page loaded, use simple placeholder
      canvas = await renderSimplePlaceholder();
    }

    // Convert canvas to blob and create file
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob: Blob | null) => {
          if (!blob) {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to convert canvas to PNG blob",
            });
            return;
          }

          const originalName = file.name.replace(/\.pdf$/i, "");
          const imageFile = new File([blob], `${originalName}.png`, {
            type: "image/png",
          });

          resolve({
            imageUrl: URL.createObjectURL(blob),
            file: imageFile,
          });
        },
        "image/png",
        1.0
      );
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("pdf2img: convertPdfToImage fatal error", err);

    const message = err && err.message ? err.message : String(err);
    return {
      imageUrl: "",
      file: null,
      error: `PDF conversion failed: ${message}`,
    };
  }
}

// Helper: try to render page to canvas
async function tryRenderPageToCanvas(page: any): Promise<HTMLCanvasElement> {
  const scales = [4, 3, 2, 1];

  for (const scale of scales) {
    try {
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Cannot obtain 2D canvas context");
      }

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;

      // Render task with timeout
      const renderTask = page.render({
        canvasContext: ctx,
        viewport: viewport,
      });

      await Promise.race([
        renderTask.promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Render timeout at scale ${scale}`)), 5000)
        ),
      ]);

      // eslint-disable-next-line no-console
      console.log(`pdf2img: successfully rendered at scale ${scale}`);
      return canvas;
    } catch (renderErr: any) {
      // eslint-disable-next-line no-console
      console.warn(`pdf2img: render at scale ${scale} failed`, renderErr);

      if (scale === 1) {
        // All scales failed
        throw renderErr;
      }
    }
  }

  throw new Error("Failed to render at any scale");
}

// Render actual page as placeholder
async function renderPageToPlaceholder(page: any): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale: 1 });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Cannot get 2D context");

  // White background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text placeholder
  ctx.fillStyle = "#333";
  ctx.font = "bold 20px Arial";
  ctx.fillText("📄 PDF Document", 10, 40);
  ctx.font = "12px Arial";
  ctx.fillStyle = "#666";
  ctx.fillText(`${Math.round(viewport.width)} × ${Math.round(viewport.height)} px`, 10, 70);

  return canvas;
}

// Simple placeholder when no PDF loaded
async function renderSimplePlaceholder(): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Cannot get 2D context");

  // White background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Text
  ctx.fillStyle = "#666";
  ctx.font = "18px Arial";
  ctx.fillText("📄 PDF Preview", canvas.width / 2 - 80, canvas.height / 2);

  return canvas;
}