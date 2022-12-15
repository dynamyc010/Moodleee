const { SlashCommandBuilder, hyperlink, italic, time } = require('@discordjs/builders');
var moodle = require('moodle-client');
var config = require('../config.json');
const { MessageEmbed } = require('discord.js');


let errorEmbed = new MessageEmbed()
.setColor(config.colors.red)
.setTitle('Oh no! An error occurred!')
.setTimestamp()


// TODO: Check if the amount of assignments is more than Discord's 4000 character limit
module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-assignments')
		.setDescription('Get your Moodle assignments!'),
        async execute(interaction) {
            await interaction.deferReply({ ephemeral: true });
            try{
                var token = config.moodle.tokens.find(x => x.discordid === interaction.user.id).token;
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
                    let assigmentEmbed = new MessageEmbed()
                        .setColor(config.colors.blue)
                        .setTitle('Your assignments: ') 
                        .setTimestamp();
                    console.log(value);
                    if(value.events === undefined){
                        errorEmbed
                            .setTitle("So sorry! An error has occured.")
                            .setDescription("We couldn't get your assignments for some reason.")
                            .setFooter({text: "Your token likely got revoked. Please log in again using /register connect."});
                        return interaction.editReply({embeds: [errorEmbed], ephemeral: true});
                    }
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
                }).catch(function(err) {
                    errorEmbed
                        .setDescription("Failed to connect to Moodle!")
                        .setFooter({text: `Please try again later. ${err}`});
                    return interaction.editReply({embeds: [errorEmbed], ephemeral: true});
                });
            }).catch(function(err) {
                errorEmbed
                    .setDescription("Failed to connect to Moodle!")
                    .setFooter({text: `Please try again later. ${err}`});
                return interaction.editReply({embeds: [errorEmbed], ephemeral: true});
            });
        }
    }