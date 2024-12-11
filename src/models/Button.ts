import { Container, Text, Graphics, TextStyle } from 'pixi.js';
import { ButtonShape } from './ButtonShape';
import { Tooltip } from './Tooltip';

interface ButtonOptions {
    shape?: ButtonShape;
    width?: number;
    height?: number;
    borderColor?: number;
    backgroundColor?: number;
    padding?: number;
    tooltipText?: string;
    textStyle?: Partial<TextStyle>;
    onClick?: () => void;
    onHover?: () => void;
    onOut?: () => void;
    onDown?: () => void;
    onUp?: () => void;
    borderWidth?: number;
}

export class Button extends Container {
    private background: Graphics;
    private labelText: Text;
    private isPressed: boolean = false;
    private shape: ButtonShape;
    private tooltip?: Tooltip;
    
    // Callbacks
    private onClick?: () => void;
    private onHover?: () => void;
    private onOut?: () => void;
    private onDown?: () => void;
    private onUp?: () => void;

    private colors = {
        default: 0x4CAF50,
        hover: 0x66BB6A,
        pressed: 0x388E3C,
        border: 0xFFFFFF
    };
    private borderWidth: number = 2;
    private originalWidth: number;
    private originalHeight: number;
    private padding = 20;
    private tooltipOffset = -10;

    private calculateDimensions(width: number, height: number): void {
        // Get text bounds to calculate minimum size needed
        const textBounds = this.labelText.getBounds();
        const padding = this.padding * 2; // Extra padding for larger text
        
        const minWidth = textBounds.width + padding;
        const minHeight = textBounds.height + padding;

        if (this.shape === ButtonShape.Circle) {
            // For circle, use the larger of text dimensions
            const diameter = Math.max(minWidth, minHeight);
            this.originalWidth = diameter;
            this.originalHeight = diameter;
        } else if (this.shape === ButtonShape.Square) {
            // For square, use the larger dimension
            const size = Math.max(minWidth, minHeight);
            this.originalWidth = size;
            this.originalHeight = size;
        } else {
            // For rectangles, use at least the minimum size needed for text
            this.originalWidth = Math.max(width, minWidth);
            this.originalHeight = Math.max(height, minHeight);
        }
    }

    constructor(text: string, options: ButtonOptions = {}) {
        super();

        const {
            shape = ButtonShape.Rectangle,
            width = 120,
            height = 40,
            borderColor,
            backgroundColor,
            padding = 20,
            textStyle = {},
            tooltipText,
            onClick,
            onHover,
            onOut,
            onDown,
            onUp,
            borderWidth = 2,
        } = options;

        this.padding = padding;
        this.shape = shape;
        
        // Store callbacks
        this.onClick = onClick;
        this.onHover = onHover;
        this.onOut = onOut;
        this.onDown = onDown;
        this.onUp = onUp;

        if (borderColor) {
            this.colors.border = borderColor;
        }

        if (backgroundColor) {
            this.colors.default = backgroundColor;
            this.colors.hover = this.adjustColor(backgroundColor, 20);
            this.colors.pressed = this.adjustColor(backgroundColor, -20);
        }

        // Create text with custom style
        this.labelText = new Text({
            text,
            style: {
                fontFamily: 'Roboto',
                fontSize: 16,
                fill: 0xFFFFFF,
                align: 'center',
                ...textStyle,
            }
        });
        this.labelText.anchor.set(0.5);

        // Calculate initial dimensions
        if (this.shape === ButtonShape.Circle) {
            const textBounds = this.labelText.getBounds();
            const diameter = Math.max(
                textBounds.width + this.padding,
                textBounds.height + this.padding
            );
            this.calculateDimensions(diameter, diameter);
        } else {
            this.calculateDimensions(width, height);
        }

        // Create and setup background
        this.background = new Graphics();
        this.drawBackground(this.colors.default);
        this.centerText();

        this.addChild(this.background);
        this.addChild(this.labelText);

        // Set pivot point to center for scaling
        this.pivot.set(this.originalWidth / 2, this.originalHeight / 2);
        // Adjust position to compensate for pivot
        this.position.set(this.originalWidth / 2, this.originalHeight / 2);

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerdown', this.onButtonDown.bind(this))
            .on('pointerup', this.onButtonUp.bind(this))
            .on('pointerupoutside', this.onButtonUp.bind(this))
            .on('pointerover', this.onButtonOver.bind(this))
            .on('pointerout', this.onButtonOut.bind(this));

        if (tooltipText) {
            this.tooltip = new Tooltip(tooltipText);
            this.tooltip.position.set(
                this.originalWidth / 2,
                this.tooltipOffset
            );
            this.addChild(this.tooltip);
        }

        // Update event handlers
        this.on('pointerover', () => {
            this.onButtonOver();
            this.tooltip?.show();
        });
        
        this.on('pointerout', () => {
            this.onButtonOut();
            this.tooltip?.hide();
        });

        this.borderWidth = borderWidth;
    }

    private centerText(): void {
        this.labelText.position.set(
            this.originalWidth / 2,
            this.originalHeight / 2
        );
    }

    private drawBackground(color: number): void {
        this.background.clear();
        
        // Set stroke style for border
        this.background.setStrokeStyle({
            width: this.borderWidth,
            color: this.colors.border,
        });

        // Set fill style
        this.background.setFillStyle({
            color: color,
        });

        switch (this.shape) {
            case ButtonShape.Rectangle:
                this.background.rect(0, 0, this.originalWidth, this.originalHeight);
                break;

            case ButtonShape.RoundedRectangle:
                this.background.roundRect(0, 0, this.originalWidth, this.originalHeight, 10);
                break;

            case ButtonShape.Circle:
                const radius = Math.min(this.originalWidth, this.originalHeight) / 2;
                this.background.circle(
                    this.originalWidth / 2,
                    this.originalHeight / 2,
                    radius
                );
                break;

            case ButtonShape.Square:
                const size = Math.min(this.originalWidth, this.originalHeight);
                this.background.rect(0, 0, size, size);
                break;
        }

        // Apply fill and stroke
        this.background.fill();
        this.background.stroke();
    }

    private onButtonDown(): void {
        this.isPressed = true;
        this.drawBackground(this.colors.pressed);
        this.scale.set(0.95);
        this.onDown?.();
    }

    private onButtonUp(): void {
        if (this.isPressed) {
            this.isPressed = false;
            this.drawBackground(this.colors.default);
            this.scale.set(1);
            this.onUp?.();
            this.onClick?.();
        }
    }

    private onButtonOver(): void {
        if (!this.isPressed) {
            this.drawBackground(this.colors.hover);
            this.onHover?.();
        }
    }

    private onButtonOut(): void {
        if (!this.isPressed) {
            this.drawBackground(this.colors.default);
            this.onOut?.();
        }
    }

    public getWidth(): number {
        return this.originalWidth;
    }

    public getHeight(): number {
        return this.originalHeight;
    }

    public setBorder(color: number, width: number = 2): void {
        this.colors.border = color;
        this.borderWidth = width;
        this.drawBackground(this.isPressed ? this.colors.pressed : this.colors.default);
    }

    public setCallbacks(callbacks: {
        onClick?: () => void,
        onHover?: () => void,
        onOut?: () => void,
        onDown?: () => void,
        onUp?: () => void,
    }): void {
        Object.assign(this, callbacks);
    }

    /**
     * Set button width and update visuals
     */
    public setWidth(width: number): void {
        this.originalWidth = width;
        this.drawBackground(this.isPressed ? this.colors.pressed : this.colors.default);
        this.centerText();
        this.pivot.set(this.originalWidth / 2, this.originalHeight / 2);
        this.position.set(this.position.x, this.position.y);
    }

    /**
     * Set button height and update visuals
     */
    public setHeight(height: number): void {
        this.originalHeight = height;
        this.drawBackground(this.isPressed ? this.colors.pressed : this.colors.default);
        this.centerText();
        this.pivot.set(this.originalWidth / 2, this.originalHeight / 2);
        this.position.set(this.position.x, this.position.y);
    }

    /**
     * Set button size and update visuals
     */
    public setSize(width: number, height: number): void {
        this.calculateDimensions(width, height);
        this.drawBackground(this.isPressed ? this.colors.pressed : this.colors.default);
        this.centerText();
        this.pivot.set(this.originalWidth / 2, this.originalHeight / 2);
        this.position.set(this.position.x, this.position.y);
    }

    /**
     * Set button position relative to its parent
     */
    public setPosition(x: number, y: number): void {
        // Since pivot is at center, adjust position
        this.position.set(
            x + this.originalWidth / 2,
            y + this.originalHeight / 2
        );
    }

    /**
     * Set button position from center
     */
    public setPositionFromCenter(x: number, y: number): void {
        this.position.set(x, y);
    }

    /**
     * Get current position relative to parent (top-left corner)
     */
    public getPosition(): { x: number; y: number } {
        return {
            x: this.position.x - this.originalWidth / 2,
            y: this.position.y - this.originalHeight / 2
        };
    }

    /**
     * Get center position
     */
    public getCenterPosition(): { x: number; y: number } {
        return {
            x: this.position.x,
            y: this.position.y
        };
    }

    public setTooltip(text: string): void {
        if (!this.tooltip) {
            this.tooltip = new Tooltip(text);
            this.tooltip.position.set(
                this.originalWidth / 2,
                this.tooltipOffset
            );
            this.addChild(this.tooltip);
        } else {
            this.tooltip.updateText(text);
        }
    }

    public hideTooltip(): void {
        this.tooltip?.hide();
    }

    public showTooltip(): void {
        this.tooltip?.show();
    }

    public setTextStyle(style: Partial<TextStyle>): void {
        Object.assign(this.labelText.style, style);
        // Recalculate dimensions based on new text size
        this.calculateDimensions(this.originalWidth, this.originalHeight);
        this.drawBackground(this.isPressed ? this.colors.pressed : this.colors.default);
        this.centerText();
    }

    private adjustColor(color: number, percent: number): number {
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;

        const amount = Math.floor(255 * (percent / 100));

        const nr = Math.min(255, Math.max(0, r + amount));
        const ng = Math.min(255, Math.max(0, g + amount));
        const nb = Math.min(255, Math.max(0, b + amount));

        return (nr << 16) | (ng << 8) | nb;
    }
} 