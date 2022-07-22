import { c } from './canvas.js';
import { waypoints } from './constant.js';

export class Sprite {
	constructor({ position = { x: 0, y: 0 }, imageSrc, frames = { max: 1 }, offset = { x: 0, y: 0 } }) {
		this.position = position;
		this.image = new Image();
		this.image.src = imageSrc;
		this.frames = {
			max: frames.max,
			current: 0,
			elapsed: 0,
			hold: 3,
		};
		this.offset = offset;
	}

	draw() {
		const cropWidth = this.image.width / this.frames.max;
		const crop = {
			position: {
				x: cropWidth * this.frames.current,
				y: 0,
			},
			width: cropWidth,
			height: this.image.height,
		};

		c.drawImage(this.image, crop.position.x, crop.position.y, crop.width, crop.height, this.position.x + this.offset.x, this.position.y + this.offset.y, crop.width, crop.height);
	}

	update() {
		this.frames.elapsed++;
		if (this.frames.elapsed % this.frames.hold === 0) {
			this.frames.current++;
			if (this.frames.current >= this.frames.max) {
				this.frames.current = 0;
			}
		}
	}
}

export class PlacementTile {
	constructor({ position = { x: 0, y: 0 } }) {
		this.position = position;
		this.size = 64;
		this.color = 'rgba(255, 255, 255, 0.15)';
		this.occupied = false;
	}

	draw() {
		c.fillStyle = this.color;
		c.fillRect(this.position.x, this.position.y, this.size, this.size);
	}

	update(mouse) {
		this.draw();

		if (mouse.x > this.position.x && mouse.x < this.position.x + this.size && mouse.y > this.position.y && mouse.y < this.position.y + this.size) {
			this.color = 'rgb(255, 255, 255)';
		} else {
			this.color = 'rgba(255, 255, 255, 0.15)';
		}
	}
}

export class Enemy extends Sprite {
	constructor({ position = { x: 0, y: 0 } }) {
		super({ position, imageSrc: './assets/img/orc.png', frames: { max: 7 } });
		this.width = 100;
		this.height = 100;
		this.waypointIndex = 0;
		this.center = {
			x: this.position.x + this.width / 2,
			y: this.position.y + this.height / 2,
		};
		this.radius = 50;
		this.health = 100;
		this.velocity = {
			x: 0,
			y: 0,
		};
	}

	draw() {
		super.draw();

		// Health bar
		c.fillStyle = 'rgb(239, 68 ,68)';
		c.fillRect(this.position.x, this.position.y - 15, this.width, 10);
		c.fillStyle = 'rgb(34, 197, 94)';
		c.fillRect(this.position.x, this.position.y - 15, (this.width * this.health) / 100, 10);
	}

	update() {
		this.draw();
		super.update();

		const waypoint = waypoints[this.waypointIndex];
		const yDistance = waypoint.y - this.center.y;
		const xDistance = waypoint.x - this.center.x;
		const angle = Math.atan2(yDistance, xDistance);
		const speed = 3;

		this.velocity.x = Math.cos(angle) * speed;
		this.velocity.y = Math.sin(angle) * speed;
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.center = {
			x: this.position.x + this.width / 2,
			y: this.position.y + this.height / 2,
		};

		if (Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) < Math.abs(this.velocity.x) && Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) < Math.abs(this.velocity.y) && this.waypointIndex < waypoints.length - 1) {
			this.waypointIndex++;
		}
	}
}

export class Projectile extends Sprite {
	constructor({ position = { x: 0, y: 0 }, enemy }) {
		super({ position, imageSrc: './assets/img/projectile.png' });
		this.velocity = {
			x: 0,
			y: 0,
		};
		this.enemy = enemy;
		this.radius = 10;
	}

	update() {
		this.draw();

		const angle = Math.atan2(this.enemy.center.y - this.position.y, this.enemy.center.x - this.position.x);

		const power = 5;
		this.velocity.x = Math.cos(angle) * power;
		this.velocity.y = Math.sin(angle) * power;
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

export class Building extends Sprite {
	constructor({ position = { x: 0, y: 0 } }) {
		super({ position, imageSrc: './assets/img/tower.png', frames: { max: 19 }, offset: { x: 0, y: -80 } });
		this.width = 64 * 2;
		this.height = 64;
		this.center = {
			x: this.position.x + this.width / 2,
			y: this.position.y + this.height / 2,
		};
		this.projectiles = [];
		this.radius = 250;
		this.target;
	}

	draw() {
		super.draw();

		// Tower Range
		// c.beginPath();
		// c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
		// c.fillStyle = 'rgba(59, 130, 246, 0.2)';
		// c.fill();
	}

	update() {
		this.draw();

		if (this.target || (!this.target && this.frames.current !== 0)) {
			super.update();
		}

		if (this.target && this.frames.current === 6 && this.frames.elapsed % this.frames.hold === 0) {
			this.shoot();
		}
	}

	shoot() {
		this.projectiles.push(
			new Projectile({
				position: {
					x: this.center.x - 20,
					y: this.center.y - 110,
				},
				enemy: this.target,
			})
		);
	}
}
