const Discord = require('discord.js');
const client = new Discord.Client();
const firebase = require("firebase/app");

require("firebase/database");

const docAscii = "⣿⠄⡇⢸⣟⠄⠁⢸⡽⠖⠛⠈⡉⣉⠉⠋⣁⢘⠉⢉⠛⡿⢿⣿⣿⣿⣿⣿⣿⣿\n⣷⣶⣷⣤⠄⣠⠖⠁⠄⠂⠁⠄⠄⠉⠄⠄⠎⠄⠠⠎⢐⠄⢑⣛⠻⣿⣿⣿⣿⣿\n⣿⣿⣿⠓⠨⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠐⠅⠄⠉⠄⠗⠆⣸⣿⣿⣿⣿⣿\n⣿⣿⣿⡣⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⢰⣤⣦⠄⠄⠄⠄⠄⠄⠄⡀⡙⣿⣿⣿⣿\n⣿⣿⡛⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠔⠿⡿⠿⠒⠄⠠⢤⡀⡀⠄⠁⠄⢻⣿⣿⣿\n⣿⣿⠄⠄⠄⠄⠄⠄⣠⡖⠄⠁⠁⠄⠄⠄⠄⠄⠄⠄⣽⠟⡖⠄⠄⠄⣼⣿⣿⣿\n⣿⣿⠄⠄⠄⠄⠄⠄⢠⣠⣀⠄⠄⠄⠄⢀⣾⣧⠄⠂⠸⣈⡏⠄⠄⠄⣿⣿⣿⣿\n⣿⣿⡞⠄⠄⠄⠄⠄⢸⣿⣶⣶⣶⣶⣶⡿⢻⡿⣻⣶⣿⣿⡇⠄⠄⠄⣿⣿⣿⣿\n⣿⣿⡷⡂⠄⠄⠁⠄⠸⣿⣿⣿⣿⣿⠟⠛⠉⠉⠙⠛⢿⣿⡇⠄⠄⢀⣿⣿⣿⣿\n⣶⣶⠃⠄⠄⠄⠄⠄⠄⣾⣿⣿⡿⠁⣀⣀⣤⣤⣤⣄⢈⣿⡇⠄⠄⢸⣿⣿⣿⣿\n⣿⣯⠄⠄⠄⠄⠄⠄⠄⢻⣿⣿⣷⣶⣿⣿⣥⣬⣿⣿⣟⣿⠃⠄⠨⠺⢿⣿⣿⣿\n⠱⠂⠄⠄⠄⠄⠄⠄⠄⣬⣸⡝⠿⢿⣿⡿⣿⠻⠟⠻⢫⡁⠄⠄⠄⡐⣾⣿⣿⣿\n⡜⠄⠄⠄⠄⠄⠆⡐⡇⢿⣽⣻⣷⣦⣧⡀⡀⠄⠄⣴⣺⡇⠄⠁⠄⢣⣿⣿⣿⣿\n⠡⠱⠄⠄⠡⠄⢠⣷⠆⢸⣿⣿⣿⣿⣿⣿⣷⣿⣾⣿⣿⡇⠄⠄⠠⠁⠿⣿⣿⣿\n⢀⣲⣧⣷⣿⢂⣄⡉⠄⠘⠿⣿⣿⣿⡟⣻⣯⠿⠟⠋⠉⢰⢦⠄⠊⢾⣷⣮⣽⣛"
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

	if (commandToken === '!points' || commandToken === '!p') {
		message.reply(`you have ${pointsByUser[message.author.username]} point(s)!`);
	}

	if (commandToken === '!gamble' || commandToken === '!g' || commandToken === '!gambletimes' || commandToken === '!gt') {
		if (tokens.length < 2) {
			message.reply('Usage: !gamble <amount>');
			return;
		}

		const wager = 'all';
		// const wager = tokens[1];
		if (wager === 'all' || !isNaN(parseInt(wager))) {
			const content = gamble(message.author.username, wager);
			message.reply(`Gamble Bot don't give a fuck. We gamble it all around here!\n` + content);
		} else {
			message.reply(`you cannot gamble ${wager}!`);
		}
	}

	/*
	if (commandToken === '!gambletimes' || commandToken === '!gt') {
		if (tokens.length < 3) {
			message.reply('Usage: !gambletimes <amount> <times>');
			return;
		}

		const wager = parseInt(tokens[1]);
		const times = parseInt(tokens[2]);

		if (isNaN(wager) || isNaN(times)) {
			message.reply(`you cannot gamble ${tokens[1]}, ${tokens[2]} times!`);
		} else if (times > 100 || times < 1) {
			message.reply(`you can only gamble between 1 to 100 times!`);
		} else {
			const content = gamble(message.author.username, wager, times);
			message.reply(content);
		}
	}
	*/

	if (commandToken === '!leaderboard' || commandToken === '!l') {
		message.channel.send(ranks());
	}
	
	if (commandToken === '!cd') {
		message.channel.send(docAscii);
	}
});

function gamble(user, stake, times = 1) {
	const wager = stake === 'all' ? pointsByUser[user] : parseInt(stake);
	let multiplier = stake === 'all' ? 6 : 0;

	if (wager < 1) {
		return 'you must gamble at least 1 point.';
	}

	const totalWager = wager * times;

	if (totalWager > pointsByUser[user]) {
		return 'you have insufficient points!';
	}

	let totalWinnings = 0;
	let totalLosings = 0;
	
	let successes = 0;
	let failures = 0;
	
	let x1 = 0;
	let x2 = 0;
	let x5 = 0;

	deductPoints(user, totalWager);

	for (let i = 0; i < times; i++) {
		const roll = getRandomInt(100);
		multiplier = roll + 1;

		if (roll >= 0 && roll < 49) {
			totalLosings += wager;
			failures += 1;
			if (times === 1) {
				return `You rolled \`${roll}\`! You've got to know when to hold 'em, know when to fold 'em <:PepeHands:475079438825160724>! You lost \`${totalWager}\` point(s)! You now have \`${pointsByUser[user]}\` point(s)!`;
			}
			continue;
		} else if (roll >= 49 && roll < 97) {
			multiplier = multiplier || 2;
			x1 += 1;
		} else if (roll >= 97 && roll < 99) {
			multiplier = multiplier || 3;
			x2 += 1;
		} else {
			multiplier = multiplier || 6;
			x5 += 1;
		}

		const winnings = wager * multiplier;
		totalWinnings += (winnings - wager);
		successes += 1;
		awardPoints(user, winnings);
		
		if (times === 1) {
			return `You rolled \`${roll}\`! Congrats <:Pog:469004862848368640>! You won \`${totalWager} x ${multiplier-1}\` point(s)! You now have \`${pointsByUser[user]}\` point(s)!`;
		}
	}

	let content = '';
	content += `out of the ${times} time(s) you rolled:\n`;
	content += `You won ${successes} times, earning ${totalWinnings} point(s)! x1: ${x1}, x2: ${x2}, x5: ${x5}\n`;
	content += `You lost ${failures} times, losing ${totalLosings} point(s)!\n`;
	content += `You netted ${totalWinnings - totalLosings} points!\n`;
	content += `You now have ${pointsByUser[user]} point(s)!`;

	return content;
}

function awardPoints(user, winnings) {
	pointsByUser[user] = pointsByUser[user] + winnings;
}

function deductPoints(user, wager) {
	pointsByUser[user] = pointsByUser[user] - wager;
}

function ranks() {
	let message = '```';
	Object.entries(pointsByUser)
		.sort((a, b) => b[1] - a[1])
		.forEach((value, index) => {
			message += `${(index+1).toString().padEnd(2)}: ${value[0].padEnd(32)}${value[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\n`;
		});
	message += '```';
	return message;
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
