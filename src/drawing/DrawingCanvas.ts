import { Container, Graphics } from 'pixi.js';

export class DrawingCanvas extends Container {
    private currentLine: Graphics | null = null;
    private isDrawing: boolean = false;
    private lineColor: number = 0x000000;
    private lineWidth: number = 3;
    private lines: Graphics[] = [];

    constructor(width: number, height: number) {
        super();

        // Tạo vùng vẽ
        const drawArea = new Graphics();
        drawArea.setStrokeStyle({
            width: 2,
            color: 0x999999
        });
        drawArea.beginFill(0xFFFFFF);
        drawArea.rect(0, 0, width, height);
        drawArea.endFill();
        this.addChild(drawArea);

        // Cấu hình events cho drawArea
        drawArea.eventMode = 'static';
        drawArea.cursor = 'crosshair';
        
        // Bind events
        drawArea.on('pointerdown', this.onPointerDown.bind(this));
        drawArea.on('pointermove', this.onPointerMove.bind(this));
        drawArea.on('pointerup', this.onPointerUp.bind(this));
        drawArea.on('pointerupoutside', this.onPointerUp.bind(this));
    }

    private onPointerDown(event: any): void {
        this.isDrawing = true;
        const pos = event.getLocalPosition(this);

        this.currentLine = new Graphics();
        this.currentLine.setStrokeStyle({
            width: this.lineWidth,
            color: this.lineColor,
            alignment: 0.5,  // Căn giữa stroke
        });

        this.currentLine.beginPath();  // Bắt đầu path mới
        this.currentLine.moveTo(pos.x, pos.y);
        this.currentLine.stroke();     // Vẽ stroke
        
        this.addChild(this.currentLine);
        this.lines.push(this.currentLine);
    }

    private onPointerMove(event: any): void {
        if (!this.isDrawing || !this.currentLine) return;

        const pos = event.getLocalPosition(this);
        this.currentLine.lineTo(pos.x, pos.y);
        this.currentLine.stroke();  // Vẽ stroke sau mỗi lần di chuyển
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

    public clear(): void {
        this.lines.forEach(line => {
            this.removeChild(line);
            line.destroy();
        });
        this.lines = [];
    }

    private animateDrawing(graphics: Graphics, commands: Array<() => void>, delay: number = 50): Promise<void> {
        return new Promise<void>((resolve) => {
            let index = 0;
            const animate = () => {
                if (index < commands.length) {
                    commands[index]();
                    index++;
                    setTimeout(animate, delay);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    public async drawChristmasTree(): Promise<void> {
        const centerX = this.width / 2;
        const startY = this.height * 0.85;
        const baseWidth = this.width * 0.4;
        const treeHeight = this.height * 0.65;
        const layerHeight = treeHeight / 6;
        const layers = 5;

        const treeGraphics = new Graphics();
        this.addChild(treeGraphics);
        this.lines.push(treeGraphics);

        const drawCommands: Array<() => void> = [];

        // Add pot drawing commands first
        const trunkWidth = baseWidth * 0.08;
        const trunkHeight = treeHeight * 0.08;
        const potWidth = trunkWidth * 2.5;
        const potHeight = trunkHeight * 1.2;
        const potTopWidth = potWidth * 1.2;

        drawCommands.push(() => {
            treeGraphics.setStrokeStyle({
                width: 2,
                color: 0x654321,
                alignment: 0.5
            });
            treeGraphics.beginFill(0x8b4513);
            treeGraphics.beginPath();
            treeGraphics.moveTo(centerX - potTopWidth/2, startY + trunkHeight);
            treeGraphics.lineTo(centerX - potWidth/2, startY + trunkHeight + potHeight);
            treeGraphics.lineTo(centerX + potWidth/2, startY + trunkHeight + potHeight);
            treeGraphics.lineTo(centerX + potTopWidth/2, startY + trunkHeight);
            treeGraphics.closePath();
            treeGraphics.fill();
            treeGraphics.stroke();
        });

        // Add trunk drawing commands
        drawCommands.push(() => {
            treeGraphics.setStrokeStyle({
                width: 2,
                color: 0x0b5345,
                alignment: 0.5
            });
            treeGraphics.beginFill(0x8b4513);
            treeGraphics.beginPath();
            treeGraphics.moveTo(centerX - trunkWidth/2, startY);
            treeGraphics.lineTo(centerX - trunkWidth/2, startY + trunkHeight);
            treeGraphics.lineTo(centerX + trunkWidth/2, startY + trunkHeight);
            treeGraphics.lineTo(centerX + trunkWidth/2, startY);
            treeGraphics.closePath();
            treeGraphics.fill();
            treeGraphics.stroke();
        });

        // Prepare drawing commands for tree layers from bottom to top
        for (let i = 0; i < layers; i++) {
            const layerScale = 1 + (layers - i - 1) * 0.2;
            const currentLayerHeight = layerHeight * layerScale;
            const currentY = startY - i * layerHeight * 1.1;
            const layerWidth = baseWidth * (1 - i * 0.15);

            // Draw left half of the layer
            drawCommands.push(() => {
                treeGraphics.setStrokeStyle({
                    width: 2,
                    color: 0x0b5345,
                    alignment: 0.5
                });
                treeGraphics.beginFill(0x2ecc71);
                treeGraphics.beginPath();
                treeGraphics.moveTo(centerX - layerWidth/2, currentY);
                treeGraphics.bezierCurveTo(
                    centerX - layerWidth/3,
                    currentY,
                    centerX - layerWidth/6,
                    currentY - currentLayerHeight * 1.1,
                    centerX,
                    currentY - currentLayerHeight * 1.0
                );
            });

            // Draw right half of the layer
            drawCommands.push(() => {
                treeGraphics.bezierCurveTo(
                    centerX + layerWidth/6,
                    currentY - currentLayerHeight * 1.1,
                    centerX + layerWidth/3,
                    currentY,
                    centerX + layerWidth/2,
                    currentY
                );
                treeGraphics.closePath();
                treeGraphics.fill();
                treeGraphics.stroke();
            });

            // Add decorative curves for this layer
            const numSegments = 5 + (layers - i - 1) * 2;
            const segmentWidth = layerWidth / numSegments;

            for (let j = 0; j < numSegments; j++) {
                const startX = centerX - layerWidth/2 + j * segmentWidth;
                const controlX = startX + segmentWidth/2;
                const endX = startX + segmentWidth;

                drawCommands.push(() => {
                    treeGraphics.beginFill(0x0b5345);
                    treeGraphics.moveTo(startX, currentY);
                    treeGraphics.quadraticCurveTo(
                        controlX,
                        currentY + layerHeight * 0.2,
                        endX,
                        currentY
                    );
                    treeGraphics.lineTo(endX, currentY);
                    treeGraphics.endFill();
                });
            }
        }

        // Add star drawing commands last
        const starSize = baseWidth * 0.12;
        drawCommands.push(() => {
            this.drawStar(treeGraphics, centerX, startY - treeHeight - starSize/4, starSize);
        });

        // Add decoration drawing commands
        drawCommands.push(() => {
            this.addTreeDecorations(treeGraphics, centerX, startY, baseWidth, treeHeight);
        });

        // Execute all drawing commands with animation
        await this.animateDrawing(treeGraphics, drawCommands, 50);
    }

    private drawStar(graphics: Graphics, x: number, y: number, size: number): void {
        // Đặt style cho viền
        graphics.setStrokeStyle({
            width: 2,
            color: 0xffd700,  // Màu vàng cho viền
            alignment: 0.5
        });

        const points = 5;
        const outerRadius = size;
        const innerRadius = size * 0.4;

        // Bắt đầu tô màu vàng cho ngôi sao
        graphics.beginFill(0xffd700);  // Màu vàng cho phần tô

        graphics.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / points;
            const pointX = x + Math.cos(angle - Math.PI/2) * radius;
            const pointY = y + Math.sin(angle - Math.PI/2) * radius;
            
            if (i === 0) graphics.moveTo(pointX, pointY);
            else graphics.lineTo(pointX, pointY);
        }
        graphics.closePath();
        graphics.fill();    // Tô màu
        graphics.stroke();  // Vẽ viền
    }

    private addTreeDecorations(graphics: Graphics, centerX: number, startY: number, width: number, height: number): void {
        const colors = [0xff0000, 0xffd700, 0x4169e1, 0xff69b4];
        const layerHeight = height / 4;
        
        // Thêm trang trí cho từng tầng
        for (let layer = 0; layer < 5; layer++) {
            const currentY = startY - layer * layerHeight * 1.1;
            const layerWidth = width * (1 - layer * 0.15);
            const currentLayerHeight = layerHeight * (1 + (5 - layer - 1) * 0.2);

            // Chỉ vẽ trang trí trong phần thân cây (không vẽ quanh ngôi sao)
            if (layer < 4) {  // Bỏ qua tầng trên cùng gần ngôi sao
                // Trang trí bên trong tán lá
                const numDecorations = 6;
                for (let i = 0; i < numDecorations; i++) {
                    const randomX = centerX + (Math.random() - 0.5) * layerWidth * 0.8;
                    const randomY = currentY - Math.random() * currentLayerHeight * 0.7;

                    if (randomY < currentY && randomY > currentY - currentLayerHeight) {
                        this.addDecoration(graphics, randomX, randomY, colors);
                    }
                }

                // Thêm trang trí dọc theo đường viền dưới
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

    // Thêm hàm helper để vẽ từng quả trang trí
    private addDecoration(graphics: Graphics, x: number, y: number, colors: number[]): void {
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Giảm độ ngẫu nhiên của vị trí
        const offsetX = (Math.random() - 0.5) * 2;
        const offsetY = (Math.random() - 0.5) * 2;

        // Vẽ và tô màu quả châu
        graphics.beginFill(color);
        graphics.setStrokeStyle({
            width: 1,
            color: 0x000000,
            alignment: 0.5
        });

        graphics.beginPath();
        graphics.arc(x + offsetX, y + offsetY, 3, 0, Math.PI * 2);
        graphics.closePath();
        graphics.fill();
    }
} 