import { Container, Sprite, Assets } from 'pixi.js';
import okImage from '../assets/images/ok.png';

export class SantaSleigh extends Container {
    private sprite: Sprite;
    private speed: number = 3;
    private screenWidth: number;
    private isMoving: boolean = true;
    private time: number = 0;
    private swayAmount: number = 15;
    private originalY: number;

    constructor(screenWidth: number, y: number) {
        super();
        this.screenWidth = screenWidth;
        this.originalY = y;

        // Create sprite
        this.sprite = Sprite.from(okImage);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.2);
        this.sprite.zIndex = -0.8;

        // Start position from right
        this.sprite.x = screenWidth + this.sprite.width;
        this.sprite.y = y;

        this.addChild(this.sprite);
        this.sortableChildren = true;
    }

    public update(): void {
        if (this.isMoving) {
            this.sprite.x -= this.speed;

            this.time += 0.02;
            this.sprite.y = this.originalY + Math.sin(this.time) * this.swayAmount;

            // Reset position when reaching left side
            if (this.sprite.x < -this.sprite.width) {
                this.sprite.x = this.screenWidth + this.sprite.width;
            }
        }
    }

    public setScreenWidth(width: number): void {
        this.screenWidth = width;
    }

    public setY(y: number): void {
        this.originalY = y;
    }
} 