const Discord = require('discord.js');
const client = new Discord.Client();
const firebase = require("firebase/app");

require("firebase/database");

const points = {};
let database;

client.on('ready', () => {
	// Set the configuration for your app
	// TODO: Replace with your project's config object
	const config = {
		apiKey: `${process.env.API_KEY}`,
		authDomain: `${process.env.PROJECT_ID}.firebaseapp.com`,
		databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`,
		storageBucket: `${process.env.PROJECT_ID}.appspot.com`
	};

	firebase.initializeApp(config);

	// Get a reference to the database service
	database = firebase.database();
	console.log('I am ready!');
});

client.on('message', message => {
	// check for prefix, otherwise skip processing this message
	if (message.content.indexOf('!') !== 0) {
		return;
	}

	// init points for user
	if (points[message.author.username] === undefined) {
		// try to read from DB
		readUserData(message.author.username);
		message.reply('you are now collecting points!');
	}

	const tokens = message.content.split(' '); // split on whitespaces
	const commandToken = tokens[0];

	if (commandToken.indexOf('enter') >= 1) {
		if (points[message.author.username]) {
			message.reply('you have already entered.');
			return;
		}

		return;
	}

	if (commandToken.indexOf('points') >= 1) {
		message.reply(`you have ${points[message.author.username]} point(s)!`);
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
			return;
		} else {
			message.reply(`you cannot gamble ${wager}!`);
		}
	}
});

function gamble(user, stake) {
	const roll = getRandomInt(100);
	const wager = stake === 'all' ? points[user] : parseInt(stake);
	let multiplier;

	if (wager < 1) {
		return 'you must gamble at least 1 point.';
	}

	if (wager > points[user]) {
		return 'you have insufficient points!';
	}

	deductPoints(user, wager);

	if (roll >= 0 && roll < 49) {
		return `sucks to suck! You lost ${wager} point(s)! You now have ${points[user]} point(s)!`;
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

	return `congrats! You won ${wager} x ${multiplier-1} point(s)! You now have ${points[user]} point(s)!`;
}

function awardPoints(user, wager, multiplier) {
	points[user] = points[user] + (wager * multiplier);
}

function deductPoints(user, wager) {
	points[user] = points[user] - wager;
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function addPoint() {
	for (const [key, value] of Object.entries(points)) {
		const userPoints = value + 1;
		points[key] = userPoints;
		writeUserData(key, userPoints);
	}
}

function readUserData(user) {
	return database.ref('/users/' + user).once('value').then((snapshot) => {
		const points = (snapshot.val() && snapshot.val().points) || 10000;
		points[user] = points; // store locally
	});
}

function writeUserData(user, points) {
	database.ref('users/' + user).set({
		points,
	});
}

function saveToDatabase() {
	for (const [key, value] of Object.entries(points)) {
		writeUserData(key, value);
	}
}

setInterval(addPoint, 10000);
setInterval(saveToDatabase, 60000);

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret
