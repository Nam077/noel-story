import { Container, Text, TextStyle, Sprite, Graphics } from 'pixi.js';
import { Character } from '../models/Character';
import santaImage from '../assets/images/santa.png';
import { Button } from '@/models/Button';
import { ButtonShape } from '../models/ButtonShape';
import gsap from 'gsap';
import { Snow } from '../effects/Snow';
import { SantaSleigh } from '../effects/SantaSleigh';
import bg2 from '../assets/images/bg2.jpg';
import { DropShadowFilter } from 'pixi-filters';

interface StoryPage {
    text: string;
    image?: string;
    animation?: string;
}

interface StoryScreenOptions {
    title: string;
    pages: StoryPage[];
    onComplete?: () => void;
    typingSpeed?: number;
}

export class StoryScreen extends Container {
    private character: Character;
    private pages: StoryPage[];
    private currentPageIndex: number = 0;
    private pageText: Text;
    private pageImage?: Sprite;
    private nextButton: Button;
    private prevButton: Button;
    private currentTextIndex: number = 0;
    private textSpeed: number = 50;
    private isTyping: boolean = false;
    private isTransitioning: boolean = false;
    private typingTimeout?: number;
    private background: Sprite;
    private snowflakes: Snow[] = [];
    private readonly SNOW_COUNT = 100;
    private santaSleigh: SantaSleigh;
    private textPanel: Graphics;
    private textContainer: Container;
    private onComplete?: () => void;
    private isTypingComplete: boolean = false;

    constructor(width: number, height: number, options: StoryScreenOptions) {
        super();
        this.onComplete = options.onComplete;
        this.pages = options.pages;
        this.textSpeed = options.typingSpeed || 50;

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

        // Setup character
        this.character = new Character(
            width * 0.15,
            height * 0.75,
            {
                image: santaImage,
                scale: 0.1
            }
        );
        this.addChild(this.character);

        // Setup text display
        this.pageText = new Text({
            text: '',
            style: {
                fontSize: 20,
                fontFamily: 'Roboto',
                fill: 0xFFFFFF,
                fontWeight: 'bold',
                align: 'center',
                wordWrap: true,
                wordWrapWidth: width * 0.6,
                lineHeight: 40,
                letterSpacing: 1,
                padding: 10,
            }
        });
        this.pageText.filters = [
            new DropShadowFilter({
                color: 0x000000,
                alpha: 0.8,
                blur: 3,
                offset: { x: 2, y: 2 },
                quality: 3
            })
        ];
        this.pageText.anchor.set(0.5, 0);
        this.pageText.position.set(width * 0.5, height * 0.6);
        this.addChild(this.pageText);

        // Create text background panel
        this.textPanel = new Graphics();
        this.textPanel.beginFill(0x000000, 0.5);
        this.textPanel.drawRoundedRect(
            -width * 0.3,    // Căn giữa panel
            -50,             // Đẩy lên trên một chút
            width * 0.6,     // Chiều rộng bằng 60% màn hình
            200,             // Chi��u cao cố định
            20               // Bo góc
        );
        this.textPanel.endFill();

        // Create text container
        this.textContainer = new Container();
        this.textContainer.addChild(this.textPanel);
        this.textContainer.addChild(this.pageText);

        // Đặt vị trí cho container
        this.textContainer.position.set(width * 0.5, height * 0.6);
        this.addChild(this.textContainer);

        // Cập nhật style của text
        this.pageText.style = {
            fontSize: 20,
            fontFamily: 'Roboto',
            fill: 0xFFFFFF,
            fontWeight: 'bold',
            align: 'center',
            wordWrap: true,
            wordWrapWidth: width * 0.55,
            lineHeight: 40,
            letterSpacing: 1,
            padding: 20,
        };

        // Đặt lại vị trí của text relative với panel
        this.pageText.position.set(0, 0);  // Căn giữa trong panel

        // Setup navigation buttons
        this.setupNavigationButtons();

        // Start with first page
        this.showPage(0);
    }

    private setupNavigationButtons(): void {
        // Create next button
        this.nextButton = new Button('Tiếp', {
            shape: ButtonShape.RoundedRectangle,
            width: 120,
            height: 50,
            borderColor: 0x2E7D20,
            backgroundColor: 0x4CAF50,
            textStyle: {
                fontSize: 24,
                fontFamily: 'Roboto',
                fill: 0xFFFFFF
            },
            onClick: () => this.nextPage()
        });

        // Create prev button
        this.prevButton = new Button('Lùi', {
            shape: ButtonShape.RoundedRectangle,
            width: 120,
            height: 50,
            borderColor: 0x2E7D20,
            backgroundColor: 0x4CAF50,
            textStyle: {
                fontSize: 24,
                fontFamily: 'Roboto',
                fill: 0xFFFFFF
            },
            onClick: () => this.prevPage()
        });

        // Position buttons at bottom
        const spacing = 20;
        this.prevButton.setPosition(spacing, window.innerHeight - 100);
        this.nextButton.setPosition(window.innerWidth - 120 - spacing, window.innerHeight - 100);

        this.addChild(this.prevButton);
        this.addChild(this.nextButton);
    }

    private showPage(index: number): void {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Clear any existing typing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.currentPageIndex = index;
        
        // Reset text and states
        this.pageText.text = '';
        this.currentTextIndex = 0;
        this.isTyping = true;

        // Show image and start typing
        if (this.pages[index].image) {
            this.showImage(this.pages[index].image);
        }
        this.typeText(this.pages[index].text);
        
        this.isTransitioning = false;
    }

    private showImage(image: string): void {
        const newImage = Sprite.from(image);
        newImage.alpha = 0;
        
        // Set image properties
        newImage.anchor.set(0.5);
        newImage.width = window.innerWidth * 0.5;
        newImage.height = window.innerHeight * 0.45;
        newImage.position.set(
            window.innerWidth * 0.5,
            window.innerHeight * 0.25
        );

        if (this.pageImage) {
            gsap.to(this.pageImage, {
                alpha: 0,
                duration: 0.3,
                onComplete: () => {
                    this.removeChild(this.pageImage!);
                    this.pageImage = newImage;
                    this.addChild(newImage);
                    gsap.to(newImage, {
                        alpha: 1,
                        duration: 0.3,
                        onComplete: () => {
                            this.typeText(this.pages[this.currentPageIndex].text);
                        }
                    });
                }
            });
        } else {
            this.pageImage = newImage;
            this.addChild(newImage);
            gsap.to(newImage, {
                alpha: 1,
                duration: 0.3,
                onComplete: () => {
                    this.typeText(this.pages[this.currentPageIndex].text);
                }
            });
        }
    }

    private typeText(text: string, instant: boolean = false): void {
        if (instant) {
            // Hiển thị ngay toàn bộ text
            this.pageText.text = text;
            this.currentTextIndex = text.length;
            this.updateTextPanel();
            this.isTypingComplete = true;
            return;
        }

        const typeNextChar = () => {
            if (this.currentTextIndex < text.length && this.isTyping) {
                this.pageText.text = text.substring(0, this.currentTextIndex + 1);
                this.currentTextIndex++;
                this.updateTextPanel();
                this.typingTimeout = window.setTimeout(typeNextChar, this.textSpeed);
            } else {
                this.isTypingComplete = true;
            }
        };
        typeNextChar();
    }

    public skipTyping(): void {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        this.isTyping = false;
        this.pageText.text = this.pages[this.currentPageIndex].text;
        this.updateTextPanel();
        this.isTypingComplete = true;
    }

    public nextPage(): void {
        if (this.isTransitioning) return;

        // Nếu đang typing, hiển thị ngay toàn bộ text
        if (this.isTyping && !this.isTypingComplete) {
            if (this.typingTimeout) {
                clearTimeout(this.typingTimeout);
            }
            this.typeText(this.pages[this.currentPageIndex].text, true);
            return;
        }

        // Nếu đã hiển thị hết text, chuyển trang tiếp
        if (this.isTypingComplete) {
            if (this.currentPageIndex < this.pages.length - 1) {
                this.isTypingComplete = false;  // Reset trạng thái cho trang mới
                this.showPage(this.currentPageIndex + 1);
            } else if (this.currentPageIndex === this.pages.length - 1) {
                this.onComplete?.();
            }
        }
    }

    public prevPage(): void {
        if (!this.isTransitioning && this.currentPageIndex > 0) {
            this.showPage(this.currentPageIndex - 1);
        }
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

        // Update positions
        this.character.setPosition(width * 0.15, height * 0.75);
        this.pageText.position.set(width * 0.5, height * 0.6);
        this.pageText.style.wordWrapWidth = width * 0.6;

        // Update image position if exists
        if (this.pageImage) {
            this.pageImage.width = width * 0.5;
            this.pageImage.height = height * 0.45;
            this.pageImage.position.set(
                width * 0.5,
                height * 0.25
            );
        }

        // Update button positions
        const spacing = 20;
        this.prevButton.setPosition(spacing, height - 100);
        this.nextButton.setPosition(width - 120 - spacing, height - 100);

        // Update text style and position
        this.pageText.style.wordWrapWidth = width * 0.55;
        this.textContainer.position.set(width * 0.5, height * 0.6);
        
        // Update panel size based on new text bounds
        this.updateTextPanel();
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

    private updateTextPanel(): void {
        const textBounds = this.pageText.getBounds();
        const padding = 40;

        this.textPanel.clear();
        this.textPanel.beginFill(0x000000, 0.5);
        this.textPanel.drawRoundedRect(
            -textBounds.width / 2 - padding,  // Căn giữa và thêm padding
            -padding,                         // Thêm padding phía trên
            textBounds.width + padding * 2,   // Chiều rộng + padding 2 bên
            textBounds.height + padding * 2,  // Chiều cao + padding 2 đầu
            20
        );
        this.textPanel.endFill();
    }
} 