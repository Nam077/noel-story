import { Application, Assets } from 'pixi.js';
import { ConfirmationScreen } from './screens/ConfirmationScreen';
import { StoryScreen } from './screens/StoryScreen';
import backgroundImage from './assets/images/background.jpg';
import santaImage from './assets/images/santa.png';
import okImage from './assets/images/ok.png';
import gsap from 'gsap';
import { Container } from 'pixi.js';
import page1 from './assets/images/stories/1.jpg';
import page2 from  './assets/images/stories/2.jpg'
import page3 from './assets/images/stories/3.jpg';
import page4 from './assets/images/stories/4.jpg';
import page5 from './assets/images/stories/5.jpg';
import page6 from './assets/images/stories/6.jpg';
import page7 from './assets/images/stories/7.jpg';
import page8 from './assets/images/stories/8.jpg';
import bg2 from './assets/images/bg2.jpg';
import { DrawScreen } from './screens/DrawScreen';
import { Music } from './audio/Music';
import bgMusic from './assets/musics/bg.mp3';

export class Game {
    private app: Application;
    private gameWidth: number;
    private gameHeight: number;
    private confirmationScreen: ConfirmationScreen;
    private storyScreen?: StoryScreen;
    private currentScreen?: Container;

    constructor() {
        this.app = new Application();
        this.updateDimensions();

        // Khởi tạo nhạc nền
        Music.init(bgMusic);

        // Thêm sự kiện cho toàn bộ tương tác người dùng
        const startMusic = () => {
            Music.play();
            // Xóa các event listener sau khi đã phát nhạc
            document.removeEventListener('click', startMusic);
            document.removeEventListener('keydown', startMusic);
            document.removeEventListener('touchstart', startMusic);
        };

        // Lắng nghe nhiều loại tương tác
        document.addEventListener('click', startMusic);
        document.addEventListener('keydown', startMusic);
        document.addEventListener('touchstart', startMusic);
    }

    private updateDimensions() {
        this.gameWidth = window.innerWidth;
        this.gameHeight = window.innerHeight;
    }

    async init() {
        // Get the actual pixel ratio
        const dpr = window.devicePixelRatio || 1;
        
        await this.app.init({
            width: this.gameWidth,
            height: this.gameHeight,
            backgroundColor: 0x1099bb,
            resolution: 1, // Set to 1 instead of using devicePixelRatio
            antialias: true,
            hello: true,
            autoDensity: true, // Add this to handle DPR automatically
        });

        // Reset stage position and scale
        this.app.stage.position.set(0, 0);
        this.app.stage.scale.set(1);

        document.body.appendChild(this.app.canvas);
        await this.setup();
        this.addEventListeners();
        this.startGameLoop();
    }

    private async loadAssets() {
        await Assets.load([
            backgroundImage,
            santaImage,
            okImage,
            bg2,
            page1, page2, page3, page4,
            page5, page6, page7, page8
        ]);
    }

    private async setup() {
        // Load all assets first
        await this.loadAssets();

        // Then create screen
        this.confirmationScreen = new ConfirmationScreen(
            this.gameWidth,
            this.gameHeight,
            {
                title: "Xác nhận",
                message: "Có muốn nghe kể chuyện không nè?",
                titleStyle: {
                    fill: 0x00FF00
                },
                messageStyle: {
                    fill: 0xFFFFFF
                }
            }
        );
        
        this.currentScreen = this.confirmationScreen;
        this.app.stage.addChild(this.confirmationScreen);
        
        this.confirmationScreen.setCallbacks(
            () => {
                Music.setVolume(0.3); // Giảm volume khi bắt đầu story
                this.showStoryScreen();
            },
            () => console.log('User cancelled!')
        );
    }

    private async showStoryScreen() {
        this.storyScreen = new StoryScreen(
            this.gameWidth,
            this.gameHeight,
            {
                title: "Món Quà Giáng Sinh Kỳ Diệu",
                pages: [
                    {
                        text: "Ngày xửa ngày xưa, trong một ngôi làng nhỏ giữa mùa đông lạnh giá, có một cậu bé nghèo tên là Tom. Đêm Giáng sinh, tuyết rơi trắng xóa, Tom đứng co ro trước cửa sổ của một cửa hàng đồ chơi. Đôi mắt cậu lấp lánh nhìn những món đồ tuyệt đẹp bên trong - những thứ mà cậu chỉ dám mơ ước. Bên ngoài, gió rét thổi buốt da, nhưng Tom không rời đi, như thể ánh sáng từ cửa hàng là điều duy nhất sưởi ấm trái tim cậu.",
                        image: page1
                    },
                    {
                        text: "Tom không có cha mẹ, cậu sống nhờ bà ngoại trong một căn nhà nhỏ xiêu vẹo ở cuối làng. Mỗi ngày, Tom đều giúp bà chẻ củi và nhặt những cành cây khô trong rừng để sưởi ��m. Cậu chưa từng được nhận quà Giáng sinh, nhưng trong tim, cậu vẫn luôn giữ niềm tin rằng ông già Noel sẽ mang đến điều kỳ diệu. “Liệu năm nay có gì khác không nhỉ?” Tom thầm nghĩ khi nhìn lên bầu trời đầy tuyết.",
                        image: page2
                    },
                    {
                        text: "Đêm đó, Tom trở về nhà, ngồi bên bếp lửa nhỏ cùng bà. Dù nghèo khó, bà ngoại vẫn kể cho cậu những câu chuyện cổ tích ấm áp về ông già Noel và những phép màu đêm Giáng sinh. Trước khi đi ngủ, Tom lấy một mảnh giấy nhỏ, viết một bức thư đơn giản gửi đến ông già Noel: “Cháu không cần đồ chơi đắt tiền, cháu chỉ mong mọi người trong làng có thể cười nhiều hơn...” Cậu lặng lẽ đặt bức thư lên bệ cửa sổ rồi chìm vào giấc ngủ.",
                        image: page3
                    },
                    {
                        text: "Đêm khuya, khi mọi thứ đều yên ắng, ông già Noel xuất hiện trên chiếc xe tuần lộc. Ông nhìn thấy căn nhà nhỏ của Tom và ánh sáng yếu ớt từ bên trong. Bước đến bên cửa sổ, ông tìm thấy bức thư nh���. Khi đọc dòng chữ trong thư, trái tim ông tràn ngập xúc động. “Một ước nguyện đặc biệt,” ông thì thầm. “Cậu bé này không chỉ nghĩ đến mình mà còn nghĩ đến hạnh phúc của mọi người...”",
                        image: page4
                    },
                    {
                        text: "Sáng hôm sau, Tom tỉnh dậy, thấy một chiếc hộp nhỏ bên giường. Bên trong không phải là đồ chơi, mà là một chiếc chuông bạc xinh xắn và một lá thư từ ông già Noel: “Tom thân mến, món quà của cháu không nằm trong chiếc hộp này, mà là bên trong trái tim cháu. Hãy dùng chiếc chuông này để mang lại niềm vui cho những người xung quanh. Mỗi lần cháu làm ai đó mỉm cười, cháu sẽ nghe thấy âm thanh của phép màu.”",
                        image: page5
                    },
                    {
                        text: "Từ ngày đó, Tom bắt đầu tìm cách giúp đỡ mọi người. Cậu nhặt củi giúp bà cụ hàng xóm, đẩy xe hàng cho bác thợ rèn, và kể chuyện cười cho những đứa trẻ trong làng. Điều kỳ lạ là mỗi khi có ai đó mỉm cười, chiếc chuông bạc trong túi Tom lại ngân lên m��t tiếng nhẹ nhàng. Mỗi tiếng chuông là một ngôi sao nhỏ sáng lên trên bầu trời.",
                        image: page6
                    },
                    {
                        text: "Đêm Giáng sinh, cả làng bất ngờ nhận ra bầu trời sáng rực với hàng ngàn người sao. Mọi người tụ tập lại và cùng nhau trò chuyện, cười đùa. Ai cũng cảm nhận được hơi ấm kỳ diệu lan tỏa khắp nơi. Cậu bé Tom đứng bên cạnh bà, ngắm nhìn bầu trời và mỉm cười hạnh phúc. Cậu hiểu rằng, món quà quý giá nhất không phải là những thứ xa hoa, mà là niềm vui và tình yêu thương dành cho người khác.",
                        image: page7
                    },
                    {
                        text: "Giờ đây, mỗi Giáng sinh, người dân trong làng lại kể câu chuyện về cậu bé Tom và chiếc chuông bạc kỳ diệu. Câu chuyện nhắc nhở rằng: “Hạnh phúc không phải ở việc nhận, mà là ở việc trao đi.” Những ngôi sao trên bầu trời là minh chứng cho tình yêu và lòng tốt không biên giới mà Tom đã mang lại.",
                        image: page8
                    }
                ],
                onComplete: () => {
                    this.showDrawScreen();
                }
            }
        );

        // Transition between screens
        if (this.currentScreen) {
            gsap.to(this.currentScreen, {
                alpha: 0,
                duration: 0.5,
                onComplete: () => {
                    this.app.stage.removeChild(this.currentScreen!);
                    this.storyScreen!.alpha = 0;
                    this.app.stage.addChild(this.storyScreen!);
                    gsap.to(this.storyScreen, {
                        alpha: 1,
                        duration: 0.5
                    });
                    this.currentScreen = this.storyScreen;
                    Music.setVolume(0.3);
                }
            });
        }
    }

    private async showDrawScreen() {
        const drawScreen = new DrawScreen(
            this.gameWidth,
            this.gameHeight,
            {
                onComplete: () => {
                    // Xử lý khi hoàn thành DrawScreen
                }
            }
        );

        // Transition to draw screen
        gsap.to(this.currentScreen!, {
            alpha: 0,
            duration: 0.5,
            onComplete: () => {
                this.app.stage.removeChild(this.currentScreen!);
                drawScreen.alpha = 0;
                this.app.stage.addChild(drawScreen);
                gsap.to(drawScreen, {
                    alpha: 1,
                    duration: 0.5
                });
                this.currentScreen = drawScreen;
                Music.setVolume(0.5);
            }
        });
    }

    private onResize() {
        this.updateDimensions();
        this.app.renderer.resize(this.gameWidth, this.gameHeight);
        this.confirmationScreen.resize(this.gameWidth, this.gameHeight);
    }

    private addEventListeners() {
        window.addEventListener('resize', () => {
            this.onResize();
        });
    }

    private startGameLoop() {
        this.app.ticker.add(() => {
            this.update();
        });
    }

    private update() {
        // Update current screen
        if (this.currentScreen) {
            (this.currentScreen as any).update?.();
        }
    }
}
