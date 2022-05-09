const { SlashCommandBuilder } = require('@discordjs/builders');
var moodle = require('moodle-client');
var config = require('../config.json');
var fs = require('fs');
const { MessageEmbed } = require('discord.js');

let errorEmbed = new MessageEmbed()
.setColor(config.colors.red)
.setTitle('Oh no! An error occurred!')
.setTimestamp()

let assigmentEmbed = new MessageEmbed()
.setColor(config.colors.blue)
.setTitle('Your assignments: ') 
.setTimestamp()


module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-assignments')
		.setDescription('Get your Moodle assignments!'),
        async execute(interaction) {
            await interaction.deferReply({ ephemeral: true });
            try{
                var token = config.moodle.tokens.find(x => x.discordid === interaction.member.id).token;
            }
            catch(err){
                errorEmbed
                    .setDescription(`You are not connected to a Moodle account!`)
                    .setFooter({text: `Use \`/register connect\` to connect your Moodle account to your Discord account.`});
                return interaction.editReply({embeds: [errorEmbed], ephemeral: true});
            }
            moodle.init({
                wwwroot: config.moodle.url,
                token: token,
                service: "moodleee-discord-bot",
                moodlewsrestformat: 'json',
            }).then(function(client) {
                client.call({
                    wsfunction: "core_calendar_get_calendar_upcoming_view",
            
                }).then(function(value) {
                    let i = 0;
                    value.events.forEach(event => {

                        assigmentEmbed.addField(event.name, `${event.course.fullname}\nHatáridő: <t:${event.timesort}:R>\n${event.url}`);
                        // if(i++ == 0){
                        //     interaction.editReply({content: `${event.name} - ${event.course.fullname} - ${time}`, ephemeral: true});
                        // }
                        interaction.editReply({embeds: [assigmentEmbed], ephemeral: true});
                    });
                    //console.log(value.courses[0].assignments);
                    return;
                });
            
            }).catch(function(err) {
                errorEmbed
                    .setDescription("Failed to connect to Moodle!")
                    .setFooter({text: `Please try again later. ${err}`});
                return interaction.editReply({embeds: [errorEmbed], ephemeral: true});
            });
        }
    }