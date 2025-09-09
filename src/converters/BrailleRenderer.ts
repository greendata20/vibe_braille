import { BraillePattern } from './BrailleConverter';

export interface RenderOptions {
  cellWidth: number;      // 점자 셀 너비 (픽셀)
  cellHeight: number;     // 점자 셀 높이 (픽셀)
  dotRadius: number;      // 점 반지름 (픽셀)
  dotSpacing: number;     // 점 간 간격 (픽셀)
  lineSpacing: number;    // 줄 간격 (픽셀)
  margin: number;         // 여백 (픽셀)
  backgroundColor: string; // 배경색
  dotColor: string;       // 점 색상
  showGrid: boolean;      // 격자 표시 여부
  gridColor: string;      // 격자 색상
}

export class BrailleRenderer {
  private static defaultOptions: RenderOptions = {
    cellWidth: 40,
    cellHeight: 60,
    dotRadius: 3,
    dotSpacing: 8,
    lineSpacing: 20,
    margin: 20,
    backgroundColor: '#ffffff',
    dotColor: '#000000',
    showGrid: false,
    gridColor: '#e0e0e0'
  };

  // 점자 패턴을 캔버스에 렌더링
  static renderToCanvas(
    patterns: BraillePattern[], 
    canvas: HTMLCanvasElement, 
    options: Partial<RenderOptions> = {}
  ): void {
    const opts = { ...this.defaultOptions, ...options };
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 텍스트를 줄별로 분할
    const lines = this.splitIntoLines(patterns);
    
    // 캔버스 크기 계산
    const maxLineLength = Math.max(...lines.map(line => line.length));
    const canvasWidth = maxLineLength * opts.cellWidth + opts.margin * 2;
    const canvasHeight = lines.length * (opts.cellHeight + opts.lineSpacing) + opts.margin * 2;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // 배경 그리기
    ctx.fillStyle = opts.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 격자 그리기 (옵션)
    if (opts.showGrid) {
      this.drawGrid(ctx, canvasWidth, canvasHeight, opts);
    }
    
    // 각 줄 렌더링
    lines.forEach((line, lineIndex) => {
      const y = opts.margin + lineIndex * (opts.cellHeight + opts.lineSpacing);
      
      line.forEach((pattern, charIndex) => {
        const x = opts.margin + charIndex * opts.cellWidth;
        this.renderBrailleCell(ctx, pattern, x, y, opts);
      });
    });
  }

  // SVG로 렌더링
  static renderToSVG(
    patterns: BraillePattern[], 
    options: Partial<RenderOptions> = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    const lines = this.splitIntoLines(patterns);
    
    const maxLineLength = Math.max(...lines.map(line => line.length));
    const svgWidth = maxLineLength * opts.cellWidth + opts.margin * 2;
    const svgHeight = lines.length * (opts.cellHeight + opts.lineSpacing) + opts.margin * 2;
    
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="${opts.backgroundColor}"/>`;
    
    // 격자 추가 (옵션)
    if (opts.showGrid) {
      svg += this.generateGridSVG(svgWidth, svgHeight, opts);
    }
    
    // 각 줄 렌더링
    lines.forEach((line, lineIndex) => {
      const y = opts.margin + lineIndex * (opts.cellHeight + opts.lineSpacing);
      
      line.forEach((pattern, charIndex) => {
        const x = opts.margin + charIndex * opts.cellWidth;
        svg += this.generateBrailleCellSVG(pattern, x, y, opts);
      });
    });
    
    svg += '</svg>';
    return svg;
  }

  // 패턴을 줄별로 분할
  private static splitIntoLines(patterns: BraillePattern[]): BraillePattern[][] {
    const lines: BraillePattern[][] = [];
    let currentLine: BraillePattern[] = [];
    
    for (const pattern of patterns) {
      if (pattern.char === '\n') {
        lines.push([...currentLine]);
        currentLine = [];
      } else {
        currentLine.push(pattern);
      }
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [[]];
  }

  // 점자 셀 렌더링 (캔버스)
  private static renderBrailleCell(
    ctx: CanvasRenderingContext2D,
    pattern: BraillePattern,
    x: number,
    y: number,
    opts: RenderOptions
  ): void {
    if (pattern.char === ' ') return; // 공백은 렌더링하지 않음
    
    ctx.fillStyle = opts.dotColor;
    
    // 점자 점 위치 매핑 (표준 점자 배열)
    const dotPositions: Record<number, [number, number]> = {
      1: [0, 0],     // 왼쪽 위
      2: [0, 1],     // 왼쪽 가운데
      3: [0, 2],     // 왼쪽 아래
      4: [1, 0],     // 오른쪽 위
      5: [1, 1],     // 오른쪽 가운데
      6: [1, 2],     // 오른쪽 아래
      7: [0, 3],     // 왼쪽 최하단 (8점 점자)
      8: [1, 3]      // 오른쪽 최하단 (8점 점자)
    };
    
    // 각 점 그리기
    for (const dot of pattern.dots) {
      const [col, row] = dotPositions[dot] || [0, 0];
      const dotX = x + opts.cellWidth / 4 + col * (opts.cellWidth / 2);
      const dotY = y + opts.cellHeight / 6 + row * (opts.cellHeight / 4);
      
      ctx.beginPath();
      ctx.arc(dotX, dotY, opts.dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 점자 셀 SVG 생성
  private static generateBrailleCellSVG(
    pattern: BraillePattern,
    x: number,
    y: number,
    opts: RenderOptions
  ): string {
    if (pattern.char === ' ') return ''; // 공백은 렌더링하지 않음
    
    let svg = '';
    
    const dotPositions: Record<number, [number, number]> = {
      1: [0, 0], 2: [0, 1], 3: [0, 2],
      4: [1, 0], 5: [1, 1], 6: [1, 2],
      7: [0, 3], 8: [1, 3]
    };
    
    for (const dot of pattern.dots) {
      const [col, row] = dotPositions[dot] || [0, 0];
      const dotX = x + opts.cellWidth / 4 + col * (opts.cellWidth / 2);
      const dotY = y + opts.cellHeight / 6 + row * (opts.cellHeight / 4);
      
      svg += `<circle cx="${dotX}" cy="${dotY}" r="${opts.dotRadius}" fill="${opts.dotColor}"/>`;
    }
    
    return svg;
  }

  // 격자 그리기 (캔버스)
  private static drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    opts: RenderOptions
  ): void {
    ctx.strokeStyle = opts.gridColor;
    ctx.lineWidth = 0.5;
    
    // 수직선
    for (let x = opts.margin; x <= width - opts.margin; x += opts.cellWidth) {
      ctx.beginPath();
      ctx.moveTo(x, opts.margin);
      ctx.lineTo(x, height - opts.margin);
      ctx.stroke();
    }
    
    // 수평선
    for (let y = opts.margin; y <= height - opts.margin; y += opts.cellHeight + opts.lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(opts.margin, y);
      ctx.lineTo(width - opts.margin, y);
      ctx.stroke();
    }
  }

  // 격자 SVG 생성
  private static generateGridSVG(width: number, height: number, opts: RenderOptions): string {
    let svg = '';
    
    // 수직선
    for (let x = opts.margin; x <= width - opts.margin; x += opts.cellWidth) {
      svg += `<line x1="${x}" y1="${opts.margin}" x2="${x}" y2="${height - opts.margin}" stroke="${opts.gridColor}" stroke-width="0.5"/>`;
    }
    
    // 수평선  
    for (let y = opts.margin; y <= height - opts.margin; y += opts.cellHeight + opts.lineSpacing) {
      svg += `<line x1="${opts.margin}" y1="${y}" x2="${width - opts.margin}" y2="${y}" stroke="${opts.gridColor}" stroke-width="0.5"/>`;
    }
    
    return svg;
  }

  // 캔버스를 이미지로 변환
  static canvasToImage(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png', quality = 0.9): string {
    return canvas.toDataURL(`image/${format}`, quality);
  }

  // SVG를 다운로드 가능한 형태로 변환
  static svgToDownload(svgString: string, filename: string = 'braille'): void {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.svg`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  // 캔버스를 다운로드 가능한 형태로 변환
  static canvasToDownload(canvas: HTMLCanvasElement, filename: string = 'braille', format: 'png' | 'jpeg' = 'png'): void {
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format}`;
      link.click();
      
      URL.revokeObjectURL(url);
    }, `image/${format}`);
  }
}