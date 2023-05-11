import { TrackSegment } from './TrackSegment';
import { gameSettings } from '../config/GameSettings';
import { Util } from './Util';
import { SEGMENT } from './SegmentType';
import { Prop } from './Prop';
import { GameScene } from '../scenes/GameScene';

export class Road {
	public scene: GameScene;
	public segments: TrackSegment[];
	public trackLength: number;

	constructor(scene: GameScene) {
		this.scene = scene;
		this.segments = [];
		this.trackLength = 0;
	}

	public addRoadSegment(curve: number, y: number): void {
		this.segments.push(new TrackSegment(this.segments.length, curve, y, this.getLastSegmentYPos()));
	}

	public addStraight(num: number = SEGMENT.LENGTH.MEDIUM): void {
		this.addRoad(num, num, num, 0, 0);
	}

	public addCurve(num: number = SEGMENT.LENGTH.MEDIUM, curve: number = SEGMENT.CURVE.MEDIUM, height: number = SEGMENT.HILL.NONE): void {
		this.addRoad(num, num, num, curve, height);
	}

	public addHill(num: number = SEGMENT.LENGTH.MEDIUM, height: number = SEGMENT.HILL.NONE): void {
		this.addRoad(num, num, num, 0, height);
	}

	public addRoad(enter: number, hold: number, leave: number, curve: number, y: number): void {
		const startY = this.getLastSegmentYPos();
		const endY = startY + Util.toInt(y, 0) * gameSettings.segmentLength;
		const totalLength = enter + hold + leave;

		for (let n = 0; n < enter; n++) {
			this.addRoadSegment(Util.easeIn(0, curve, n / enter), Util.easeInOut(startY, endY, n / totalLength));
		}

		for (let n = 0; n < hold; n++) {
			this.addRoadSegment(curve, Util.easeInOut(startY, endY, (enter + n) / totalLength));
		}
		for (let n = 0; n < leave; n++) {
			this.addRoadSegment(Util.easeInOut(curve, 0, n / leave), Util.easeInOut(startY, endY, (enter + hold + n) / totalLength));
		}
	}

	public getLastSegmentYPos(): number {
		const lastSegment = this.getLastSegment();
		return lastSegment ? lastSegment.p2.world.y : 0;
	}

	public getLastSegment(): TrackSegment {
		return this.segments.length > 0 ? this.segments[this.segments.length - 1] : null;
	}

	public findSegmentByZ(z: number): TrackSegment {
		const index = Math.floor(z / gameSettings.segmentLength) % this.segments.length;
		return this.segments[index];
	}

	public resetRoad(): void {
		this.segments = [];

		this.addStraight(SEGMENT.LENGTH.MEDIUM);
		// this.addCurve(SEGMENT.LENGTH.MEDIUM, SEGMENT.CURVE.MEDIUM, SEGMENT.HILL.LOW);
		this.addHill(SEGMENT.LENGTH.SHORT, -SEGMENT.HILL.LOW);
		this.addHill(SEGMENT.LENGTH.SHORT, SEGMENT.HILL.LOW);
		this.addHill(SEGMENT.LENGTH.SHORT, -SEGMENT.HILL.LOW);
		// this.addCurve(SEGMENT.LENGTH.LONG, SEGMENT.CURVE.MEDIUM, SEGMENT.HILL.MEDIUM);
		this.addHill(SEGMENT.LENGTH.SHORT, -SEGMENT.HILL.LOW);
		// this.addCurve(SEGMENT.LENGTH.LONG, SEGMENT.CURVE.MEDIUM, -SEGMENT.HILL.MEDIUM);
		// this.addCurve(SEGMENT.LENGTH.LONG, -SEGMENT.CURVE.MINIMAL, SEGMENT.HILL.HIGH);
		this.addStraight(SEGMENT.LENGTH.SHORT);
		// this.addCurve(SEGMENT.LENGTH.VERYLONG, SEGMENT.CURVE.MINIMAL);
		this.addHill(SEGMENT.LENGTH.SHORT, -SEGMENT.HILL.MEDIUM);
		this.addStraight(SEGMENT.LENGTH.SHORT);
		this.addHill(SEGMENT.LENGTH.MEDIUM, SEGMENT.HILL.HIGH);
		// this.addCurve(SEGMENT.LENGTH.SHORT, SEGMENT.CURVE.MEDIUM, SEGMENT.HILL.LOW);
		this.addHill(SEGMENT.LENGTH.LONG, -SEGMENT.HILL.HIGH);
		// this.addCurve(SEGMENT.LENGTH.LONG, -SEGMENT.CURVE.MEDIUM);
		this.addStraight();
		// this.addCurve(SEGMENT.LENGTH.LONG, SEGMENT.CURVE.MEDIUM);
		this.addStraight();
		// this.addCurve(SEGMENT.LENGTH.LONG, -SEGMENT.CURVE.EASY);
		this.addHill(SEGMENT.LENGTH.LONG, -SEGMENT.HILL.MEDIUM);
		// this.addCurve(SEGMENT.LENGTH.LONG, SEGMENT.CURVE.MEDIUM, -SEGMENT.HILL.LOW);

		this.addRoad(200, 200, 200, SEGMENT.CURVE.NONE, Math.round(-this.getLastSegmentYPos() / gameSettings.segmentLength));

		this.trackLength = this.segments.length * gameSettings.segmentLength;

		this.createRandomProps();
	}

	public addProp(scene: GameScene, segmentIndex: number, name: string, offset: number, height: number = 0, scale: number = 3000, flipX: boolean = false, collides: boolean = false): boolean {
		try {
			const seg = this.segments[segmentIndex];
			const prop = new Prop(scene, name, offset, height, scale, flipX, collides);
			seg.props.add(prop);

			return true;
		} catch (e) {
			return false;
		}
	}

	public hideAllProps(): void {
		this.segments.forEach( (segment: TrackSegment) => {
			for (const prop of segment.props) {
				prop.sprite.setVisible(false);
			}
		});
	}

	// add some road side props
	// offsets <-1 & >1 are outside of the road
	public createRandomProps(): void {
		for (let n = 0; n < this.segments.length; n += Phaser.Math.Between(1, 5)) {
			const offset = Phaser.Math.FloatBetween(1.75, 10);
			const negated = Math.random() - 0.5 > 0;

			let type;
			let scale = 30000;
			switch (Phaser.Math.Between(1, 5)) {
				case 1:
					type = 'boulder1';
					scale = 5000;
					break;
				case 2:
					type = 'boulder2';
					scale = 5000;
					break;
				case 3:
					type = 'tree3';
					scale = 4500;
					break;
				case 4:
					type = 'tree2';
					scale = 4000;
					break;
				case 5:
					type = 'tree3';
					scale = 4000;
					break;
			}

			this.addProp(this.scene, n, type, negated ? -offset : offset, 0, scale, false);
		}

		for (let n = 0; n < this.segments.length; n ++) {
			const offset = Phaser.Math.FloatBetween(1, 1.1);
			const negated = Math.random() - 0.5 > 0;

			let type;
			let scale = 30000;
			type = 'boulder1';
			scale = 3000;

			this.addProp(this.scene, n, type, negated ? -offset : offset, 0, scale, false);
		}
	}
	public removeProps(sourceSegment: TrackSegment, breadth: number, side: number) {
		const isLeft = side < 0;
		const breadthSegments = this.segments.slice(sourceSegment.index - breadth, sourceSegment.index + breadth);

		for (const segment of breadthSegments) {
			if (segment.props.size) {
				for (const prop of segment.props) {
					if ((prop.offset < 0 && isLeft) || (prop.offset > 0 && !isLeft)) {
						segment.props.delete(prop);
					}
				}
			}
		}
	}
}
