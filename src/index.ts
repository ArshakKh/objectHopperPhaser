import {LoadScene} from './scenes/LoadScene';
import {GameScene} from './scenes/GameScene';
import 'phaser';

const game = new Phaser.Game({
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scale: {
		mode: Phaser.Scale.ScaleModes.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
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
