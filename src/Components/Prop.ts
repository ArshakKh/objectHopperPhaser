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

	constructor(scene: GameScene, name: string, offset: number, height: number, scale: number = 3000, flipX: boolean = false, collides: boolean = false, isGroup: boolean) {
		this.scene = scene;

		this.height = height;
		this.collides = collides;
		this.isGroup = isGroup;
		this.scale = scale;
		this.offset = offset;
		this.container = scene.add.container(10, 0);

		// this.group = this.scene.add.group();

		if (this.isGroup) {
			// this.sprite = scene.add.sprite(-999, -999, name).setVisible(false);
			this.sprite = scene.add.sprite(0, 0, name).setOrigin(0.5, 1).setVisible(true);
			this.text = scene.add.text(0, 0, '12', {font: '16px Arial', color: '#ffffff'});
			this.sprite.addToUpdateList();
			this.container.add([this.sprite, this.text]).setSize(this.sprite.width, this.sprite.height);
			// console.log(this.container.height);
		} else {
			this.sprite = scene.add.sprite(-999, -999, name).setOrigin(0.5, 1).setVisible(false);
		}

		this.sprite.flipX = flipX;
	}

	public update(x: number = 0, y: number = 0, scale: number = 1, segmentClip: number = 0) {

		if (this.container.height > 0) {
			this.container.setPosition(x, y + this.height).setDepth(13 + scale);
			this.text.setFontSize(this.sprite.height / 100);
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
