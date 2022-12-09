const moodle = require('moodle-client');
const config = require('../config.json');
const { MessageEmbed } = require('discord.js');
const { hyperlink, italic, time } = require('@discordjs/builders');

module.exports = {
	name: 'scheduledGetAssignments',
	once: false,
	execute(client) {
		console.log(`[${Date.now()}]Running scheduled events...`)
		config.moodle.tokens.forEach((token) => {
			if(token.scheduler === true){
				moodle.init({
					wwwroot: config.moodle.url,
					token: token.token,
					service: "moodleee-discord-bot",
					moodlewsrestformat: 'json',
				}).then(function(mClient) {
					mClient.call({
						wsfunction: "core_calendar_get_calendar_upcoming_view",
					}).then(function(value) {
						let assigmentEmbed = new MessageEmbed()
							.setColor(config.colors.blue)
							.setTitle('Your assignments: ') 
							.setTimestamp();
						if(value.events.length === 0){
							return;
						}
						client.users.fetch(token.discordid).then((user) => {
							value.events.forEach((event) => {
								assigmentEmbed
									.addField(event.name.replace(" esedékes", ""), `${event.course.fullname}\nDue: ${time(event.timesort, "R")}\n${italic(hyperlink('Open assignment', event.url))}`)
									.setFooter({text: `${value.events.length} assignments found.`, iconURL: user.avatarURL()});
								});
							user.send({embeds: [assigmentEmbed]});
							return;
						});
					});
			})}
		})
	},
};