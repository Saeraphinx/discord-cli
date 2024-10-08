const Discord = require('discord.js');
const inquirer = require('inquirer');
const fs = require('fs');

const client = new Discord.Client();
const permissions = '68608';
const clientId = '560361265139286017';
const clientInviteUrl = `https://discordapp.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=${permissions}`;
const token = fs.readFileSync('token.txt', 'utf8').trim();

var channel = null;

var loader = ['/ Connecting..', '| Connecting..', '\\ Connecting..', '- Connecting..'];
var i = 4;
var ui = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] });

var intervalId = setInterval(() => {
  ui.updateBottomBar(loader[i++ % 4]);
}, 300);

function selectChannel() {
    var mapped = client.channels.map((v, k) => {
        return v;
    });
    mapped.forEach((c, i) => {
        if (c && c.type == 'text')
            console.log(`  ${i}: ${c.name}`);
    });

    inquirer
        .prompt([
            {
                type: 'input',
                name: 'index',
                message: "Select channel index:",
                validate: function (value) {
                    try {
                        const index = parseInt(value);
                        return index > 0 && index < mapped.length;
                    } catch (e) { }
                }
            }
        ]).then((answers) => {
            var channelIndex = parseInt(answers.index);
            channel = mapped[channelIndex];
            listen();
        }).catch(e => {
            console.log(e);
        });
}

function listen() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'message',
                message: `${channel.name}>`
            }
        ]).then((answers) => {
            var input = answers.message;
            if (input == ">sc") {
                selectChannel();
            } else {
                if (typeof input === `string` && input.trim().length >= 1) {
                    channel.send(input);
                }
                listen(channel);
            }
        }).catch(e => {
            console.log(e);
        });
}

client.on('ready', () => {
    clearInterval(intervalId);
    ui.updateBottomBar(`Logged in as ${client.user.tag}!`);
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Invite link: ${clientInviteUrl}`);
    console.log(`Run '>sc' to switch channel.\n\n`);
    selectChannel();
});

client.on('message', msg => {
    if (channel &&
        msg.channel.id == channel.id &&
        msg.member.id != client.user.id) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${msg.member.displayName}> ${msg.content}\n`);
        inquirer.restoreDefaultPrompts();
    }
});

client.login(token);
