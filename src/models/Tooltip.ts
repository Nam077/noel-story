import { Container, Text, Graphics } from 'pixi.js';

export class Tooltip extends Container {
    private background: Graphics;
    private text: Text;
    private padding: number = 8;
    private arrowHeight: number = 6;
    private colors = {
        background: 0x333333,
        text: 0xFFFFFF,
    };

    constructor(text: string) {
        super();

        // Create text
        this.text = new Text({
            text,
            style: {
                fontFamily: 'Roboto',
                fontSize: 12,
                fill: this.colors.text,
                align: 'center',
            }
        });

        // Create background
        this.background = new Graphics();
        
        // Add to container
        this.addChild(this.background);
        this.addChild(this.text);

        // Initially hidden
        this.visible = false;

        this.draw();
    }

    private draw(): void {
        const textBounds = this.text.getBounds();
        const width = textBounds.width + this.padding * 2;
        const height = textBounds.height + this.padding * 2;

        // Position text
        this.text.position.set(this.padding, this.padding);

        // Draw background with arrow
        this.background.clear();
        
        // Set fill style for background
        this.background.setFillStyle({
            color: this.colors.background
        });

        // Begin path for complex shape
        this.background.beginPath();
        
        // Main rectangle
        this.background.roundRect(0, 0, width, height, 4);
        
        // Arrow path
        this.background.moveTo(width / 2 - 5, height);
        this.background.lineTo(width / 2, height + this.arrowHeight);
        this.background.lineTo(width / 2 + 5, height);
        
        // Fill the entire path
        this.background.fill();

        // Center the tooltip horizontally relative to parent
        this.pivot.set(width / 2, height + this.arrowHeight);
    }

    public show(): void {
        this.visible = true;
    }

    public hide(): void {
        this.visible = false;
    }

    public updateText(text: string): void {
        this.text.text = text;
        this.draw();
    }

    public setColors(background: number, text: number): void {
        this.colors.background = background;
        this.colors.text = text;
        this.text.style.fill = text;
        this.draw();
    }
} 