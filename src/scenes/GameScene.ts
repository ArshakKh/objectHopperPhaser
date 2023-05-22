import {BaseScene} from './BaseScene';
import {Input} from 'phaser';
import {Colors} from '../Components/Colors';
import {gameSettings} from '../config/GameSettings';
import {Util} from '../Components/Util';
import {Player} from '../Components/Player';
import {Road} from '../Components/Road';
import {Renderer} from '../Components/Renderer';
import {TrackSegment} from '../Components/TrackSegment';
import {Prop} from '../Components/Prop';

export class GameScene extends BaseScene {
	public position: number;
	public player: Player;
	public road: Road;
	// @ts-ignore
	public renderer: Renderer;

	public prop: Prop;

	public background: Phaser.GameObjects.Image;
	public sky: Phaser.GameObjects.Rectangle;
	public clouds1: Phaser.GameObjects.TileSprite;
	public clouds2: Phaser.GameObjects.TileSprite;
	public mountains: Phaser.GameObjects.TileSprite;

	public camera: Phaser.Cameras.Scene2D.Camera;

	public hills: Phaser.GameObjects.TileSprite;
	public hillsBaseY: number;

	public cursors: Input.Keyboard.CursorKeys;
	public isFirstTime: boolean = true;

	public gameIndex: number = 0;

	public cards: any[] = this.createCards(15);

	constructor(key: string, options: any) {
		super('GameScene');
	}

	public create(): void {

		const gameWidth = this.scale.gameSize.width;
		const gameHeight = this.scale.gameSize.height;

		this.cursors = this.input.keyboard.createCursorKeys();
		this.camera = this.cameras.main;

		this.road = new Road(this);

		this.sky = this.add.rectangle(-10, -20, gameWidth + 20, gameHeight + 30, Colors.SKY.color).setOrigin(0).setZ(0).setDepth(0);
		this.mountains = this.add.tileSprite(-10, 0, gameWidth + 20, gameHeight / 2, 'mountain').setOrigin(0).setZ(3).setDepth(3);

		this.hillsBaseY = gameHeight / 2;

		this.renderer = new Renderer(this, 5);
		this.player = new Player(this, 0, gameHeight - 5, gameSettings.cameraHeight * gameSettings.cameraDepth); // player z helps with collision distances

		// reset road to empty
		// currently creates test track
		this.road.resetRoad();
	}

	public update(time: number, delta: number): void {
		const dlt = delta * 0.01;

		const playerSegment = this.road.findSegmentByZ(this.player.trackPosition + this.player.z);
		const playerPercent = Util.percentRemaining(this.player.trackPosition + this.player.z, gameSettings.segmentLength);
		const speedMultiplier = this.player.speed / gameSettings.maxSpeed;
		const dx = this.player.speed <= 0 ? 0 : dlt * speedMultiplier;

		this.handleInput(delta, playerSegment);
		this.moveHandle(delta, playerSegment);

		this.player.y = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
		this.player.x = this.player.x - (dx * speedMultiplier * playerSegment.curve * gameSettings.centrifugal);

		this.player.speed = Phaser.Math.Clamp(this.player.speed, 0, gameSettings.maxSpeed);
		this.player.x = Phaser.Math.Clamp(this.player.x, -gameSettings.roadWidthClamp, gameSettings.roadWidthClamp);
		this.player.turn = Phaser.Math.Clamp(this.player.turn, -gameSettings.maxTurn, gameSettings.maxTurn);
		this.player.trackPosition = Util.increase(this.player.trackPosition, dlt * this.player.speed * -1, this.road.trackLength);

		this.player.pitch = (playerSegment.p1.world.y - playerSegment.p2.world.y) * 0.002;

		if (this.player.isOnGravel && this.player.speed > gameSettings.offRoadLimit) {
			this.player.speed = Util.accelerate(this.player.speed, gameSettings.offRoadDecel, dlt);
		}

		// hide all props
		this.road.hideAllProps();
		// this.carManager.hideAll();

		// update parallax bg's
		this.updateBg(dx * playerSegment.curve);

		// draw road
		this.renderer.update(time, delta);

		// update other cars on track
		// this.carManager.update(dlt, playerSegment, this.player.x);

		// update registry
		this.registry.set('speed', Math.floor(this.player.speed / 10));
	}

	public checkHandle(answer: any, propX: number, propY: number) {
		console.log(answer, this.cards[this.gameIndex].answer);
		if (answer.toString() === this.cards[this.gameIndex].answer.toString()) {
			this.player.jumpInToPuddle(propX, propY);
			setTimeout(() => {
				if (this.gameIndex < this.cards.length - 1) {
					this.gameIndex++;
				}
			}, 2000);
		}
	}

	// private ------------------------------------
	private updateBg(offset: number): void {
		// this.clouds1.tilePositionX += 0.05 + offset * this.clouds1.z;
		// this.clouds2.tilePositionX += 0.1 + offset * this.clouds2.z;
		// this.clouds3.tilePositionX += 0.125 + offset * this.clouds3.z;
		this.mountains.tilePositionX += offset * this.mountains.z;
		// this.hills.tilePositionX += offset * this.hills.z;
		// this.hills.setY(this.hillsBaseY - this.player.pitch * 20);
	}

	private moveHandle(delta: number, playerSegment: TrackSegment) {
		const dlt = delta * 0.01;

		if (this.road.puddlePosition.length > 0 && playerSegment.index !== this.road.puddlePosition[this.gameIndex] - 1) {
			const speed = Util.accelerate(this.player.speed, Util.interpolate(gameSettings.accel, 0, Util.percentRemaining(this.player.speed, gameSettings.maxSpeed)), dlt);
			this.player.speed = speed < 200 ? speed : 200;
			this.ballJump();
			this.player.accelerating = true;
		} else {
			this.player.speed = Util.accelerate(this.player.speed, gameSettings.breaking, dlt);
			this.endBallJump();
			this.isFirstTime = true;
		}
	}

	private handleInput(delta: number, playerSegment: TrackSegment) {
		const dlt = delta * 0.01;
		// this.player.speed = Util.accelerate(this.player.speed, Util.interpolate(gameSettings.accel, 0, Util.percentRemaining(this.player.speed, gameSettings.maxSpeed) ), dlt);
		// this.player.accelerating = true;

		// const speed = Util.accelerate(this.player.speed, Util.interpolate(gameSettings.accel, 0, Util.percentRemaining(this.player.speed, gameSettings.maxSpeed) ), dlt);
		// this.player.speed = speed < 200 ? speed : 200;
		// this.player.startJump();

		if (this.cursors.up.isDown) {
			const speed = Util.accelerate(this.player.speed, Util.interpolate(gameSettings.accel, 0, Util.percentRemaining(this.player.speed, gameSettings.maxSpeed)), dlt);
			this.player.speed = speed < 200 ? speed : 200;
			console.log(playerSegment.index);
			// this.player.speed = speed;
			this.ballJump();
			this.player.accelerating = true;
		} else if (this.cursors.down.isDown) {
			this.player.speed = Util.accelerate(this.player.speed, gameSettings.breaking, dlt);
			// this.player.endJump();
			this.isFirstTime = true;
		} else {
			this.player.accelerating = false;
			this.player.speed = Util.accelerate(this.player.speed, gameSettings.decel, dlt);
		}

		if (this.player.speed > 500 && this.player.screeching) {
			this.player.speed = Util.accelerate(this.player.speed, gameSettings.screechDecel, dlt);
		}
	}

	private ballJump() {
		if (this.isFirstTime) {
			this.player.startJump();
			this.isFirstTime = false;
		}
	}

	private endBallJump() {
		if (!this.isFirstTime) {
			this.player.endJump();
			this.isFirstTime = true;
		}
	}

	private createCards(range: number) {

		const innerCards = [];

		for (let i = 0; i < 4; i++) {
			const num = [];
			while (num.length < 4) {
				const r = Math.floor(Math.random() * range);
				if (num.indexOf(r) === -1) {
					num.push(r);
				}
			}
			innerCards[i] = {count: num, answer: num[Math.floor(Math.random() * (num.length - 1))]};
		}
		return innerCards;
	}
}
