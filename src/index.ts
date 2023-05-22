import {LoadScene} from './scenes/LoadScene';
import {GameScene} from './scenes/GameScene';
import 'phaser';

const game = new Phaser.Game({
	type: Phaser.AUTO,
	parent: 'game-container',
	// width: 800,
	// height: 600,
	scale: {
		mode: Phaser.Scale.RESIZE,
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {
				y: 0,
			},
		},
	},
	render: {
		pixelArt: false,
	},
	scene: [LoadScene, GameScene],
});

game.scene.start('LoadScene', {});

window.addEventListener('resize', () => {
	game.scene.getScene('LoadScene').scene.restart();
});
