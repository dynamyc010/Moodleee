const { SlashCommandBuilder } = require('@discordjs/builders');
const { tokenHarvest } = require('./token-harvester');
const { contains } = require('./misc');
const { MessageEmbed } = require('discord.js');
var moodle = require('moodle-client');
var config = require('../config.json');
var fs = require('fs');

let errorEmbed = new MessageEmbed()
  .setColor(config.colors.red)
  .setTitle('Oh no! An error occurred!')
  .setTimestamp()

let successEmbed = new MessageEmbed()
  .setColor(config.colors.green)
  .setTitle('Success!') 
  .setTimestamp()


module.exports = {
	data: new SlashCommandBuilder()
		.setName('update-image')
		.setDescription('Update your profile picture!')
        .addStringOption(option => option.setName('image link').setDescription('Link to the image').setRequired(true)),
	async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
        moodle.init({
            wwwroot: config.moodle.url,
            token: token,
            service: "moodleee-discord-bot",
            moodlewsrestformat: 'json',
        }).then(function(client) {
            client.call({
                wsfunction: "core_user_update_picture",
            }).then(function(value) {
                if(value.events.length === 0){
                    assigmentEmbed.setTitle("You have no assignments!")
                        .setDescription("You're all done for now! Good job!")
                        .setFooter({text: `No unfinished assignments found.`, iconURL: interaction.user.avatarURL()});
                    return interaction.editReply({embeds: [assigmentEmbed], ephemeral: true});
                }
                value.events.forEach(event => {
                    assigmentEmbed
                        .addField(event.name.replace(" esedékes", ""), `${event.course.fullname}\nDue: ${time(event.timesort, "R")}\n${italic(hyperlink('Open assignment', event.url))}`)
                        .setFooter({text: `${value.events.length} assignments found.`, iconURL: interaction.user.avatarURL()});
                    interaction.editReply({embeds: [assigmentEmbed], ephemeral: true});
                });
                return;
            })
          .catch(function(err) {
            //console.log("Failed to log in: " + err);
            errorEmbed
              .setDescription("Failed to set your image!")
              .setFooter({text: `Please try again later. ${err}`});
            return interaction.editReply({embeds: [errorEmbed], ephemeral: true});
          });
      });
	},
};