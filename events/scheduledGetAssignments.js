const moodle = require('moodle-client');
const dayjs = require('dayjs').extend(require('dayjs/plugin/localizedFormat'))
const config = require('../config.json');
const { MessageEmbed } = require('discord.js');
const { hyperlink, italic, time } = require('@discordjs/builders');
const { alreadyDone } = require('../src/misc')

module.exports = {
	name: 'scheduledGetAssignments',
	once: false,
	execute(client) {
		console.log(`[${dayjs(new Date()).format('L LTS')}] Running scheduled events...`)
		config.moodle.tokens.forEach((user) => {
			if(user.scheduler === true){
				moodle.init({
					wwwroot: config.moodle.url,
					token: user.token,
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
						client.users.fetch(user.discordid).then((userObj) => {
							if(!user.done){ 
								user.done = []
							}
							let i = 0;
							value.events.forEach((event) => {
								if(!alreadyDone(user.done,event.id)){
									assigmentEmbed
										.addField(event.name.replace(" esedékes", ""), `${event.course.fullname}\nDue: ${time(event.timesort, "R")}\n${italic(hyperlink('Open assignment', event.url))} - ${event.id}`)
										.setFooter({text: `${++i} assignments listed, ${value.events.length} assigments found.`, iconURL: userObj.avatarURL()})
										.setDescription("You can use `/done <assignment ID>` to mark one as done.");
								}
							});
							if(assigmentEmbed.fields.length != 0){
								userObj.send({embeds: [assigmentEmbed]});
							}
							return;
						});
					});
			})}
		})
	},
};