export class Music {
    private static audio: HTMLAudioElement;
    private static isPlaying: boolean = false;

    public static init(src: string): void {
        this.audio = new Audio(src);
        this.audio.loop = true; // Lặp lại liên tục
        this.audio.volume = 0.5; // Âm lượng 50%
    }

    public static play(): void {
        if (!this.isPlaying && this.audio) {
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                })
                .catch(error => {
                    console.log("Autoplay prevented:", error);
                });
        }
    }

    public static pause(): void {
        if (this.isPlaying && this.audio) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    public static setVolume(volume: number): void {
        if (this.audio) {
            this.audio.volume = Math.max(0, Math.min(1, volume));
        }
    }
} 