const Discord = require('discord.js');
const client = new Discord.Client();

console.log('Starting up');
client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    if (message.content === 'ping') {
       message.reply('pong');
    }
});

console.log(`Using secret key: ${process.env.BOT_TOKEN}`);
// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
