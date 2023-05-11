import {GameScene} from '../scenes/GameScene';
import {Phaser3D} from '../libs/Phaser3D';

const HALFPI = Math.PI / 2;

export class Player {
	public position: Phaser.Math.Vector3;
	public sprite: Phaser.GameObjects.Rectangle;
	public scene: GameScene;
	// public p3d: Phaser3D;
	public model: any;
	public turn: number;
	public pitch: number;
	public speed: number;
	public trackPosition: number;
	public accelerating: boolean = false;
	public screeching: boolean = false;
	public hero: any;
	public power: number;
	public timer: Phaser.Time.TimerEvent;
	public collisionRadius: number = 20;
	private turnVector: Phaser.Math.Vector3;

	constructor(scene: GameScene, x: number, y: number, z: number, modelKey: string) {
		this.position = new Phaser.Math.Vector3(x, y, z);
		this.scene = scene;
		this.turn = 0;
		this.pitch = 0;
		this.speed = 0;
		this.trackPosition = 0;
		this.turnVector = new Phaser.Math.Vector3(0, 0, 0);
		this.power = 0;

		const particleSettings = {
			x: -100,
			y: -100,
			lifespan: 500,
			frequency: 66,
			frame: 0,
			blendMode: 'NORMAL',
			gravityY: -100,
			speed: 0,
			rotate: {onEmit: () => Math.random() * 359},
			scale: {start: 0.3, end: 2},
		};
		// this.p3d = new Phaser3D(this.scene, {fov: 35, x: 0, y: 7, z: -20, antialias: false});
		// this.p3d.view.setDepth(20);
		// this.p3d.addGLTFModel(modelKey);
		//
		// this.scene.add.sprite(50, 40, modelKey );
		//
		// this.p3d.camera.lookAt(0, 5.1, 0);
		//
		// this.p3d.add.hemisphereLight({skyColor: 0xefefff, groundColor: 0x111111, intensity: 2});
		// this.p3d.on('loadgltf', (gltf: any, model: any) => {
		// 	model.rotateY(HALFPI);
		// 	model.position.set(0, 0, 0);
		// 	model.scale.set(1, 1, 1);
		// 	this.model = model;
		// });

		const screenW = this.scene.camera.width;
		const screenH = this.scene.camera.height;

		const hero = this.scene.physics.add.sprite(screenW / 2, 0, 'ball');
		hero.setDepth(20);

		const heroW = screenW / 2 ;
		const heroH = screenH - hero.height;

		hero.setPosition(heroW, heroH);
		hero.setScale(0.5, 0.5);

		// set the gravity
		hero.setGravityY(1000);
		this.hero = hero;
		// place the ground
		const groundX = screenW / 2;
		const groundY = screenH * .95;
		const ground = this.scene.physics.add.sprite(groundX, groundY, 'puddle');
		// size the ground
		ground.displayWidth = screenW * 1.1;
		// make the ground stay in place
		ground.setImmovable();
		// add the colliders
		this.scene.physics.add.collider(hero, ground);

		this.scene.input.on('pointerdown', this.startJump, this);
		this.scene.input.on('pointerup', this.endJump, this);

		const yy = heroH - 170;
		this.scene.tweens.add({
			targets: hero,
			y: yy,
			duration: 800,
			yoyo: true,
			repeat: -1,
			ease: 'circ.out',
		});

		console.log();

	}

	public startJump() {
		this.timer = this.scene.time.addEvent({
			delay: 200,
			callback: this.tick,
			callbackScope: this,
			repeat: 5,
		});
		this.hero.setVelocityY(-400);
	}

	public endJump() {
		this.timer.remove();
	}

	public tick() {
		// if (this.power < 5) {
		// 	this.power += .1;
		// 	console.log(this.power);
		// }
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
