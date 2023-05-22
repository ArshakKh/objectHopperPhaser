import {BaseScene} from './BaseScene';

export class LoadScene extends BaseScene {
	constructor(key: string, options: any) {
		super('LoadScene');
	}

	public preload(): void {
		const progress = this.add.graphics();

		this.load.on('progress', (value: number) => {
			progress.clear();
			progress.fillStyle(0xffffff, 1);
			progress.fillRect(
				0,
				this.scale.gameSize.height / 2,
				this.scale.gameSize.width * value,
				60,
			);
		});

		this.load.on('complete', () => {
			progress.destroy();
		});

		this.load.image('clouds1', './assets/clouds.png');
		this.load.image('clouds2', './assets/clouds2.png');
		this.load.image('mountain', './assets/mountain.png');
		this.load.image('hills', './assets/mountain.png');
		this.load.image('boulder1', './assets/boulder.png');
		this.load.image('boulder2', './assets/boulder2.png');
		this.load.image('boulder3', './assets/boulder3.png');
		this.load.image('tree1', './assets/tree1.png');
		this.load.image('tree2', './assets/tree2.png');
		this.load.image('tree3', './assets/tree3.png');
		this.load.image('background', './assets/bg.png');
		this.load.image('ball', './assets/ball.png');
		this.load.image('ball-dirty', './assets/dirty_ball.png');
		this.load.image('puddle', './assets/puddle.png');
	}

	public create(): void {
		this.scene.start('GameScene', {});
	}

}
