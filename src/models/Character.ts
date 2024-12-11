import { Container, Sprite, Text, TextStyle, Assets, Texture, Graphics } from 'pixi.js';

interface CharacterOptions {
    image: string;
    bubbleBackground?: string;
    scale?: number;
    onDialogComplete?: () => void;
    targetHeight?: number;
}

interface DialogBubble {
    text: Text;
    background: Sprite;
}

export class Character extends Container {
    private sprite: Sprite;
    private dialogBubble?: DialogBubble;
    private currentDialog: string = '';
    private isDialogVisible: boolean = false;
    private options: CharacterOptions;
    private onDialogComplete?: () => void;

    constructor(x: number, y: number, options: CharacterOptions) {
        super();
        this.options = options;
        this.onDialogComplete = options.onDialogComplete;

        // Create character sprite
        this.sprite = new Sprite();
        this.loadCharacterTexture();
        
        // Position character
        this.sprite.anchor.set(0.5);
        this.position.set(x, y);
        
        this.addChild(this.sprite);
    }

    private calculateOptimalScale(): number {
        const targetHeight = this.options.targetHeight || window.innerHeight * 0.3; // 30% chiều cao màn hình
        const currentHeight = this.sprite.height;
        return targetHeight / currentHeight;
    }

    private async loadCharacterTexture(): Promise<void> {
        try {
            const texture = await Assets.load(this.options.image);
            this.sprite.texture = texture;
            
            // Tính toán scale tự động dựa trên kích thước màn hình
            const optimalScale = this.calculateOptimalScale();
            this.sprite.scale.set(this.options.scale || optimalScale);
        } catch (error) {
            console.error('Failed to load character texture:', error);
        }
    }

    private createDialogBubble(): void {
        if (!this.dialogBubble) {
            const text = new Text({
                text: '',
                style: {
                    fontFamily: 'Roboto',
                    fontSize: 24,
                    fill: 0x000000,
                    align: 'left',
                    wordWrap: true,
                    wordWrapWidth: 300,
                }
            });

            // Create bubble background
            let background: Sprite;
            if (this.options.bubbleBackground) {
                background = Sprite.from(this.options.bubbleBackground);
            } else {
                const graphics = new Graphics();
                graphics.setFillStyle({ color: 0xFFFFFF, alpha: 0.9 });
                graphics.beginPath();
                graphics.roundRect(0, 0, 320, 80, 20);
                graphics.fill();
                
                background = new Sprite();
                background.addChild(graphics);
            }

            const bubbleContainer = new Container();
            bubbleContainer.addChild(background);
            bubbleContainer.addChild(text);

            // Đặt text trong bubble
            text.position.set(15, 10);

            // Điều chỉnh vị trí của bubble container
            bubbleContainer.position.set(
                this.sprite.width * 0.3,
                -this.sprite.height * 0.7
            );

            this.dialogBubble = { text, background };
            this.addChild(bubbleContainer);
        }
    }

    public showDialog(text: string, onComplete?: () => void): void {
        if (!this.dialogBubble) {
            this.createDialogBubble();
        }

        if (this.dialogBubble) {
            this.dialogBubble.text.text = text;
            this.currentDialog = text;
            this.isDialogVisible = true;

            // Call onComplete callback if provided
            if (onComplete) {
                onComplete();
            } else if (this.onDialogComplete) {
                this.onDialogComplete();
            }
        }
    }

    public hideDialog(): void {
        if (this.dialogBubble) {
            this.isDialogVisible = false;
            this.currentDialog = '';
            this.dialogBubble.text.text = '';
        }
    }

    public getCurrentDialog(): string {
        return this.currentDialog;
    }

    public isShowingDialog(): boolean {
        return this.isDialogVisible;
    }

    // Optional: Add animations
    public playTalkingAnimation(): void {
        // Add animation logic here
    }

    public stopTalkingAnimation(): void {
        // Stop animation logic here
    }

    // Optional: Add expressions
    public setExpression(expression: 'happy' | 'sad' | 'neutral'): void {
        // Change sprite texture based on expression
    }

    // Optional: Add scaling/positioning methods
    public setScale(scale: number): void {
        this.sprite.scale.set(scale);
    }

    public setPosition(x: number, y: number): void {
        this.position.set(x, y);
    }
} 