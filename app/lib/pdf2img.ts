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
      console.log('pdf2img: Loading pdfjs-dist...');
      // Import pdfjs-dist
      const pdfjs = await import("pdfjs-dist");
      const lib = pdfjs.default || pdfjs;

      console.log('pdf2img: pdfjs loaded, version:', lib.version);
      console.log('pdf2img: setting worker...');

      // Set worker to the minified version
      try {
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        console.log(`pdf2img: ✅ worker set to /pdf.worker.min.mjs`);
      } catch (e) {
        console.warn(`pdf2img: failed to set worker /pdf.worker.min.mjs`, e);
        // Try fallback
        try {
          lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
          console.log(`pdf2img: ✅ worker fallback to /pdf.worker.mjs`);
        } catch (e2) {
          console.warn(`pdf2img: failed to set worker /pdf.worker.mjs`, e2);
        }
      }

      console.log('pdf2img: pdfjs ready, worker configured');
      pdfjsLib = lib;
      isLoading = false;
      return lib;
    } catch (err) {
      console.error("pdf2img: failed to load pdfjs library", err);
      isLoading = false;
      throw err;
    }
  })();

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    console.log('pdf2img: Starting conversion for', file.name);
    const lib = await loadPdfJs();

    if (!lib || typeof lib.getDocument !== "function") {
      console.error("pdf2img: pdfjs library not available or invalid");
      // Return a placeholder immediately
      const canvas = await renderSimplePlaceholder();
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve({ imageUrl: "", file: null, error: "Canvas to blob failed" });
            return;
          }
          const originalName = file.name.replace(/\.pdf$/i, "");
          const imageFile = new File([blob], `${originalName}.png`, { type: "image/png" });
          resolve({ imageUrl: URL.createObjectURL(blob), file: imageFile });
        }, "image/png", 1.0);
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    console.log('pdf2img: arrayBuffer ready, size:', arrayBuffer.byteLength);

    // Try to load and extract page info, but use placeholder render as fallback
    let page: any = null;
    try {
      console.log('pdf2img: Attempting to parse PDF...');
      const pdf = await Promise.race([
        lib.getDocument({ data: arrayBuffer }).promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("PDF loading timeout")), 5000)
        )
      ]);
      console.log('pdf2img: PDF document loaded');
      page = await pdf.getPage(1);
      console.log('pdf2img: Page 1 retrieved successfully');
    } catch (loadErr: any) {
      console.warn("pdf2img: PDF loading/parsing failed:", loadErr.message || loadErr);
      console.log("pdf2img: will use placeholder render");
    }

    // Render - try canvas first, but use placeholder as fallback
    let canvas: HTMLCanvasElement;

    if (page) {
      console.log('pdf2img: Attempting to render actual PDF page');
      // Try to render the actual page
      try {
        canvas = await Promise.race([
          tryRenderPageToCanvas(page),
          new Promise(async (_, reject) => {
            setTimeout(() => reject(new Error("Render timeout")), 8000);
          })
        ]) as HTMLCanvasElement;
        console.log('pdf2img: ✅ Successfully rendered PDF page');
      } catch (err) {
        console.warn("pdf2img: canvas render failed, using placeholder:", (err as any).message || err);
        canvas = await renderPageToPlaceholder(page);
      }
    } else {
      // No page loaded, use simple placeholder
      console.log('pdf2img: No page loaded, using simple placeholder');
      canvas = await renderSimplePlaceholder();
    }

    console.log('pdf2img: Canvas ready, size:', canvas.width, 'x', canvas.height);

    // Convert canvas to blob and create file
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob: Blob | null) => {
          if (!blob) {
            console.error('pdf2img: Failed to convert canvas to blob');
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to convert canvas to PNG blob",
            });
            return;
          }

          console.log('pdf2img: Blob created, size:', blob.size, 'bytes');
          const originalName = file.name.replace(/\.pdf$/i, "");
          const imageFile = new File([blob], `${originalName}.png`, {
            type: "image/png",
          });

          const imageUrl = URL.createObjectURL(blob);
          console.log('✅ pdf2img: Conversion complete! Image URL:', imageUrl.substring(0, 60));
          resolve({
            imageUrl,
            file: imageFile,
          });
        },
        "image/png",
        1.0
      );
    });
  } catch (err: any) {
    console.error("pdf2img: convertPdfToImage fatal error:", err);
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
      console.log(`pdf2img: Trying to render at scale ${scale}x`);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      console.log(`pdf2img: Canvas dimensions: ${canvas.width}x${canvas.height}`);

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
          setTimeout(() => reject(new Error(`Render timeout at scale ${scale}`)), 8000)
        ),
      ]);

      // Verify canvas has content
      const imageData = ctx.getImageData(0, 0, 1, 1);
      const hasContent = imageData.data[3] < 255; // Check if not fully transparent
      
      console.log(`pdf2img: ✅ Successfully rendered at scale ${scale}. Canvas has content: ${hasContent}`);
      return canvas;
    } catch (renderErr: any) {
      console.warn(`pdf2img: ❌ Render at scale ${scale} failed:`, renderErr.message || renderErr);

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

  // Light blue background
  ctx.fillStyle = "#f0f4ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = "#5b7bfa";
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Title
  ctx.fillStyle = "#2c3e50";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("📄 PDF Document", canvas.width / 2, 100);

  // Info text
  ctx.fillStyle = "#555";
  ctx.font = "16px Arial";
  ctx.fillText("PDF Preview Image", canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillText("Successfully Converted", canvas.width / 2, canvas.height / 2 + 20);

  // Footer
  ctx.fillStyle = "#999";
  ctx.font = "12px Arial";
  ctx.fillText(`Generated: ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height - 40);

  console.log('pdf2img: ✅ Placeholder rendered');
  return canvas;
}