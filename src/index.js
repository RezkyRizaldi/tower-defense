import { c, canvas } from './assets/js/canvas.js';
import { Building, Enemy, PlacementTile, Sprite } from './assets/js/classes.js';
import { placementTilesData, waypoints } from './assets/js/constant.js';

const enemies = [];
const spawnEnemies = (spawnCount) => {
	for (let i = 1; i < spawnCount + 1; i++) {
		const xOffset = i * 150;

		enemies.push(
			new Enemy({
				position: { x: waypoints[0].x - xOffset, y: waypoints[0].y },
			})
		);
	}
};

const placementTilesData2D = [];
for (let i = 0; i < placementTilesData.length; i += 20) {
	placementTilesData2D.push(placementTilesData.slice(i, i + 20));
}

const placementTiles = [];
placementTilesData2D.forEach((row, y) => {
	row.forEach((symbol, x) => {
		if (symbol === 14) {
			placementTiles.push(
				new PlacementTile({
					position: {
						x: x * 64,
						y: y * 64,
					},
				})
			);
		}
	});
});

const image = new Image();
image.onload = () => {
	animate();
};
image.src = './assets/img/gameMap.png';

const buildings = [];
let activeTile = undefined;
let enemyCount = 3;
let heart = 10;
let coin = 100;
const explosions = [];
const gameOver = document.querySelector('#gameOver');
const heartEl = document.querySelector('#hearts');
const coinEl = document.querySelector('#coins');

spawnEnemies(enemyCount);

const animate = () => {
	const animationId = requestAnimationFrame(animate);

	c.drawImage(image, 0, 0);

	for (let i = enemies.length - 1; i >= 0; i--) {
		const enemy = enemies[i];
		enemy.update();

		if (enemy.position.x > canvas.width) {
			heart -= 1;
			enemies.splice(i, 1);
			heartEl.innerHTML = heart;

			if (heart === 0) {
				cancelAnimationFrame(animationId);

				gameOver.classList.remove('hidden');
				gameOver.classList.add('flex', 'items-center', 'justify-center');
			}
		}
	}

	for (let i = explosions.length - 1; i >= 0; i--) {
		const explosion = explosions[i];
		explosion.draw();
		explosion.update();

		if (explosion.frames.current >= explosion.frames.max - 1) {
			explosions.splice(i, 1);
		}
	}

	if (enemies.length === 0) {
		enemyCount += 2;
		spawnEnemies(enemyCount);
	}

	placementTiles.forEach((tile) => {
		tile.update(mouse);
	});

	buildings.forEach((building) => {
		building.update();
		building.target = null;

		const validEnemies = enemies.filter((enemy) => {
			const xDiff = enemy.center.x - building.center.x;
			const yDiff = enemy.center.y - building.center.y;
			const distance = Math.hypot(xDiff, yDiff);

			return distance < enemy.radius + building.radius;
		});

		building.target = validEnemies[0];

		for (let i = building.projectiles.length - 1; i >= 0; i--) {
			const projectile = building.projectiles[i];
			projectile.update();

			const xDiff = projectile.enemy.center.x - projectile.position.x;
			const yDiff = projectile.enemy.center.y - projectile.position.y;
			const distance = Math.hypot(xDiff, yDiff);

			if (distance < projectile.enemy.radius + projectile.radius) {
				projectile.enemy.health -= 20;

				if (projectile.enemy.health <= 0) {
					const enemyIndex = enemies.findIndex((enemy) => projectile.enemy === enemy);

					if (enemyIndex >= -1) {
						enemies.splice(enemyIndex, 1);
						coin += 15;
						coinEl.innerHTML = coin;
					}
				}

				explosions.push(
					new Sprite({
						position: {
							X: projectile.position.x,
							Y: projectile.position.y,
						},
						imageSrc: './assets/img/explosion.png',
						frames: {
							max: 4,
						},
						offset: {
							x: 0,
							y: 0,
						},
					})
				);
				building.projectiles.splice(i, 1);
			}
		}
	});
};

const mouse = {
	x: undefined,
	y: undefined,
};

canvas.addEventListener('click', () => {
	if (activeTile && !activeTile.isOccupied && coin - 50 >= 0) {
		coin -= 50;
		coinEl.innerHTML = coin;
		buildings.push(
			new Building({
				position: {
					x: activeTile.position.x,
					y: activeTile.position.y,
				},
			})
		);

		activeTile.isOccupied = true;
		buildings.sort((a, b) => a.position.y - b.position.y);
	}
});

addEventListener('mousemove', (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;

	activeTile = null;
	for (let i = 0; i < placementTiles.length; i++) {
		const tile = placementTiles[i];

		if (mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size && mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size) {
			activeTile = tile;
			break;
		}
	}
});
