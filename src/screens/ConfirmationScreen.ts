import { Container, Text, TextStyle, Sprite } from 'pixi.js';
import { DialogButtons } from '../models/DialogButtons';
import { Character } from '../models/Character';
import santaImage from '../assets/images/santa.png';
import backgroundImage from '../assets/images/background.jpg';
import { Snow } from '../effects/Snow';
import { SantaSleigh } from '../effects/SantaSleigh';

interface ConfirmationOptions {
    title?: string;
    message: string;
    titleStyle?: Partial<TextStyle>;
    messageStyle?: Partial<TextStyle>;
}

export class ConfirmationScreen extends Container {
    private background: Sprite;
    private buttons: DialogButtons;
    private titleText?: Text;
    private messageText: Text;
    private character: Character;
    private onConfirm?: () => void;
    private onCancel?: () => void;
    private snowflakes: Snow[] = [];
    private readonly SNOW_COUNT = 100;
    private santaSleigh: SantaSleigh;

    constructor(width: number, height: number, options: ConfirmationOptions) {
        super();

        // Create and setup background
        this.background = Sprite.from(backgroundImage);
        this.background.width = width;
        this.background.height = height;
        this.background.anchor.set(0); // Ensure it starts from top-left
        this.addChild(this.background);

        // Set background to be behind everything
        this.background.zIndex = -1;
        this.sortableChildren = true;

        const defaultTitleStyle: Partial<TextStyle> = {
            fontSize: 48,
            fontWeight: 'bold',
            fill: 0xFFFFFF,
            fontFamily: 'Roboto',
            align: 'center',
        };

        const defaultMessageStyle: Partial<TextStyle> = {
            fontSize: 32,
            fill: 0xFFFFFF,
            fontFamily: 'Roboto',
            align: 'center',
            wordWrap: true,
            wordWrapWidth: width * 0.8,
        };

        // Create title if provided
        if (options.title) {
            this.titleText = new Text({
                text: options.title,
                style: { ...defaultTitleStyle, ...options.titleStyle }
            });
            this.titleText.anchor.set(0.5);
            this.addChild(this.titleText);
        }

        // Create message text
        this.messageText = new Text({
            text: options.message,
            style: { ...defaultMessageStyle, ...options.messageStyle }
        });
        this.messageText.anchor.set(0.5);
        this.addChild(this.messageText);

        // Create character
        this.character = new Character(
            width * 0.08,
            height * 0.75,
            {
                image: santaImage,
                scale: 0.12,
                onDialogComplete: () => {
                    console.log('Dialog completed');
                }
            }
        );
        this.addChild(this.character);

        // Create buttons
        this.buttons = new DialogButtons(10, {
            initialDialog: "Xin chào! Bạn có muốn nghe kể chuyện không?",
            teasingDialogs: [
                "Hehe, bắt được không nào?",
                "Ôi, suýt thì bắt được rồi!",
                "Nhanh lên nào!",
                "Gần lắm rồi!",
                "Cố gắng thêm chút nữa!",
                "Bạn giỏi thật đấy!",
                "Wow, nhanh quá!",
                "Chỉ còn một chút nữa thôi!",
                "Bạn rất kiên trì đấy!",
                "Đúng là một người không dễ bỏ cuộc!"
            ],
            finalDialog: "Tuyệt vời! Bạn thật kiên trì, hãy nhấn nút này!",
            onMaxTeases: () => {
                console.log('Đã đạt max teases!');
            }
        }, this.character);
        this.addChild(this.buttons);

        // Initial positioning
        this.updatePositions(width, height);

        // Set callbacks
        this.buttons.setCallbacks(
            () => {
                this.onConfirm?.();
                this.character.showDialog("Tuyệt vời! Hãy cùng bắt đầu nhé!");
            },
            () => {
                this.onCancel?.();
                this.character.showDialog("Có được gì đâu, chơi tiếp đi!")
            }
        );

        // Show initial dialog
        this.character.showDialog("Xin chào! Bạn có muốn nghe kể chuyện không?");

        // Create snow effect
        this.createSnowEffect(width, height);

        // Add santa sleigh animation
        this.santaSleigh = new SantaSleigh(width, height * 0.2); // Position at 20% from top
        this.addChild(this.santaSleigh);
    }

    private updatePositions(width: number, height: number): void {
        const padding = 40;
        let currentY = height * 0.3; // Start at 30% from top

        // Position title if exists
        if (this.titleText) {
            this.titleText.position.set(width / 2, currentY);
            currentY += this.titleText.height + padding;
        }

        // Position message
        this.messageText.position.set(width / 2, currentY);
        currentY += this.messageText.height + padding;

        // Position buttons
        this.buttons.position.set(width / 2, currentY);
    }

    private createSnowEffect(width: number, height: number): void {
        // Create container for snow
        const snowContainer = new Container();
        this.addChild(snowContainer);

        // Create snowflakes
        for (let i = 0; i < this.SNOW_COUNT; i++) {
            const snowflake = new Snow(width, height);
            this.snowflakes.push(snowflake);
            snowContainer.addChild(snowflake);
        }

        // Set snow container above background but below other elements
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
        
        // Update text wrap width
        (this.messageText.style as any).wordWrapWidth = width * 0.8;
        
        // Update character position
        this.character.setPosition(width * 0.15, height * 0.75);
        
        // Update positions
        this.updatePositions(width, height);

        // Update snowflakes screen bounds
        this.snowflakes.forEach(snow => {
            snow.updateScreenSize(width, height);
        });

        // Update santa sleigh
        this.santaSleigh.setScreenWidth(width);
        this.santaSleigh.setY(height * 0.2);
    }

    public setCallbacks(onConfirm: () => void, onCancel: () => void): void {
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
    }
} 