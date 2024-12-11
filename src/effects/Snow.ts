import { Graphics } from 'pixi.js';

export class Snow extends Graphics {
    private speedX: number;
    private speedY: number;
    private screenWidth: number;
    private screenHeight: number;

    constructor(screenWidth: number, screenHeight: number) {
        super();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        // Random properties for each snowflake
        this.speedX = Math.random() * 2 - 1; // Random horizontal speed
        this.speedY = 2 + Math.random() * 3; // Random falling speed
        
        // Draw snowflake
        this.beginFill(0xFFFFFF);
        this.drawCircle(0, 0, 2 + Math.random() * 2);
        this.endFill();
        this.alpha = 0.6 + Math.random() * 0.4;

        // Random starting position
        this.position.set(
            Math.random() * screenWidth,
            Math.random() * screenHeight
        );
    }

    public update(): void {
        // Update position
        this.x += this.speedX;
        this.y += this.speedY;

        // Reset if out of bounds
        if (this.y > this.screenHeight) {
            this.y = -10;
            this.x = Math.random() * this.screenWidth;
        }
        if (this.x > this.screenWidth) {
            this.x = 0;
        }
        if (this.x < 0) {
            this.x = this.screenWidth;
        }
    }

    public updateScreenSize(width: number, height: number): void {
        this.screenWidth = width;
        this.screenHeight = height;
    }
} 