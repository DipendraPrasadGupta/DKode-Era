declare module 'qr-code-styling' {
  export interface QRCodeStylingOptions {
    width?: number;
    height?: number;
    type?: 'canvas' | 'svg';
    data?: string;
    margin?: number;
    image?: string;
    qrOptions?: { errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' };
    dotsOptions?: { color?: string; type?: string };
    cornersSquareOptions?: { color?: string; type?: string };
    cornersDotOptions?: { color?: string; type?: string };
    backgroundOptions?: { color?: string };
    imageOptions?: { crossOrigin?: string; margin?: number; imageSize?: number };
  }

  export default class QRCodeStyling {
    constructor(options: QRCodeStylingOptions);
    append(container: HTMLElement): void;
    update(options: QRCodeStylingOptions): void;
    download(options: { name: string; extension: 'png' | 'svg' | 'jpeg' | 'webp' }): Promise<void>;
  }
}
