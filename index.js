const fs = require('node:fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const config = require('./config.json');
const path = require('path');
const cron = require('node-cron');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// Scheduler options
// TODO: Read time from config
const scheduler = cron.schedule("0 0 6,18 * * *", () => client.emit('scheduledGetAssignments', client),{scheduled: false, timezone: 'Europe/Budapest'},false,'Europe/Budapest')

// Login and setup
// + Start Scheduler
client.once('ready', () => {
	scheduler.start();
	//client.emit('scheduledGetAssignments',client);
	console.log('Ready! I\'m active as of ' + client.readyAt + ', as ' + client.user.tag);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		try{
			await interaction.reply({ embeds: [
				new MessageEmbed()
					.setColor(config.colors.red)
					.setTitle('Oh no! An error occurred!')
					.setTimestamp()
					.setDescription(`I'm so sorry, an error has occured!`)
					.setFooter({ text: `Please try again later. ${error}` })
			], ephemeral: true });
		}
		catch(INTERACTION_ALREADY_REPLIED){
			await interaction.editReply({ embeds: [
				new MessageEmbed()
					.setColor(config.colors.red)
					.setTitle('Oh no! An error occurred!')
					.setTimestamp()
					.setDescription(`I'm so sorry, an error has occured!`)
					.setFooter({ text: `Please try again later. ${error}` })
			], ephemeral: true });
		}
	}
});

client.login(config.discord.token);