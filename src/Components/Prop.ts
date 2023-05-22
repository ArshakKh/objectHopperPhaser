import {GameScene} from '../scenes/GameScene';

export class Prop {
	public scene: GameScene;
	public sprite: Phaser.GameObjects.Sprite;
	public group: Phaser.GameObjects.Group;
	public isGroup: boolean;
	public offset: number;
	public height: number;
	public collides: boolean;
	public scale: number = 1; // scale calculation in game is _really_ small
	public container: Phaser.GameObjects.Container;
	public text: Phaser.GameObjects.Text;
	public overImage: Phaser.GameObjects.Image;

	public propX: number = 0;
	public propY: number = 0;

	constructor(scene: GameScene, name: string, offset: number, height: number, scale: number = 3000, flipX: boolean = false, collides: boolean = false, isGroup: boolean, title: string = 'undef') {
		this.scene = scene;

		this.height = height;
		this.collides = collides;
		this.isGroup = isGroup;
		this.scale = scale;
		this.offset = offset;
		this.container = scene.add.container(-999, -999);

		if (this.isGroup) {
			const key = 'texture' + Math.random() * 1600000;
			this.sprite = scene.add.sprite(0, 0, name).setVisible(false)
				.setInteractive()
				.on('pointerup', () => this.scene.checkHandle(title, this.propX, this.propY));
			// this.sprite.width = this.scene.camera.width / 4;
			// this.sprite.height = this.scene.camera.width / 4;
			this.text = scene.add.text(0, 0, title, {
				fontFamily: 'Aine',
				fontSize: '38px',
				color: '#FF0B69',
				stroke: '#ffffff',
				strokeThickness: 4,
			}).setVisible(false);
			const renderTexture = scene.add.renderTexture(0, 0, this.text.width, this.text.height).setVisible(false);

			renderTexture.draw(this.text);
			renderTexture.saveTexture(key);

			this.overImage = scene.add.image(0, 0, key).setOrigin(0.5, 0.5).setVisible(false);

			this.sprite.addToUpdateList();
			this.container.add([this.sprite, this.overImage]).setSize(this.sprite.width, this.sprite.height);
		} else {
			this.sprite = scene.add.sprite(-999, -999, name).setOrigin(0.5, 1).setVisible(false);
		}

		this.sprite.flipX = flipX;
	}

	public update(x: number = 0, y: number = 0, scale: number = 1, segmentClip: number = 0) {

		if (this.container.height > 0) {
			this.propX = x;
			this.propY = y;
			this.container.setPosition(x, y + this.height).setDepth(13 + scale);
			this.overImage.setScale(this.scale * scale).setVisible(true);
		} else {
			this.sprite.setPosition(x, y + this.height);
			this.sprite.setDepth(10 + scale); // draw order
		}
		this.sprite.setScale(this.scale * scale);

		if (!this.sprite.visible) {
			this.sprite.setVisible(true);
		}

		// calculate clipping behind hills
		if (y > segmentClip) {
			const clipped = (y - segmentClip) / this.sprite.scaleY;
			const cropY = this.sprite.height - clipped;
			this.sprite.setCrop(0, 0, this.sprite.width, cropY);
		} else {
			this.sprite.setCrop();
		}
	}

	public destroy(): void {
		this.sprite.destroy();
		this.scene = undefined;
	}
}
