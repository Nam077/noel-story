import { Container } from 'pixi.js';
import { Button } from './Button';
import { ButtonShape } from './ButtonShape';
import { TextStyle } from 'pixi.js';
import { Character } from './Character';

interface DialogOptions {
    initialDialog: string;
    teasingDialogs: string[];  // Mảng các câu nói khi trêu
    finalDialog: string;       // Câu nói khi đã trêu đủ số lần
    onMaxTeases?: () => void; // Callback khi đạt max teases
}

export class DialogButtons extends Container {
    private acceptButton: Button;
    private declineButton: Button;
    private originalAcceptPos = { x: 0, y: 0 };
    private isHovering = false;
    private teasingCount: number = 0;  // Số lần đã trêu
    private maxTeases: number;         // Số lần tối đa được trêu
    private dialogOptions: DialogOptions;
    private character: Character;

    constructor(maxTeases: number = 5, dialogOptions: DialogOptions, character: Character) {  // Mặc định 5 lần
        super();
        this.maxTeases = maxTeases;
        this.dialogOptions = dialogOptions;
        this.character = character;

        // Common text style for both buttons
        const commonTextStyle: Partial<TextStyle> = {
            fontSize: 48,
            fontWeight: "bold",
            fill: 0xFFFFFF,
            fontFamily: 'Roboto',
        };

        const borderWidth = 4;  // Common border width

        // Create "CÓ" button
        this.acceptButton = new Button('CÓ', {
            shape: ButtonShape.RoundedRectangle,
            width: 200,
            height: 100,
            borderColor: 0x2E7D32,
            borderWidth: borderWidth,
            tooltipText: 'Hãy thử bắt lấy nút này :)',
            onHover: () => this.onAcceptHover(),
            onOut: () => this.onAcceptOut(),
            textStyle: commonTextStyle
        });

        // Create "KHÔNG" button - Same style as "CÓ"
        this.declineButton = new Button('KHÔNG', {  // Uppercase to match
            shape: ButtonShape.RoundedRectangle,
            width: 200,
            height: 100,  // Same height as accept button
            backgroundColor: 0xFF0000,
            borderColor: 0xFF0000,
            borderWidth: borderWidth,
            tooltipText: 'Nhấn để từ chối',
            onClick: () => console.log('Declined!'),
            textStyle: commonTextStyle  // Use same text style
        });

        // Calculate spacing
        const spacing = 40; // Space between buttons
        const totalWidth = this.acceptButton.getWidth() + spacing + this.declineButton.getWidth();
        
        // Position buttons relative to center
        this.acceptButton.setPosition(-totalWidth/2, 0);
        this.declineButton.setPosition(-totalWidth/2 + this.acceptButton.getWidth() + spacing, 0);
        
        this.originalAcceptPos = { 
            x: -totalWidth/2, 
            y: 0 
        };

        this.addChild(this.acceptButton);
        this.addChild(this.declineButton);

        this.startAnimation();

        // Show initial dialog
        this.character.showDialog(this.dialogOptions.initialDialog);
    }

    private onAcceptHover(): void {
        if (this.teasingCount >= this.maxTeases) {
            return;
        }

        if (!this.isHovering) {
            this.isHovering = true;
            this.teasingCount++;
            
            // Chọn random một câu nói từ teasingDialogs
            const randomDialog = this.dialogOptions.teasingDialogs[
                Math.floor(Math.random() * this.dialogOptions.teasingDialogs.length)
            ];
            this.character.showDialog(randomDialog);

            // Nếu là lần cuối
            if (this.teasingCount === this.maxTeases) {
                this.acceptButton.setTooltip(this.dialogOptions.finalDialog);
                this.dialogOptions.onMaxTeases?.();
            }
            
            this.acceptButton.setTextStyle({
                fontSize: 56,
                fontWeight: "bold",
                fill: 0xFFFFFF,
                fontFamily: 'Roboto',
            });
            
            // Chỉ di chuyển nếu chưa đủ số lần
            this.moveAcceptButton();
        }
    }

    private onAcceptOut(): void {
        this.isHovering = false;
        
        this.acceptButton.setTextStyle({
            fontSize: 48,
            fontWeight: "bold",
            fill: 0xFFFFFF,
            fontFamily: 'Roboto',
        });

        // Nếu đã trêu đủ số lần, trả nút về vị trí ban đầu
        if (this.teasingCount >= this.maxTeases) {
            this.acceptButton.setPosition(this.originalAcceptPos.x, this.originalAcceptPos.y);
        }
    }

    private moveAcceptButton(): void {
        const padding = 50;
        // Giới hạn vùng di chuyển trong viewport
        const maxX = Math.min(window.innerWidth - this.acceptButton.getWidth() - padding, window.innerWidth * 0.8);
        const maxY = Math.min(window.innerHeight - this.acceptButton.getHeight() - padding, window.innerHeight * 0.8);
        const minX = padding;
        const minY = padding;
        
        // Generate random position but avoid the decline button area
        let randomX, randomY;
        const declinePos = this.declineButton.getPosition();
        
        do {
            randomX = minX + Math.random() * (maxX - minX);
            randomY = minY + Math.random() * (maxY - minY);
        } while (
            Math.abs(randomX - declinePos.x) < 100 && 
            Math.abs(randomY - declinePos.y) < 100
        );

        const globalPoint = this.toLocal({ x: randomX, y: randomY });
        this.acceptButton.setPosition(globalPoint.x, globalPoint.y);
    }

    private startAnimation(): void {
        let time = 0;
        const animate = () => {
            if (this.isHovering) {
                time += 0.1;
                const offsetY = Math.sin(time) * 10;
                const currentPos = this.acceptButton.getPosition();
                this.acceptButton.setPosition(currentPos.x, currentPos.y + offsetY);
            }
            requestAnimationFrame(animate);
        };
        animate();
    }

    public setCallbacks(onAccept: () => void, onDecline: () => void): void {
        // Chỉ cho phép click accept khi đã trêu đủ số lần
        this.acceptButton.setCallbacks({ 
            onClick: () => {
                if (this.teasingCount >= this.maxTeases) {
                    onAccept();
                }
            }
        });
        this.declineButton.setCallbacks({ onClick: onDecline });
    }
} 