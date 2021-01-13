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

  if (message.author.username === 'drux7') {
    message.reply('smd.');
  }

  if (commandToken.indexOf('enter') >= 1) {
    points[message.author.username] = 0;
    message.reply('you are now collecting points.');
  }

  if (commandToken.indexOf('points') >= 1) {
    const currentPoints = points[message.author.username] || 0;
    message.reply(`you have ${currentPoints} point(s).`);
  }

  if (commandToken.indexOf('gamble') >= 1) {
    message.reply('fuck me.');
  }
});

function gamble(user, points) {
  if (points === 'all') {
    points[user] = 0;
    message.reply('You lose');
  }
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
