import { Container, Text, TextStyle, Sprite, Graphics } from 'pixi.js';
import { Snow } from '../effects/Snow';
import { SantaSleigh } from '../effects/SantaSleigh';
import bg2 from '../assets/images/bg2.jpg';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { ButtonShape } from '@/models/ButtonShape';
import { Button } from '@/models/Button';

interface DrawScreenOptions {
    onComplete?: () => void;
}

export class DrawScreen extends Container {
    private background: Sprite;
    private snowflakes: Snow[] = [];
    private readonly SNOW_COUNT = 100;
    private santaSleigh: SantaSleigh;
    private drawingCanvas: DrawingCanvas;

    constructor(width: number, height: number, options: DrawScreenOptions) {
        super();

        // Create and setup background
        this.background = Sprite.from(bg2);
        this.background.width = width;
        this.background.height = height;
        this.background.anchor.set(0);
        this.addChild(this.background);

        // Set background to be behind everything
        this.background.zIndex = -1;
        this.sortableChildren = true;

        // Create snow effect
        this.createSnowEffect(width, height);

        // Add santa sleigh animation
        this.santaSleigh = new SantaSleigh(width, height * 0.2);
        this.addChild(this.santaSleigh);

        // Add drawing canvas
        this.drawingCanvas = new DrawingCanvas(
            width * 0.7,     // Chiều rộng 70% màn hình
            height * 0.8     // Chiều cao 80% màn hình
        );

        // Căn giữa canvas
        this.drawingCanvas.position.set(
            width * 0.15,    // (100% - 70%) / 2 = 15% từ mép trái
            height * 0.1     // 10% từ mép trên
        );
        this.addChild(this.drawingCanvas);

        // Add color picker and brush size controls
        this.setupControls();
    }

    private createSnowEffect(width: number, height: number): void {
        const snowContainer = new Container();
        this.addChild(snowContainer);

        for (let i = 0; i < this.SNOW_COUNT; i++) {
            const snowflake = new Snow(width, height);
            this.snowflakes.push(snowflake);
            snowContainer.addChild(snowflake);
        }

        snowContainer.zIndex = -0.5;
    }

    public update(): void {
        // Update snow
        for (const snowflake of this.snowflakes) {
            snowflake.update();
        }

        // Update santa sleigh
        this.santaSleigh.update();
    }

    public resize(width: number, height: number): void {
        // Resize background
        this.background.width = width;
        this.background.height = height;

        // Update snowflakes
        this.snowflakes.forEach(snow => {
            snow.updateScreenSize(width, height);
        });

        // Update santa sleigh
        this.santaSleigh.setScreenWidth(width);
        this.santaSleigh.setY(height * 0.2);
    }

    private setupControls(): void {
        const controlPanelX = 20;  // Vị trí panel điều khiển từ mép trái
        const startY = 50;         // Vị trí bắt đầu từ trên xuống
        const spacing = 40;        // Khoảng cách giữa các nút
        const buttonSize = 35;     // Kích thước nút

        // Add color buttons
        const colors = [0x000000, 0xFF0000, 0x00FF00, 0x0000FF];
        colors.forEach((color, index) => {
            const button = new Button('', {
                shape: ButtonShape.Circle,
                width: buttonSize,
                height: buttonSize,
                backgroundColor: color,
                onClick: () => this.drawingCanvas.setColor(color)
            });
            button.setPosition(controlPanelX, startY + index * spacing);
            this.addChild(button);
        });

        // Add brush size buttons
        const sizes = [2, 5, 8];
        const brushStartY = startY + (colors.length + 1) * spacing;  // Thêm khoảng cách với color buttons
        sizes.forEach((size, index) => {
            const button = new Button(size.toString(), {
                shape: ButtonShape.Circle,
                width: buttonSize,
                height: buttonSize,
                backgroundColor: 0xCCCCCC,
                onClick: () => this.drawingCanvas.setLineWidth(size)
            });
            button.setPosition(controlPanelX, brushStartY + index * spacing);
            this.addChild(button);
        });

        // Add clear button
        const clearButton = new Button('Clear', {
            shape: ButtonShape.RoundedRectangle,
            width: buttonSize * 2,
            height: buttonSize,
            backgroundColor: 0xFF4444,
            onClick: () => this.drawingCanvas.clear()
        });
        clearButton.setPosition(controlPanelX, brushStartY + (sizes.length + 1) * spacing);
        this.addChild(clearButton);

        // Add draw tree button
        const drawTreeButton = new Button('Draw Tree', {
            shape: ButtonShape.RoundedRectangle,
            width: buttonSize * 2,
            height: buttonSize,
            backgroundColor: 0x4CAF50,
            onClick: async () => await this.drawingCanvas.drawChristmasTree()
        });
        drawTreeButton.setPosition(
            controlPanelX, 
            brushStartY + (sizes.length + 2) * spacing
        );
        this.addChild(drawTreeButton);
    }
} 