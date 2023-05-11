import { BaseScene } from './BaseScene';
import { Input } from 'phaser';
import { Colors } from '../Components/Colors';
import { gameSettings } from '../config/GameSettings';
import { Util } from '../Components/Util';
import { Player } from '../Components/Player';
import { Road } from '../Components/Road';
import { Renderer } from '../Components/Renderer';
import { TrackSegment } from '../Components/TrackSegment';

export class GameScene extends BaseScene {
	public position: number;
	public player: Player;
	public road: Road;
	// @ts-ignore
	public renderer: Renderer;

	public background: Phaser.GameObjects.Image;
	public sky: Phaser.GameObjects.Rectangle;
	public clouds1: Phaser.GameObjects.TileSprite;
	public clouds2: Phaser.GameObjects.TileSprite;
	public clouds3: Phaser.GameObjects.TileSprite;
	public mountains: Phaser.GameObjects.TileSprite;

	public camera: Phaser.Cameras.Scene2D.Camera;

	public hills: Phaser.GameObjects.TileSprite;
	public hillsBaseY: number;

	public cursors: Input.Keyboard.CursorKeys;

	constructor(key: string, options: any) {
		super('GameScene');
	}

	public create(): void {
		this.scene.launch('RaceUiScene', this);

		const gameWidth = this.scale.gameSize.width;
		const gameHeight = this.scale.gameSize.height;

		this.cursors = this.input.keyboard.createCursorKeys();
		this.camera = this.cameras.main;
		// this.background = this.add.sprite(800 / 2, (600 / 2) - 60, 'bg');

		this.road = new Road(this);

		this.sky = this.add.rectangle(-10, -20, gameWidth + 20, gameHeight + 30, Colors.SKY.color).setOrigin(0).setZ(0).setDepth(0);
		this.clouds2 = this.add.tileSprite(-10, 10, gameWidth + 20, 64, 'clouds1').setOrigin(0).setZ(3).setDepth(1);
		this.clouds3 = this.add.tileSprite(-10, 20, gameWidth + 20, 64, 'clouds2').setOrigin(0).setZ(4).setDepth(2);
		this.mountains = this.add.tileSprite(-10, gameHeight / 2 - 85, gameWidth + 20, 128, 'mountain').setOrigin(0).setZ(3).setDepth(3);
		this.clouds1 = this.add.tileSprite(-10, 0, gameWidth + 20, 64, 'clouds1').setOrigin(0).setZ(2).setDepth(4);
		// this.background = this.add.image(800 / 2, (600 / 2) - 60, 'background');

		this.hillsBaseY = gameHeight / 2 - 40;
		this.hills = this.add.tileSprite(-10, this.hillsBaseY, gameWidth + 10, 64, 'hills').setOrigin(0).setZ(5).setDepth(4);

		this.renderer = new Renderer(this, 5);
		this.player = new Player(this, 0, gameHeight - 5, gameSettings.cameraHeight * gameSettings.cameraDepth + 300, 'playercar'); // player z helps with collision distances

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
	// private ------------------------------------
	private updateBg(offset: number): void {
		this.clouds1.tilePositionX += 0.05 + offset * this.clouds1.z;
		this.clouds2.tilePositionX += 0.1 + offset * this.clouds2.z;
		this.clouds3.tilePositionX += 0.125 + offset * this.clouds3.z;
		this.mountains.tilePositionX += offset * this.mountains.z;
		this.hills.tilePositionX += offset * this.hills.z;
		this.hills.setY(this.hillsBaseY - this.player.pitch * 20);
	}

	private handleInput(delta: number, playerSegment: TrackSegment) {
		const dlt = delta * 0.01;
		this.player.speed = Util.accelerate(this.player.speed, Util.interpolate(gameSettings.accel, 0, Util.percentRemaining(this.player.speed, gameSettings.maxSpeed) ), dlt);
		this.player.accelerating = true;

		if (this.cursors.up.isDown) {
			this.player.speed = Util.accelerate(this.player.speed, Util.interpolate(gameSettings.accel, 0, Util.percentRemaining(this.player.speed, gameSettings.maxSpeed) ), dlt);
			this.player.accelerating = true;
		} else if (this.cursors.down.isDown) {
			this.player.speed = Util.accelerate(this.player.speed, gameSettings.breaking, dlt);
		} else {
			this.player.accelerating = false;
			this.player.speed = Util.accelerate(this.player.speed, gameSettings.decel, dlt);
		}

		if (this.player.speed > 500 && this.player.screeching) {
			this.player.speed = Util.accelerate(this.player.speed, gameSettings.screechDecel, dlt);
		}
	}
}
