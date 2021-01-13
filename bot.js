const Discord = require('discord.js');
const client = new Discord.Client();

const points = {};

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  const tokens = message.content.split(' '); // split on whitespaces

  if (tokens.length && tokens[0].startsWith('!')) {
    if (message.content.indexOf('gamble') > 1) {
      message.reply('Fuck me.');
    }
  }
});

function gamble(user, points) {
  if (points === 'all') {
    points[user] = 0;
    message.reply('You lose');
  }
}

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
