const Discord = require('discord.js');
const client = new Discord.Client();
const firebase = require("firebase/app");

require("firebase/database");

const pointsByUser = {};
let database;

client.on('ready', () => {
	const config = {
		apiKey: `${process.env.API_KEY}`,
		authDomain: `${process.env.PROJECT_ID}.firebaseapp.com`,
		databaseURL: `https://${process.env.DATABASE_ID}.firebaseio.com`,
		storageBucket: `${process.env.PROJECT_ID}.appspot.com`
	};

	firebase.initializeApp(config);
	database = firebase.database();

	// try to read from DB
	readUserData();

	setInterval(addPoint, 10000);
	setInterval(saveToDatabase, 10000);

	console.log('I am ready!');
});

client.on('message', message => {
	// check for prefix, otherwise skip processing this message
	if (message.content.indexOf('!') !== 0) {
		return;
	}

	// init points for user
	if (pointsByUser[message.author.username] === undefined) {
		pointsByUser[message.author.username] = 10000;
		message.reply('you are now collecting points!');
	}

	const tokens = message.content.split(' '); // split on whitespaces
	const commandToken = tokens[0];

	if (commandToken.indexOf('enter') >= 1) {
		if (pointsByUser[message.author.username]) {
			message.reply('you have already entered.');
			return;
		}

		return;
	}

	if (commandToken.indexOf('points') >= 1) {
		message.reply(`you have ${pointsByUser[message.author.username]} point(s)!`);
		return;
	}

	if (commandToken.indexOf('gamble') >= 1) {
		if (tokens.length < 2) {
			message.reply('you have to specify the amount to wager!');
			return;
		}

		const wager = tokens[1];
		if (wager === 'all' || !isNaN(parseInt(wager))) {
			const content = gamble(message.author.username, wager);
			message.reply(content);
		} else {
			message.reply(`you cannot gamble ${wager}!`);
		}
	}
});

function gamble(user, stake) {
	const roll = getRandomInt(100);
	const wager = stake === 'all' ? pointsByUser[user] : parseInt(stake);
	let multiplier;

	if (wager < 1) {
		return 'you must gamble at least 1 point.';
	}

	if (wager > pointsByUser[user]) {
		return 'you have insufficient points!';
	}

	deductPoints(user, wager);

	if (roll >= 0 && roll < 49) {
		return `sucks to suck <:PepeHands:475079438825160724>! You lost ${wager} point(s)! You now have ${pointsByUser[user]} point(s)!`;
	} else if (roll >= 49 && roll < 97) {
		multiplier = 2;
		awardPoints(user, wager, multiplier);
	} else if (roll >= 97 && roll < 99) {
		multiplier = 3;
		awardPoints(user, wager, multiplier);
	} else {
		multiplier = 6;
		awardPoints(user, wager, multiplier);
	}

	return `congrats <:Pog:469004862848368640>! You won ${wager} x ${multiplier-1} point(s)! You now have ${pointsByUser[user]} point(s)!`;
}

function awardPoints(user, wager, multiplier) {
	pointsByUser[user] = pointsByUser[user] + (wager * multiplier);
}

function deductPoints(user, wager) {
	pointsByUser[user] = pointsByUser[user] - wager;
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function addPoint() {
	for (const [key, value] of Object.entries(pointsByUser)) {
		pointsByUser[key] = value + 1;
	}
}

function readUserData() {
	return database.ref('users').once('value').then((userSnapshots) => {
		userSnapshots.forEach((nextUserSnapshot) => {
			const user = nextUserSnapshot.key;
			pointsByUser[user] = nextUserSnapshot.val(); // store locally
		});
	});
}

function saveToDatabase() {
	database.ref('users').set(pointsByUser);
}

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret
