import { Container, Graphics } from 'pixi.js';

export class DrawingCanvas extends Container {
    private currentLine: Graphics | null = null;
    private isDrawing: boolean = false;
    private lineColor: number = 0x000000;
    private lineWidth: number = 3;
    private userLines: Graphics[] = [];

    private userDrawingLayer: Container;
    private treeLayer: Container;

    constructor(width: number, height: number) {
        super();

        // Tạo nền vẽ
        const drawArea = new Graphics();
        drawArea.setStrokeStyle({ width: 2, color: 0x999999 });
        drawArea.setFillStyle({ color: 0xF0F8FF, alpha: 0.5 });
        
        // Bo tròn góc với radius 20px
        drawArea.drawRoundedRect(0, 0, width, height, 20);
        drawArea.fill();
        drawArea.stroke();
        this.addChild(drawArea);

        // Tạo 2 layer: 1 cho cây/trang trí, 1 cho người dùng vẽ
        this.treeLayer = new Container();
        this.addChild(this.treeLayer);

        this.userDrawingLayer = new Container();
        this.addChild(this.userDrawingLayer);

        // Cấu hình sự kiện cho vùng vẽ
        drawArea.eventMode = 'static';
        drawArea.cursor = 'crosshair';

        drawArea.on('pointerdown', this.onPointerDown.bind(this));
        drawArea.on('pointermove', this.onPointerMove.bind(this));
        drawArea.on('pointerup', this.onPointerUp.bind(this));
        drawArea.on('pointerupoutside', this.onPointerUp.bind(this));

        // Vẽ cây thông sau 1 giây
        setTimeout(() => {
            this.drawChristmasTree();
        }, 1000);
    }

    private onPointerDown(event: any): void {
        this.isDrawing = true;
        const pos = event.getLocalPosition(this);

        this.currentLine = new Graphics();
        this.currentLine.setStrokeStyle({ width: this.lineWidth, color: this.lineColor });
        this.currentLine.beginPath();
        this.currentLine.moveTo(pos.x, pos.y);

        this.userDrawingLayer.addChild(this.currentLine);
        this.userLines.push(this.currentLine);
    }

    private onPointerMove(event: any): void {
        if (!this.isDrawing || !this.currentLine) return;
        const pos = event.getLocalPosition(this);
        this.currentLine.lineTo(pos.x, pos.y);
        this.currentLine.stroke();
    }

    private onPointerUp(): void {
        this.isDrawing = false;
        this.currentLine = null;
    }

    public setColor(color: number): void {
        this.lineColor = color;
    }

    public setLineWidth(width: number): void {
        this.lineWidth = width;
    }

    // Xóa toàn bộ nét vẽ và cây thông
    public clear(): void {
        // Xóa các nét vẽ của người dùng
        this.userLines.forEach(line => {
            this.userDrawingLayer.removeChild(line);
            line.destroy();
        });
        this.userLines = [];

        // Xóa toàn bộ các phần tử trong treeLayer
        this.treeLayer.removeChildren();
    }

    // Chỉ xóa nét vẽ của người dùng
    public clearUserDrawing(): void {
        this.userLines.forEach(line => {
            this.userDrawingLayer.removeChild(line);
            line.destroy();
        });
        this.userLines = [];
    }

    private async drawTreePart(graphics: Graphics, drawFunction: () => void): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                drawFunction();
                resolve();
            }, 300); 
        });
    }

    private async drawLine(graphics: Graphics, points: {x: number, y: number}[], fillColor?: number): Promise<void> {
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50));
            graphics.lineTo(points[i].x, points[i].y);
        }

        if (fillColor !== undefined) {
            graphics.fill();
        }
        graphics.stroke();
    }

    private async drawBezierCurve(
        graphics: Graphics, start: {x: number, y: number}, cp1: {x: number, y: number}, 
        cp2: {x: number, y: number}, end: {x: number, y: number}, steps: number = 20, fillColor?: number
    ): Promise<void> {
        if (fillColor !== undefined) {
            graphics.setFillStyle({ color: fillColor });
        }
        
        const points: {x: number, y: number}[] = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.pow(1-t, 3)*start.x + 
                     3*Math.pow(1-t, 2)*t*cp1.x + 
                     3*(1-t)*Math.pow(t, 2)*cp2.x + 
                     Math.pow(t, 3)*end.x;
            const y = Math.pow(1-t, 3)*start.y + 
                     3*Math.pow(1-t, 2)*t*cp1.y + 
                     3*(1-t)*Math.pow(t, 2)*cp2.y + 
                     Math.pow(t, 3)*end.y;
            points.push({x, y});
        }

        graphics.beginPath();
        for (let i = 0; i < points.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50));
            if (i === 0) {
                graphics.moveTo(points[i].x, points[i].y);
            } else {
                graphics.lineTo(points[i].x, points[i].y);
            }
            graphics.stroke();
        }
        
        if (fillColor !== undefined) {
            graphics.fill();
        }
    }

    private async drawCurvePart(graphics: Graphics, points: {x: number, y: number}[], isFirst: boolean = false): Promise<void> {
        if (isFirst) {
            graphics.moveTo(points[0].x, points[0].y);
        }

        for (let i = 1; i < points.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 30));
            graphics.lineTo(points[i].x, points[i].y);
            graphics.stroke();
        }
    }

    public async drawChristmasTree(): Promise<void> {
        const centerX = this.width / 2;
        const startY = this.height * 0.85;
        const baseWidth = this.width * 0.4;
        const treeHeight = this.height * 0.65;
        const layerHeight = treeHeight / 6;
        const layers = 5;

        const potGraphics = new Graphics();
        const trunkGraphics = new Graphics();
        const leavesGraphics = new Graphics();
        const decorationsGraphics = new Graphics();
        const starGraphics = new Graphics();
        const wavyLinesGraphics = new Graphics();

        this.treeLayer.addChild(
            potGraphics, 
            trunkGraphics, 
            leavesGraphics, 
            wavyLinesGraphics,
            decorationsGraphics, 
            starGraphics
        );

        // Vẽ chậu
        potGraphics.setStrokeStyle({ width: 2, color: 0x8b4513 });
        potGraphics.setFillStyle({ color: 0xcd853f });
        const potWidth = baseWidth * 0.08 * 2.5;
        const potHeight = treeHeight * 0.08 * 1.2;
        const potTopWidth = potWidth * 1.2;

        await this.drawLine(potGraphics, [
            {x: centerX - potTopWidth/2, y: startY + treeHeight * 0.08},
            {x: centerX - potWidth/2, y: startY + treeHeight * 0.08 + potHeight},
            {x: centerX + potWidth/2, y: startY + treeHeight * 0.08 + potHeight},
            {x: centerX + potTopWidth/2, y: startY + treeHeight * 0.08},
            {x: centerX - potTopWidth/2, y: startY + treeHeight * 0.08}
        ], 0xcd853f);

        // Vẽ thân cây
        trunkGraphics.setStrokeStyle({ width: 2, color: 0x8b4513 });
        trunkGraphics.setFillStyle({ color: 0xa0522d });
        const trunkWidth = baseWidth * 0.08;
        const trunkHeight = treeHeight * 0.08;

        await this.drawLine(trunkGraphics, [
            {x: centerX - trunkWidth/2, y: startY},
            {x: centerX - trunkWidth/2, y: startY + trunkHeight},
            {x: centerX + trunkWidth/2, y: startY + trunkHeight},
            {x: centerX + trunkWidth/2, y: startY},
            {x: centerX - trunkWidth/2, y: startY}
        ], 0xa0522d);

        // Vẽ các tầng lá từ dưới lên
        for (let i = 0; i < layers; i++) {
            const layerScale = 1 + (layers - i - 1) * 0.2;
            const currentLayerHeight = layerHeight * layerScale;
            const currentY = startY - i * layerHeight * 1.1;
            const layerW = baseWidth * (1 - i * 0.15);

            leavesGraphics.setStrokeStyle({ width: 2, color: 0x0b5345 });

            const leftStart = {x: centerX - layerW/2, y: currentY};
            const leftCP1 = {x: centerX - layerW/3, y: currentY};
            const leftCP2 = {x: centerX - layerW/6, y: currentY - currentLayerHeight * 1.1};
            const topPoint = {x: centerX, y: currentY - currentLayerHeight};
            const rightCP1 = {x: centerX + layerW/6, y: currentY - currentLayerHeight * 1.1};
            const rightCP2 = {x: centerX + layerW/3, y: currentY};
            const rightEnd = {x: centerX + layerW/2, y: currentY};

            const layerPoints: {x: number, y: number}[] = [];
            layerPoints.push(leftStart);

            // Tạo điểm đường cong bên trái
            for (let t = 0; t <= 1; t += 0.1) {
                const x = Math.pow(1-t, 3)*leftStart.x + 3*Math.pow(1-t, 2)*t*leftCP1.x + 3*(1-t)*Math.pow(t, 2)*leftCP2.x + Math.pow(t,3)*topPoint.x;
                const y = Math.pow(1-t, 3)*leftStart.y + 3*Math.pow(1-t, 2)*t*leftCP1.y + 3*(1-t)*Math.pow(t, 2)*leftCP2.y + Math.pow(t,3)*topPoint.y;
                layerPoints.push({x,y});
            }

            // Tạo điểm đường cong bên phải
            for (let t = 0; t <= 1; t += 0.1) {
                const x = Math.pow(1-t, 3)*topPoint.x + 3*Math.pow(1-t, 2)*t*rightCP1.x + 3*(1-t)*Math.pow(t, 2)*rightCP2.x + Math.pow(t,3)*rightEnd.x;
                const y = Math.pow(1-t, 3)*topPoint.y + 3*Math.pow(1-t, 2)*t*rightCP1.y + 3*(1-t)*Math.pow(t, 2)*rightCP2.y + Math.pow(t,3)*rightEnd.y;
                layerPoints.push({x,y});
            }

            layerPoints.push(leftStart);

            await this.drawLayerWithAnimation(leavesGraphics, layerPoints, 0x2ecc71);

            wavyLinesGraphics.setStrokeStyle({ width: 1, color: 0x0b5345 });
            wavyLinesGraphics.setFillStyle({ color: 0x0b5345 });
            
            const numSegments = 5 + (layers - i - 1) * 2;
            const segmentWidth = layerW / numSegments;
            
            for (let j = 0; j < numSegments; j++) {
                const startX = centerX - layerW/2 + j * segmentWidth;
                const controlX = startX + segmentWidth/2;
                const endX = startX + segmentWidth;

                wavyLinesGraphics.beginPath();
                await new Promise(resolve => setTimeout(resolve, 30));
                wavyLinesGraphics.moveTo(startX, currentY);
                wavyLinesGraphics.quadraticCurveTo(
                    controlX,
                    currentY + layerHeight * 0.2,
                    endX,
                    currentY
                );
                wavyLinesGraphics.fill();
                wavyLinesGraphics.stroke();
            }
        }

        // Vẽ ngôi sao trên cùng
        const starSize = baseWidth * 0.12;
        const starY = startY - treeHeight - starSize/4;
        starGraphics.setStrokeStyle({ width: 2, color: 0xffd700 });
        starGraphics.setFillStyle({ color: 0xffd700 });

        // Vẽ ngôi sao
        const starPoints: {x: number, y: number}[] = [];
        for (let i = 0; i <= 10; i++) {
            const radius = i % 2 === 0 ? starSize : starSize * 0.4;
            const angle = (i * Math.PI) / 5;
            const x = centerX + Math.cos(angle - Math.PI/2) * radius;
            const y = starY + Math.sin(angle - Math.PI/2) * radius;
            starPoints.push({x, y});
        }
        starPoints.push(starPoints[0]); // Thêm điểm đầu tiên vào cuối để khép kín

        // Vẽ đường viền và tô màu
        await this.drawLine(starGraphics, starPoints, 0xffd700);

        // Thêm trang trí trên cây
        await this.addTreeDecorations(decorationsGraphics, centerX, startY, baseWidth, treeHeight);
    }

    private drawStar(graphics: Graphics, x: number, y: number, size: number): void {
        graphics.setStrokeStyle({ width: 2, color: 0xffd700 });
        graphics.setFillStyle({ color: 0xffd700 });
        const points = 5;
        const outerRadius = size;
        const innerRadius = size * 0.4;

        graphics.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / points;
            const pointX = x + Math.cos(angle - Math.PI/2) * radius;
            const pointY = y + Math.sin(angle - Math.PI/2) * radius;
            
            if (i === 0) graphics.moveTo(pointX, pointY);
            else graphics.lineTo(pointX, pointY);
        }
        graphics.fill();
        graphics.stroke();
    }

    private async addTreeDecorations(graphics: Graphics, centerX: number, startY: number, width: number, height: number): Promise<void> {
        const colors = [0xff0000, 0xffd700, 0x4169e1, 0xff69b4];
        const layerHeight = height / 4;
        
        for (let layer = 4; layer >= 0; layer--) {
            const currentY = startY - layer * layerHeight * 1.1;
            const layerWidth = width * (1 - layer * 0.15);
            const currentLayerHeight = layerHeight * (1 + (5 - layer - 1) * 0.2);

            if (layer < 4) {
                const numDecorations = 6;
                for (let i = 0; i < numDecorations; i++) {
                    const randomX = centerX + (Math.random() - 0.5) * layerWidth * 0.8;
                    const randomY = currentY - Math.random() * currentLayerHeight * 0.7;
                    if (randomY < currentY && randomY > currentY - currentLayerHeight) {
                        this.addDecoration(graphics, randomX, randomY, colors);
                    }
                }

                const edgeDecorations = 4;
                for (let i = 0; i <= edgeDecorations; i++) {
                    const t = i / edgeDecorations;
                    const x = centerX - layerWidth/2 + layerWidth * t;
                    const y = currentY - currentLayerHeight * 0.1;
                    this.addDecoration(graphics, x, y, colors);
                }
            }
        }
    }

    private addDecoration(graphics: Graphics, x: number, y: number, colors: number[]): void {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const offsetX = (Math.random() - 0.5) * 2;
        const offsetY = (Math.random() - 0.5) * 2;

        graphics.setStrokeStyle({ width: 1, color: 0x000000 });
        graphics.setFillStyle({ color });
        graphics.beginPath();
        graphics.circle(x + offsetX, y + offsetY, 3);
        graphics.fill();
    }

    private async drawLayerWithAnimation(parentGraphics: Graphics, points: {x: number, y: number}[], fillColor: number): Promise<void> {
        const layerGraphics = new Graphics();
        parentGraphics.addChild(layerGraphics);

        for (let i = 1; i <= points.length; i++) {
            layerGraphics.clear();
            layerGraphics.setStrokeStyle({width: 2, color: 0x0b5345});
            layerGraphics.setFillStyle({color: fillColor});
            layerGraphics.beginPath();
            layerGraphics.moveTo(points[0].x, points[0].y);

            for (let j = 1; j < i; j++) {
                layerGraphics.lineTo(points[j].x, points[j].y);
            }

            if (i === points.length) {
                layerGraphics.fill();
                layerGraphics.stroke();
            } else {
                layerGraphics.stroke();
            }

            await new Promise(resolve => setTimeout(resolve, 30));
        }
    }
}
