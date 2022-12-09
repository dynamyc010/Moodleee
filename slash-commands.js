const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, id } = require('./config.json').discord;
const fs = require('node:fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Place your client and guild ids here
const clientId = id;
const guildId = '735855725749862440';

const production = true;

for (const file of commandFiles) {
	if(!(file === 'eval.js' && production === true)) {
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
	};
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();