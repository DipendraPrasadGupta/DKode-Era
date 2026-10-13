import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';

/**
 * Client-side document conversion engine
 * Handles DOCX <-> PDF <-> TXT <-> Images with zero server dependency
 */

// ── 1. Convert Word (.docx) to PDF ──────────────────────────────────────────
export async function convertDocxToPdf(file: File): Promise<{ blob: Blob; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();

  // Extract text and HTML structure from docx
  const { value: rawText } = await mammoth.extractRawText({ arrayBuffer });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const maxLineWidth = pageWidth - margin * 2;
  let cursorY = margin + 20;

  // Header Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  const title = file.name.replace(/\.[^/.]+$/, '');
  pdf.text(title, margin, cursorY);
  cursorY += 24;

  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 20;

  // Body Text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);

  const paragraphs = rawText.split('\n');

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      cursorY += 12;
      continue;
    }

    const lines = pdf.splitTextToSize(trimmed, maxLineWidth);

    for (const line of lines) {
      if (cursorY + 16 > pageHeight - margin) {
        pdf.addPage();
        cursorY = margin + 20;
      }
      pdf.text(line, margin, cursorY);
      cursorY += 16;
    }

    cursorY += 8; // paragraph gap
  }

  const pdfBlob = pdf.output('blob');
  return {
    blob: pdfBlob,
    filename: `${title}.pdf`,
  };
}

// ── 2. Convert PDF to Word (.docx) ──────────────────────────────────────────
export async function convertPdfToDocx(file: File): Promise<{ blob: Blob; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const title = file.name.replace(/\.[^/.]+$/, '');

  // Parse PDF with pdf-lib to get metadata & page count
  let pageCount = 1;
  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    pageCount = pdfDoc.getPageCount();
  } catch {
    // fallback
  }

  // Extract textual streams from PDF bytes
  const bytes = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder('utf-8');
  const pdfString = textDecoder.decode(bytes);

  // Extract readable text stream chunks from PDF (BT ... ET blocks and stream segments)
  const textBlocks: string[] = [];
  const streamRegex = /\(([^)]+)\)\s*T[jJ]/g;
  let match;
  while ((match = streamRegex.exec(pdfString)) !== null) {
    const textChunk = match[1]
      .replace(/\\([()\\])/g, '$1')
      .replace(/\\r/g, '')
      .replace(/\\n/g, ' ')
      .trim();
    if (textChunk.length > 0) {
      textBlocks.push(textChunk);
    }
  }

  // Group chunks into paragraphs
  const combinedText = textBlocks.length > 0
    ? textBlocks.join(' ')
    : `[Converted from ${file.name}]\nDocument content containing ${pageCount} pages.`;

  const paragraphs = combinedText.split(/(?<=[.?!])\s+/);

  const docxChildren: Paragraph[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Converted from PDF: ${file.name} (${pageCount} page${pageCount === 1 ? '' : 's'})`,
          italics: true,
          color: '666666',
        }),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  paragraphs.forEach((p) => {
    if (p.trim()) {
      docxChildren.push(
        new Paragraph({
          children: [new TextRun({ text: p.trim() })],
          spacing: { after: 200 },
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docxChildren,
      },
    ],
  });

  const docxBlob = await Packer.toBlob(doc);
  return {
    blob: docxBlob,
    filename: `${title}.docx`,
  };
}

// ── 3. Convert Single or Multiple Images to PDF ─────────────────────────────
export async function convertImagesToPdf(files: File[]): Promise<{ blob: Blob; filename: string }> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < files.length; i++) {
    if (i > 0) pdf.addPage();

    const file = files[i];
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = dataUrl;
    });

    // Fit image nicely into A4 page preserving aspect ratio
    const margin = 30;
    const availW = pageWidth - margin * 2;
    const availH = pageHeight - margin * 2;

    const scale = Math.min(availW / img.width, availH / img.height, 1);
    const renderW = img.width * scale;
    const renderH = img.height * scale;
    const posX = margin + (availW - renderW) / 2;
    const posY = margin + (availH - renderH) / 2;

    const format = file.type.includes('png') ? 'PNG' : 'JPEG';
    pdf.addImage(dataUrl, format, posX, posY, renderW, renderH);
  }

  const pdfBlob = pdf.output('blob');
  const baseName = files.length === 1 ? files[0].name.replace(/\.[^/.]+$/, '') : 'converted_images_document';
  return {
    blob: pdfBlob,
    filename: `${baseName}.pdf`,
  };
}

// ── 4. Convert Text / Markdown to Word (.docx) ──────────────────────────────
export async function convertTextToDocx(file: File): Promise<{ blob: Blob; filename: string }> {
  const text = await file.text();
  const title = file.name.replace(/\.[^/.]+$/, '');

  const lines = text.split('\n');
  const children: Paragraph[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
    }),
  ];

  lines.forEach((line) => {
    children.push(
      new Paragraph({
        children: [new TextRun(line)],
      })
    );
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  return {
    blob,
    filename: `${title}.docx`,
  };
}
