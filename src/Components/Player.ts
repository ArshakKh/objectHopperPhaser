import {GameScene} from '../scenes/GameScene';

export class Player {
	public position: Phaser.Math.Vector3;
	public sprite: Phaser.GameObjects.Rectangle;
	public scene: GameScene;
	public model: any;
	public turn: number;
	public pitch: number;
	public speed: number;
	public trackPosition: number;
	public accelerating: boolean = false;
	public screeching: boolean = false;
	public hero: any;
	public jumpingTween: any;
	public power: number;
	public timer: Phaser.Time.TimerEvent;
	public heroX: number;
	public heroY: number;
	public screenW: number;
	public screenH: number;
	private turnVector: Phaser.Math.Vector3;

	constructor(scene: GameScene, x: number, y: number, z: number) {
		this.position = new Phaser.Math.Vector3(x, y, z);
		this.scene = scene;
		this.turn = 0;
		this.pitch = 0;
		this.speed = 0;
		this.trackPosition = 0;
		this.turnVector = new Phaser.Math.Vector3(0, 0, 0);
		this.power = 0;

		this.screenW = this.scene.camera.width;
		this.screenH = this.scene.camera.height;

		const hero = this.scene.add.sprite(0, 0, 'ball');
		this.hero = hero;
		hero.setDepth(20);

		this.heroX = this.screenW / 2;
		this.heroY = this.screenH - (this.screenH * 0.3);

		hero.setPosition(this.heroX, this.heroY);
		hero.setScale(0.4, 0.4);
		this.hero = hero;

	}

	public startJump() {
		this.hero.setTexture('ball');
		this.scene.tweens.add({
			targets: this.hero,
			x: this.heroX,
			y: this.heroY,
			duration: 500,
			repeat: 0,
			ease: 'Quad.easeInOut',
			onComplete: () => {
				this.jumpingTween.play();
			},
		});
		this.jumpingTween = this.scene.tweens.add({
			targets: this.hero,
			x: this.heroX,
			y: this.screenH / 2,
			duration: 1000,
			yoyo: true,
			repeat: -1,
			paused: true,
			ease: 'Quad.easeInOut',
		});
	}

	public endJump() {
		this.jumpingTween.stop();
		this.scene.tweens.add({
			targets: this.hero,
			y: this.heroY,
			duration: 800,
			repeat: 0,
			ease: 'Quad.easeOut',
		});
	}

	public jumpInToPuddle(propX: number, propY: number) {
		this.scene.tweens.add({
			targets: this.hero,
			x: propX,
			y: this.screenH / 2,
			duration: 500,
			ease: 'Quad.easeInOut',
			repeat: 0,
			onComplete: () => {
				yTween.play();
			},
		});

		const yTween = this.scene.tweens.add({
			targets: this.hero,
			y: propY,
			duration: 500,
			ease: 'Quad.easeInOut',
			repeat: 0,
			paused: true,
			onComplete: () => {
				this.hero.setTexture('ball-dirty');
			},
		});
	}

	public get x(): number {
		return this.position.x;
	}

	public set x(x: number) {
		this.position.x = x;
		this.scene.registry.set('playerx', x);
	}

	public get y(): number {
		return this.position.y;
	}

	public set y(y: number) {
		this.position.y = y;
	}

	public get z(): number {
		return this.position.z;
	}

	public set z(z: number) {
		this.position.z = z;
	}

	public get isOnGravel(): boolean {
		return Math.abs(this.x) > 1;
	}
}
