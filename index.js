const fs = require('node:fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
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
		await interaction.reply({ embeds: [
			new MessageEmbed()
				.setColor(config.colors.red)
				.setTitle('Oh no! An error occurred!')
				.setTimestamp()
				.setDescription(`I'm so sorry, an error has occured!`)
				.setFooter({ text: `Please try again later. ${error}` })
		], ephemeral: true });
	}
});

client.login(config.discord.token);