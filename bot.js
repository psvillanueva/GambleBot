const Discord = require('discord.js');
const client = new Discord.Client();

const points = {};

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  // check for prefix, otherwise skip processing this message
  if (message.content.indexOf('!') !== 0) {
    return;
  }

  const tokens = message.content.split(' '); // split on whitespaces
  const commandToken = tokens[0];

  if (commandToken.indexOf('enter') >= 1) {
    points[message.author.username] = 0;
    message.reply('you are now collecting points!');
    return;
  }

  if (commandToken.indexOf('points') >= 1) {
    const currentPoints = points[message.author.username] || 0;
    message.reply(`you have ${currentPoints} point(s)!`);
    return;
  }

  if (commandToken.indexOf('gamble') >= 1) {
    if (tokens.length < 2) {
      message.reply('you have to specify the amount to wager!');
      return;
    }

    const wager = tokens[1];
    if (wager === 'all' || parseInt(wager) !== NaN) {
      const content = gamble(message.author.username, wager);
      message.reply(content);
      return;
    }
  }
});

function gamble(user, stake) {
  const roll = getRandomInt(100);
  const wager = stake === 'all' ? points[user] : parseInt(stake);

  if (wager < 1) {
    return 'you must gamble at least 1 point.';
  }

  if (wager > points[user]) {
    return 'you have insufficient points!';
  }

  if (roll >= 0 && roll < 50) {
    return deductPoints(user, wager);
  } else {
    return awardPoints(user, wager);
  }
}

function awardPoints(user, wager) {
  points[user] = points[user] + wager;
  return `congrats! You won ${wager} point(s)! You now have ${points[user]} point(s)!`;
}

function deductPoints(user, wager) {
  points[user] = points[user] - wager;
  return `sucks to suck! You lost ${wager} point(s)! You now have ${points[user]} point(s)!`;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function addPoint() {
  for (const [key, value] of Object.entries(points)) {
    const userPoints = value + 1;
    points[key] = userPoints;
  }
}

setInterval(addPoint, 1000);

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
