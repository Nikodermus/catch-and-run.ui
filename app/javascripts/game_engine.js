/*!
    Project: Catch & Run X
    Date: 08/14/2017
    Author: Nicolas M. Pardo
*/




// REQUIRE MODULES
require('jQuery');
require('howler');
require('html2canvas');




// EMPTY GLOBAL VARIABLES
let container,
	soul_count,
	life_count,
	player_status,
	power_active,
	pause_game,
	reload_game,
	close_menu,
	pause_menu,
	menu_overlay,
	menu_container,
	power_up_text,
	main_menu,
	count_down,
	easy_level,
	normal_level,
	hardcore_level,
	game_over,
	restart_game,
	life_img,
	reload_window,
	monster,
	danger_level,
	power_up,
	canvas,
	imp,
	revenant,
	baron,
	knight,
	cyberdemon,
	cacodemon,
	mancubus,
	spider,
	boss,
	m_empty,
	monster2,
	time_out,
	yellow,
	red,
	green,
	blue,
	white,
	empty,
	life,
	then,
	ctx;

let keysDown = {};





// GLOBAL OBJECTS
let game = {
	playable: false,
	lifes: 3,
	x0: 0,
	y0: 0,
	catches: 0,
	score: 0,
	modifier: 1,
	power_up: "",
	development: true,
	pause_sound: new Howl({
		src: ['./assets/sounds/pause.mp3'],
		volume: 0.3,
		loop: true
	}),
	play_sound: new Howl({
		src: ['./assets/sounds/play.mp3'],
		volume: 0.3,
		loop: true
	}),
	menu_sound: new Howl({
		src: ['./assets/sounds/menu.mp3'],
		volume: 0.3,
		autoplay: true
	})

};

let projectile_rule = {
	name: "shoot",
	speed: 10 / game.modifier,
	damage: 10 / game.modifier,
	sound: new Howl({
		src: ['./assets/sounds/shoot.wav'],
		volume: 0.2
	})
}

let hero = {
	name: "marine",
	speed: 256,
	x: 0,
	y: 0,
	width: 38,
	height: 56,
	killable: true,
	weapon_size: 20,
	x_pos: false,
	x_neg: false,
	y_pos: false,
	y_neg: false,
	projectiles: [],

	image: new Image(),
	sound: new Howl({
		src: ['./assets/sounds/marine.wav']
	})
};




let catchable = {
	name: "lost_soul",
	x: 0,
	y: 0,
	width: 40,
	height: 40,
	speed: hero.speed * 0.3 * game.modifier,
	x_pos: false,
	x_neg: false,
	y_pos: false,
	y_neg: false,
	image: new Image(),
	sound: new Howl({
		src: ['./assets/sounds/lost_soul.wav']
	})
};

let PowerUp = {
	name: "",
	x: 0,
	y: 0,
	width: 37,
	height: 33,
	explanation: "",
	do: function () {},
	image: new Image(),
	sound: new Howl({
		src: ['./assets/sounds/power_up.wav']
	})
};




// FUNCTIONS

function devLog(object) {
	if (game.development) {
		console.log(object);
	}
}

function detectCollition(object_1, object_2) {
	if (
		object_1.x <= (object_2.x + object_2.width) &&
		object_2.x <= (object_1.x + object_1.width) &&
		object_1.y <= (object_2.y + object_2.height) &&
		object_2.y <= (object_1.y + object_1.height)
	) {
		return true;
	} else {
		return false;
	}
}

function ajaxStartGame() {
	devLog('ajax start game')
	let difficulty_game;
	switch (game.modifier) {
		case 0.7:
			difficulty_game = 'easy';
			break;
		case 1:
			difficulty_game = 'normal';
			break;
		case 1.3:
			difficulty_game = 'hard';
			break;
		default:
			difficulty_game = 'normal';
	}

	let user_game = document.querySelector("[data-user-id]").getAttribute("data-user-id");

	jQuery.ajax({
		type: "POST",
		datatype: "json",
		url: "/users/" + user_game + "/games",
		data: {
			"game": {
				"difficulty": difficulty_game
			}
		}
	});
}

function createCanvas() {
	devLog('create canvas');
	return html2canvas(document.body, {
		onrendered: function (canvas) {
			return canvas.toDataURL('image/png');
		}
	});

}

function ajaxEndGame() {
	devLog('ajax end game');
	let image_game = createCanvas();
	let score_game = Number(soul_count.innerText);
}
//Enemy prototype
function Monster(params) {
	if (!params) {
		params = {}
	}
	return {
		name: params.name,
		x: params.x,
		y: params.x,
		width: params.width,
		height: params.height,
		s_modifier: params.s_modifier,
		health: params.health,
		x_pos: params.x_pos,
		x_neg: params.x_neg,
		y_pos: params.y_pos,
		y_neg: params.y_neg,
		image: new Image()

	};
}


function loadGame(modifier) {

	//Resources for loader
	let drawables = [imp, revenant, baron, knight, cyberdemon, cacodemon, mancubus, spider, boss, hero, catchable];
	let images = [];
	let images_url = [];
	let images_ready = 0;
	time_out = 3;

	game.menu_sound.stop()
	game.modifier = modifier;

	for (let i of drawables) {
		images_url.push("./assets/images/" + i.name + ".png");
		for (let j = 1; j < 9; j++) {
			images_url.push("./assets/images/" + i.name + "_" + j + ".png");
		}
	}

	dataLoader(startGame, images, images_ready, images_url);
}

function dataLoader(callback, images, images_ready, images_url) {
	devLog('load game');
	for (let i in images_url) {
		let img = new Image();
		images.push(img);
		img.onload = function () {
			images_ready++;
			main_menu.style.top = -images_ready / images_url.length * 110 + "%";
			if (images_ready >= images_url.length) {
				callback();
			}
		};
		img.src = images_url[i];
	}
}

function startGame() {
	reset();
	main();
}

function gameOver(key) {
	if (key === 114) {
		newGame();
	};
	if (game.lifes > 0) {
		reset();
	} else {
		hero.sound.play();
		game_over.style.visibility = "visible";
		game.playable = false;
		game.pause_sound.play();

	}
}

function newGame() {
	devLog('new game')
	monster = m_empty;
	game.catches = 0;
	main_menu.style.visibility = 'visible';
	main_menu.style.top = 0;
	time_out = 3;
	game_over.style.visibility = 'hidden';
}

//Random for various purposes
function getRandom(min, max) {
	return Math.random() * (max - min) + min;
}

//Create the second monster as needed
function getMonster() {
	danger_level = getRandom(0, 30);
	if (danger_level < 7) {
		return monster !== imp ? imp : revenant;
	} else if (danger_level < 13) {
		return monster !== revenant ? revenant : baron;
	} else if (danger_level < 18) {
		return monster !== baron ? baron : knight;
	} else if (danger_level < 22) {
		return monster !== knight ? knight : cyberdemon;
	} else if (danger_level < 25) {
		return monster !== cyberdemon ? cyberdemon : cacodemon;
	} else if (danger_level < 27) {
		return monster !== cacodemon ? cacodemon : mancubus;
	} else if (danger_level < 30) {
		return monster !== mancubus ? mancubus : spider;
	} else {
		return monster !== spider ? spider : imp;
	}
}

// Reset the game when the player catches a monster
function reset() {
	devLog('reseted game');

	//Clear values that might have been changing through the level
	monster2 = m_empty;
	hero.killable = true;
	game.playable = false;
	game.pause_sound.play();
	power_active.src = "";
	power_up_text.innerText = "";
	pause_menu.style.visibility = 'hidden';
	game_over.style.visibility = 'hidden';
	time_out = 3;
	drawLives();

	//Chose monster based on life count
	if (game.catches < 4) {
		monster = imp;

	} else if (game.catches < 8) {
		monster = revenant;

	} else if (game.catches < 12) {
		monster = baron;

	} else if (game.catches < 15) {
		monster = knight;

	} else if (game.catches < 17) {
		monster = cyberdemon;

	} else if (game.catches < 21) {
		monster = cacodemon;

	} else if (game.catches < 26) {
		monster = mancubus;

	} else if (game.catches < 29) {
		monster = spider;

	} else {
		monster = boss;
	}

	//Add explanation texts
	white.explanation = "Indestructible";
	red.explanation = "New monster appeared";
	blue.explanation = "Hero speed increased";
	green.explanation = monster.name + " speed decreased";
	life.explanation = "Life added";
	yellow.explanation = monster.name + " speed increased";

	//PowerUp Effects
	yellow.do = function () {
		monster.speed *= 1.3;
	};

	red.do = function () {
		let random_monster = getMonster();
		random_monster.x = 0;
		random_monster.y = 0;
		random_monster.x_neg = false;
		random_monster.x_pos = false;
		random_monster.y_pos = false;
		random_monster.y_neg = false;
		monster2 = random_monster;
		red.explanation = "New monster appeared";
		return monster2;
	};

	white.do = function () {
		hero.killable = false;
	};

	blue.do = function () {
		hero.speed *= 1.2;
	};

	green.do = function () {
		monster.speed *= 0.8;
	};

	life.do = function () {
		game.lifes++;
		drawLives();
	};

	//Hero Functions

	hero.shoot = () => {
		hero.projectiles.push(Projectile({
			speed: projectile_rule.speed,
			x: hero.x + hero.width / 2,
			y: hero.y + hero.height / 2
		}));

		projectile_rule.sound.play();
	};


	//Chances of getting a Power Up
	let fun_level = getRandom(0, 20);

	if (fun_level < 6) {
		power_up = empty;
	} else if (fun_level < 10) {
		power_up = yellow;
	} else if (fun_level < 14) {
		power_up = red;
	} else if (fun_level < 17) {
		power_up = green;
	} else if (fun_level < 18) {
		power_up = blue;
	} else if (fun_level < 19) {
		power_up = white;
	} else if (fun_level < 20) {
		power_up = life;
	}

	//Hero will start in the middle of the canvas
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;


	// Throw the monster somewhere on the screen randomly
	monster.x = (monster.width / 2) + (Math.random() * (canvas.width - monster.width));
	monster.y = (monster.width / 2) + (Math.random() * (canvas.height - monster.width));

	//If the monster is too close, move it away
	if (
		monster.x > (canvas.width * 0.5 - canvas.width * game.safe_area) &&
		monster.x < (canvas.width * 0.5 + canvas.width * game.safe_area)
	) {
		monster.x -= canvas.width * game.safe_area;
	}

	if (
		monster.y > (canvas.height * 0.5 - canvas.height * game.safe_area) &&
		monster.y < (canvas.height * 0.5 + canvas.height * game.safe_area)
	) {
		monster.y -= canvas.height * game.safe_area;
	}

	// Throw the catchable somewhere on the screen randomly
	catchable.x = 32 + (Math.random() * (canvas.width - 64));
	catchable.y = 32 + (Math.random() * (canvas.height - 64));

	// Throw the powerup somewhere on the screen randomly
	if (fun_level > 6) {
		power_up.x = (power_up.width / 2) + (Math.random() * (canvas.width - power_up.width));
		power_up.y = (power_up.width / 2) + (Math.random() * (canvas.height - power_up.width));
	}

	game.playable = false;
	game.pause_sound.play();
	count_down.style.visibility = 'visible';
	count_down.style.opacity = 1;


	let x = 3;
	let interval = 700;

	for (let i = 0; i < x; i++) {
		setTimeout(function () {
			count_down.innerHTML = `<span>${time_out}</span>`;
			time_out--;
			count_down.style.opacity -= 0.25;
		}, i * interval);
	}
	setTimeout(function () {
		count_down.style.opacity = 0;
		count_down.style.visibility = 'hidden';
		game.playable = true;
		game.play_sound.play();
		time_out = 3;
	}, 2101);




}

setInterval(() => {
	if (game.playable) {
		hero.shoot();
	}
}, 500);

let mouse_x;
let mouse_y;

document.onmousemove = function (e) {
	mouse_x = e.pageX;
	mouse_y = e.pageY;
}

function mouseLocation() {

	let flag = {
		x_pos: false,
		y_pos: false,
		x_neg: false,
		y_neg: false
	};

	if (mouse_x > hero.x) {
		flag.x_pos = true;
		flag.x_neg = false;
	}
	if (mouse_y > hero.y) {
		flag.y_pos = true;
		flag.y_neg = false;
	}
	if (mouse_x < hero.x) {
		flag.x_neg = true;
		flag.x_pos = false;
	}
	if (mouse_y < hero.y) {
		flag.y_neg = true;
		flag.y_pos = false;
	}

	return flag;

}

function update(modifier) {
	if (game.playable) {
		//Move Bullets
		hero.projectiles.forEach(function (projectile) {
			projectile.update();
			if (detectCollition(projectile, monster)) {
				monster.health -= projectile_rule.damage;
				devLog(monster.health)
			}
			if (detectCollition(projectile, monster2)) {
				monster.health -= projectile_rule.damage;
				devLog(monster2.health)
			}
		});
		hero.projectiles = hero.projectiles.filter(function (projectile) {
			return projectile.active;
		});

		//Move monster
		if (hero.x > monster.x) {
			monster.x += monster.speed * modifier;
			monster.x_pos = true;
			monster.x_neg = false;
			if (monster.x > canvas.width - monster.width) {
				monster.x = canvas.width - monster.width;
				monster.x_pos = false;
			}
		}
		if (hero.x < monster.x) {
			monster.x -= monster.speed * modifier;
			monster.x_neg = true;
			monster.x_pos = false;
			if (monster.x < 0) {
				monster.x = 0;
				monster.x_neg = false;
			}
		}
		if (hero.y > monster.y) {
			monster.y += monster.speed * modifier;
			monster.y_pos = true;
			monster.y_neg = false;
			if (monster.y > canvas.height - monster.height) {
				monster.y = canvas.height - monster.height;
				monster.y_pos = false;
			}
		}
		if (hero.y < monster.y) {
			monster.y -= monster.speed * modifier;
			monster.y_neg = true;
			monster.y_pos = false;
			if (monster.y < 0) {
				monster.y = 0;
				monster.y_neg = false;
			}
		}
		if (monster.x === hero.x) {
			monster.x_pos = false;
			monster.x_neg = false;
		}
		if (monster.y === hero.y) {
			monster.y_pos = false;
			monster.y_neg = false;
		}

		//Move second monster
		if (hero.x > monster2.x) {
			monster2.x += monster2.speed * modifier;
			monster2.x_pos = true;
			monster2.x_neg = false;
			if (monster2.x > canvas.width - monster2.width) {
				monster2.x = canvas.width - monster2.width;
				monster2.x_pos = false;
			}
		}
		if (hero.x < monster2.x) {
			monster2.x -= monster2.speed * modifier;
			monster2.x_neg = true;
			monster2.x_pos = false;
			if (monster2.x < 0) {
				monster2.x = 0;
				monster2.x_neg = false;
			}
		}

		if (hero.y > monster2.y) {
			monster2.y += monster2.speed * modifier;
			monster2.y_pos = true;
			monster2.y_neg = false;
			if (monster2.y > canvas.height - monster2.height) {
				monster2.y = canvas.height - monster2.height;
				monster2.y_pos = false;
			}
		}
		if (hero.y < monster2.y) {
			monster2.y -= monster2.speed * modifier;
			monster2.y_neg = true;
			monster2.y_pos = false;
			if (monster2.y < 0) {
				monster2.y = 0;
				monster2.y_neg = false;
			}
		}
		if (monster2.x === hero.x) {
			monster2.x_pos = false;
			monster2.x_neg = false;
		}
		if (monster2.y === hero.y) {
			monster2.y_pos = false;
			monster2.y_neg = false;
		}


		//Move catchable
		if (hero.x < catchable.x) {
			catchable.x += catchable.speed * modifier;
			catchable.x_pos = true;
			catchable.x_neg = false;
			if (catchable.x > canvas.width - catchable.width) {
				catchable.x = canvas.width - catchable.width;
				catchable.x_pos = false;
			}
		}
		if (hero.x > catchable.x) {
			catchable.x -= catchable.speed * modifier;
			catchable.x_neg = true;
			catchable.x_pos = false;
			if (catchable.x < 0) {
				catchable.x = 0;
				catchable.x_neg = false;
			}

		}
		if (hero.y < catchable.y) {
			catchable.y += catchable.speed * modifier;
			catchable.y_pos = true;
			catchable.y_neg = false;
			if (catchable.y > canvas.height - catchable.height) {
				catchable.y = canvas.height - catchable.height;
				catchable.y_pos = false;
			}
		}
		if (hero.y > catchable.y) {
			catchable.y -= catchable.speed * modifier;
			catchable.y_neg = true;
			catchable.y_pos = false;

			if (catchable.y < 0) {
				catchable.y = 0;
				catchable.y_neg = false;
			}
		}
		if (catchable.x === hero.x) {
			catchable.x_pos = false;
			catchable.x_neg = false;
		}
		if (catchable.y === hero.y) {
			catchable.y_pos = false;
			catchable.y_neg = false;
		}



		let elems = [monster, monster2, catchable];
		elems.forEach(function (elem, i) {
			if (elem.y_pos && elem.x_pos) {
				elem.image.src = "./assets/images/" + elem.name + "_2.png";
			} else if (elem.x_pos && elem.y_neg) {
				elem.image.src = "./assets/images/" + elem.name + "_4.png";
			} else if (elem.x_neg && elem.y_neg) {
				elem.image.src = "./assets/images/" + elem.name + "_6.png";
			} else if (elem.x_neg && elem.y_pos) {
				elem.image.src = "./assets/images/" + elem.name + "_8.png";
			} else if (elem.y_pos && !elem.x_pos && !elem.x_neg) {
				elem.image.src = "./assets/images/" + elem.name + "_1.png";
			} else if (elem.x_pos && !elem.y_pos && !elem.y_neg && !elem.x_neg) {
				elem.image.src = "./assets/images/" + elem.name + "_3.png";
			} else if (elem.x_neg && !elem.y_pos && !elem.y_neg && !elem.x_pos) {
				elem.image.src = "./assets/images/" + elem.name + "_7.png";
			} else if (elem.y_neg && !elem.x_pos && !elem.x_neg && !elem.y_pos) {
				elem.image.src = "./assets/images/" + elem.name + "_5.png";
			} else if (!elem.y_pos && !elem.y_neg && !elem.x_pos && !elem.x_neg) {
				elem.image.src = "./assets/images/" + elem.name + ".png";
			}
		});


		//Move user


		if (38 in keysDown || 87 in keysDown) { // Player holding up
			hero.y -= hero.speed * modifier;
			hero.y_pos = true;
			if (hero.y < 0) {
				hero.y = 0;
			}
		}
		if (40 in keysDown || 83 in keysDown) { // Player holding down
			hero.y += hero.speed * modifier;
			hero.y_neg = true;
			if (hero.y > canvas.height - hero.height) {
				hero.y = canvas.height - hero.height;
			}
		}
		if (37 in keysDown || 65 in keysDown) { // Player holding left
			hero.x -= hero.speed * modifier;
			hero.x_neg = true;
			if (hero.x < 0) {
				hero.x = 0;
			}
		}
		if (39 in keysDown || 68 in keysDown) { // Player holding right
			hero.x += hero.speed * modifier;
			hero.x_pos = true;
			if (hero.x > canvas.width - hero.width) {
				hero.x = canvas.width - hero.width;
			}
		}

		//Bind sprite to hero movement
		if (hero.y_pos && hero.x_pos) {
			hero.image.src = "./assets/images/" + hero.name + "_2.png";
		} else if (hero.x_pos && hero.y_neg) {
			hero.image.src = "./assets/images/" + hero.name + "_4.png";
		} else if (hero.x_neg && hero.y_neg) {
			hero.image.src = "./assets/images/" + hero.name + "_6.png";
		} else if (hero.x_neg && hero.y_pos) {
			hero.image.src = "./assets/images/" + hero.name + "_8.png";
		} else if (hero.y_pos && !hero.x_pos && !hero.x_neg) {
			hero.image.src = "./assets/images/" + hero.name + "_1.png";
		} else if (hero.x_pos && !hero.y_pos && !hero.y_neg && !hero.x_neg) {
			hero.image.src = "./assets/images/" + hero.name + "_3.png";
		} else if (hero.x_neg && !hero.y_pos && !hero.y_neg && !hero.x_pos) {
			hero.image.src = "./assets/images/" + hero.name + "_7.png";
		} else if (hero.y_neg && !hero.x_pos && !hero.x_neg && !hero.y_pos) {
			hero.image.src = "./assets/images/" + hero.name + "_5.png";
		} else if (!hero.y_pos && !hero.y_neg && !hero.x_pos && !hero.x_neg) {
			hero.image.src = "./assets/images/" + hero.name + ".png";
		}

		// If the hero touches the catchable
		if (
			detectCollition(hero, catchable)
		) {
			game.catches++;
			if (monster2 != m_empty) {
				game.score += 100 * game.modifier;
			}
			game.score += 100 * game.modifier;
			catchable.sound.play();
			hero.killable = true;
			reset();

		}

		// If the hero touches the monster            
		if (
			detectCollition(hero, monster)
		) {
			if (hero.killable) {
				monster.sound.play();
				game.lifes--;
				if (game.lifes >= 3) {
					player_status.src = `./assets/images/3_lifes.gif`;
				} else if (game.lifes > 0) {
					player_status.src = `./assets/images/${game.lifes}_lifes.gif`;
				}
				gameOver();
			} else {
				monster = m_empty;
			}
		}

		// If the hero touches the second monster
		if (
			detectCollition(hero, monster2)
		) {
			monster2.sound.play();
			game.lifes--;
			if (game.lifes < 1) {
				gameOver();
			} else {
				reset();
			}
			player_status.src = `./assets/images/${game.lifes}_lifes.gif`;
		}


		//Allow user to catch the PowerUp
		if (
			detectCollition(hero, power_up)
		) {
			if (power_active.name === 'white' ||
				power_active.name === 'blue') {
				power_active.src = "./assets/images/" + power_up.name + ".png";
			}
			catchable.sound.play();
			power_up_text.className = power_up.name;
			power_up_text.innerText = power_up.explanation;
			power_up.do();
			ctx.clearRect(power_up.x, power_up.y, power_up.width, power_up.height);
			power_up = empty;
		}



	}
}

//Check how many lives 
function drawLives() {
	life_count.innerHTML = "";
	if (game.lifes > 5) game.lifes = 5;
	for (let i = 0; i < game.lifes; i++) {
		let clone_img = life_img.cloneNode();
		life_count.appendChild(clone_img);
	}
}

// Draw everything
function render() {

	//Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//Place the souls count
	soul_count.innerText = game.score < 10 ? '0' + game.score : game.score;


	// Hero rectangle
	if (game.development) {
		ctx.beginPath();
		ctx.lineWidth = "3";
		ctx.strokeStyle = "blue";
		ctx.rect(hero.x, hero.y, hero.width, hero.height);
		ctx.stroke();

		//Catchable Rectangle
		ctx.beginPath();
		ctx.lineWidth = "3";
		ctx.strokeStyle = "green";
		ctx.rect(catchable.x, catchable.y, catchable.width, catchable.height);
		ctx.stroke();

		//Monster Rectangle
		ctx.beginPath();
		ctx.lineWidth = "3";
		ctx.strokeStyle = "red";
		ctx.rect(monster.x, monster.y, monster.width, monster.height);
		ctx.stroke();
	}

	//Draw hero and catchable
	ctx.drawImage(hero.image, hero.x, hero.y);
	ctx.drawImage(catchable.image, catchable.x, catchable.y);
	ctx.drawImage(monster.image, monster.x, monster.y);

	hero.projectiles.forEach(function (projectile) {
		projectile.draw();
	});

	//Draw Power Up
	power_up.image.src = "./assets/images/" + power_up.name + ".png";
	ctx.drawImage(power_up.image, power_up.x, power_up.y);

	//Draw second monster
	if (monster2 !== m_empty) {
		ctx.drawImage(monster2.image, monster2.x, monster2.y);

		//Monster Rectangle
		ctx.beginPath();
		ctx.lineWidth = "3";
		ctx.strokeStyle = "red";
		ctx.rect(monster2.x, monster2.y, monster2.width, monster2.height);
		ctx.stroke();
	}

}

//Call initial functions
function main() {
	let now = Date.now();
	let delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
}

function closeMenu() {
	pause_menu.style.visibility = 'hidden';
	game.playable = true;
	game.play_sound.play();
}

function openMenu() {
	pause_menu.style.visibility = 'visible';
	game.playable = false;
	game.pause_sound.play();
}


function Projectile(new_i) {
	let I = Object.create(new_i);
	I.active = true;

	I.velocity = projectile_rule.speed;
	I.width = 3;
	I.height = 3;
	I.color = "#66BF38";
	I.flag = mouseLocation();

	I.insideCanvas = function () {
		if (
			I.x >= 0 &&
			I.x <= canvas.width &&
			I.y >= 0 &&
			I.y <= canvas.height) {
			return true;
		} else {
			return false;
		}
	};

	I.draw = function () {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);

	};

	I.update = function () {
		if (this.flag.y_pos && this.flag.x_pos) {
			I.x += I.velocity;
			I.y += I.velocity;
		} else if (this.flag.x_pos && this.flag.y_neg) {
			I.x += I.velocity;
			I.y -= I.velocity;
		} else if (this.flag.x_neg && this.flag.y_neg) {
			I.x -= I.velocity;
			I.y -= I.velocity;
		} else if (this.flag.x_neg && this.flag.y_pos) {
			I.x -= I.velocity;
			I.y += I.velocity;
		} else if (this.flag.y_pos && !this.flag.x_pos && !this.flag.x_neg) {
			I.x += I.velocity;
			I.y -= I.velocity;
		} else if (this.flag.x_pos && !this.flag.y_pos && !this.flag.y_neg && !this.flag.x_neg) {
			I.y += I.velocity;
		} else if (this.flag.x_neg && !this.flag.y_pos && !this.flag.y_neg && !this.flag.x_pos) {
			I.x += I.velocity;
		} else if (this.flag.y_neg && !this.flag.x_pos && !this.flag.x_neg && !this.flag.y_pos) {
			I.y -= I.velocity;
		} else {
			I.x -= I.velocity;
		}



		//TODO UNCOMMENT I.active = I.active && I.insideCanvas();
	};
	return I;

}

// RESIZE CANVAS
window.onresize = function () {
	canvas.width = container.clientWidth - 128;
	canvas.height = container.clientHeight - 128;
};


// FUNCTION FOR LOADED PAGE
window.onload = function () {
	//Create monsters
	imp = Monster({
		name: "imp",
		width: 41,
		height: 57,
		s_modifier: 0.3,
		health: 300,
		// speed: hero.speed * imp.s_modifier * game.modifier,
		sound: new Howl({
			src: ['./assets/sounds/imp.wav']
		})
	});
	imp.image.src = "./assets/images/imp.png";

	revenant = Monster({});
	baron = Monster({});
	knight = Monster({});
	cyberdemon = Monster({});
	cacodemon = Monster({});
	mancubus = Monster({});
	spider = Monster({});
	boss = Monster({});
	m_empty = Monster({});
	monster2 = m_empty;

	// Create powerups
	yellow = Object.create(PowerUp);
	red = Object.create(PowerUp);
	green = Object.create(PowerUp);
	blue = Object.create(PowerUp);
	white = Object.create(PowerUp);
	empty = Object.create(PowerUp);
	life = Object.create(PowerUp);



	game.menu_sound.play();

	//Get Elements
	container = document.getElementById('CanvasContainer');
	soul_count = document.getElementById('SoulsCount');
	life_count = document.getElementById('LifeCount');
	player_status = document.getElementById('PlayerStatus');
	power_active = document.getElementById('PowerActive');
	pause_game = document.getElementById('PauseGame');
	reload_game = document.getElementById('ReloadGame');
	close_menu = document.getElementById('CloseMenu');
	pause_menu = document.getElementById('PauseMenu');
	menu_overlay = document.querySelector('.menu_overlay');
	menu_container = document.querySelector('.menu_container');
	power_up_text = document.getElementById('PowerUpText');
	main_menu = document.getElementById('MainMenu');
	count_down = document.getElementById('CountDown');
	easy_level = document.getElementById('EasyLevel');
	normal_level = document.getElementById('NormalLevel');
	hardcore_level = document.getElementById('HardcoreLevel');
	game_over = document.getElementById('GameOver');
	restart_game = document.getElementById('RestartGame');
	reload_window = document.getElementById('ReloadWindow');


	//Create image
	life_img = document.createElement('img');

	//Basic state of elements
	life_img.src = './assets/images/life.png';
	pause_menu.style.visibility = 'hidden';
	count_down.style.visibility = 'hidden';
	game_over.style.visibility = 'hidden';

	//Generate canvas
	canvas = document.createElement('canvas');
	ctx = canvas.getContext('2d');

	//Set canvas size as window size
	canvas.width = container.clientWidth - 128;
	canvas.height = container.clientHeight - 128;
	container.appendChild(canvas);

	game.safe_area = 0.2 / game.modifier;



	// Hero image
	hero.image.src = "./assets/images/" + hero.name + ".png";
	catchable.image.src = "./assets/images/lost_soul.png";


	//Add data to each monster


	revenant.name = "revenant";
	revenant.width = 49;
	revenant.height = 71;
	revenant.s_modifier = 0.35;
	revenant.h_modifier = 0.65;
	revenant.speed = hero.speed * revenant.s_modifier * game.modifier;
	revenant.image.src = "./assets/images/revenant.png";
	revenant.sound = new Howl({
		src: ['./assets/sounds/revenant.wav']
	});

	baron.name = "baron";
	baron.width = 49;
	baron.height = 74;
	baron.s_modifier = 0.4;
	baron.h_modifier = 0.8;
	baron.speed = hero.speed * baron.s_modifier * game.modifier;
	baron.image.src = "./assets/images/baron.png";
	baron.sound = new Howl({
		src: ['./assets/sounds/baron.wav']
	});

	knight.name = "knight";
	knight.width = 52;
	knight.height = 74;
	knight.s_modifier = 0.45;
	knight.h_modifier = 0.85;
	knight.speed = hero.speed * knight.s_modifier * game.modifier;
	knight.image.src = "./assets/images/knight.png";
	knight.sound = new Howl({
		src: ['./assets/sounds/knight.wav']
	});

	cyberdemon.name = "cyberdemon";
	cyberdemon.width = 85;
	cyberdemon.height = 109;
	cyberdemon.s_modifier = 0.55;
	cyberdemon.h_modifier = 0.9;
	cyberdemon.speed = hero.speed * knight.s_modifier * game.modifier;
	cyberdemon.image.src = "./assets/images/cyberdemon.png";
	cyberdemon.sound = new Howl({
		src: ['./assets/sounds/cyberdemon.wav']
	});

	cacodemon.name = "cacodemon";
	cacodemon.width = 63;
	cacodemon.height = 65;
	cacodemon.s_modifier = 0.65;
	cacodemon.h_modifier = 0.7;
	cacodemon.speed = hero.speed * cacodemon.s_modifier * game.modifier;
	cacodemon.image.src = "./assets/images/cacodemon.png";
	cacodemon.sound = new Howl({
		src: ['./assets/sounds/cacodemon.wav']
	});

	mancubus.name = "mancubus";
	mancubus.width = 164;
	mancubus.height = 140;
	mancubus.s_modifier = 0.6;
	mancubus.h_modifier = 1.4;
	mancubus.speed = hero.speed * mancubus.s_modifier * game.modifier;
	mancubus.image.src = "./assets/images/mancubus.png";
	mancubus.sound = new Howl({
		src: ['./assets/sounds/mancubus.wav']
	});

	spider.name = "spider";
	spider.width = 194;
	spider.height = 106;
	spider.s_modifier = 0.7;
	spider.h_modifier = 1.3;
	spider.speed = hero.speed * spider.s_modifier * game.modifier;
	spider.image.src = "./assets/images/spider.png";
	spider.sound = new Howl({
		src: ['./assets/sounds/spider.wav']
	});

	boss.name = "final_boss";
	boss.width = canvas.width * 0.7;
	boss.height = boss.width * 0.415549598;
	boss.s_modifier = 0.5;
	boss.h_modifier = 3;
	boss.speed = hero.speed * boss.s_modifier * game.modifier;
	boss.image.src = "./assets/images/final_boss.png";
	boss.sound = new Howl({
		src: ['./assets/sounds/final_boss.wav']
	});

	m_empty.name = "empty";
	m_empty.health = 0;





	//PowerUp Names
	yellow.name = "yellow";
	white.name = "white";
	red.name = "red";
	blue.name = "blue";
	green.name = "green";
	life.name = "life";
	empty.name = "empty";



	// Handle keyboard controls

	addEventListener("keydown", function (e) {
		keysDown[e.keyCode] = true;
	}, false);

	addEventListener("keyup", function (e) {
		delete keysDown[e.keyCode];
		//Reset X-
		if (e.keyCode === 37) {
			hero.x_neg = false;
		}

		//Reset X+
		if (e.keyCode === 39) {
			hero.x_pos = false;
		}

		//Reset Y-
		if (e.keyCode === 40) {
			hero.y_neg = false;
		}

		//Reset Y+
		if (e.keyCode === 38) {
			hero.y_pos = false;
		}

	}, false);

	easy_level.addEventListener('click', function () {
		loadGame(0.7);
	});
	normal_level.addEventListener('click', function () {
		loadGame(1);
	});
	hardcore_level.addEventListener('click', function () {
		loadGame(1.3);
	});

	game.play_sound.on('play', function () {
		game.pause_sound.pause();
	});

	game.pause_sound.on('play', function () {
		game.play_sound.pause();
	});


	// Cross-browser support for requestAnimationFrame
	let w = window;
	requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;



	//Close menu
	menu_container.addEventListener('click', function (e) {
		e.stopPropagation();
	}, false);
	close_menu.addEventListener('click', closeMenu, false);
	menu_overlay.addEventListener('click', closeMenu, false);

	//Show Menu
	pause_game.addEventListener('click', openMenu, false);
	document.addEventListener('blur', openMenu, false);

	//Restart Game
	restart_game.addEventListener('click', function () {
		game.lifes = 3;
		game.catches = 0;
		reset();
	}, false);
	reload_game.addEventListener('click', function () {
		newGame();
	}, false);
	reload_window.addEventListener('click', function () {
		newGame();
	}, false);

	//Shortcuts
	document.addEventListener('keypress', function (e) {
		let key = e.which || e.keyCode;
		if (key === 112) {
			if (pause_menu.style.visibility !== 'visible') {
				openMenu();
			} else {
				closeMenu();
			}
		} else if (key === 114) {
			gameOver(key);
		}
	}, false);

	//Reload if need
	pause_game.addEventListener('click', openMenu, false);

	//Clear explanation text
	power_up_text.innerText = "";
	then = Date.now();

	devLog('game fully laoded');

};