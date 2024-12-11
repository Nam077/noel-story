import { Game } from './Game';
import WebFont from 'webfontloader';

const loadFonts = () => {
    return new Promise<void>((resolve) => {
        WebFont.load({
            google: {
                families: ['Roboto:400,700']
            },
            active: () => resolve()
        });
    });
};

const startGame = async () => {
    // Load fonts first
    await loadFonts();

    // Then start the game
    const game = new Game();
    game.init();
};

startGame();
