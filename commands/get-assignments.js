const { SlashCommandBuilder, hyperlink, italic, time } = require('@discordjs/builders');
var moodle = require('moodle-client');
var config = require('../config.json');
const { MessageEmbed } = require('discord.js');
const { alreadyDone } = require('../src/misc');

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
                    var user = config.moodle.tokens.find(x => x.discordid === interaction.user.id);
                    let assigmentEmbed = new MessageEmbed()
                        .setColor(config.colors.blue)
                        .setTitle('Your assignments: ') 
                        .setTimestamp();
                    if(value.events === undefined){
                        if(value.errorcode == "invalidtoken")
                        errorEmbed
                            .setTitle("So sorry! An error has occured.")
                            .setDescription("We couldn't get your assignments because your token got revoked.")
                            .setFooter({text: "Log in again using /register connect."});
                        return interaction.editReply({embeds: [errorEmbed], ephemeral: true});
                    }
                    if(value.events.length === 0){
                        assigmentEmbed.setTitle("You have no assignments!")
                            .setDescription("You're all done for now! Good job!")
                            .setFooter({text: `No unfinished assignments found.`, iconURL: interaction.user.avatarURL()});
                        return interaction.editReply({embeds: [assigmentEmbed], ephemeral: true});
                    }
                    // Since we may not have anything in here, let's make sure.
                    if(!user.done){ 
                        user.done = []
                    }
                    let i = 0;
                    value.events.forEach(event => {
                        if(!alreadyDone(user.done,event.id)){
                                assigmentEmbed
                                    .addField(event.name.replace(" esedékes", ""), `${event.course.fullname.replace("_", "\\\_")}\nDue: ${time(event.timesort, "R")}\n${italic(hyperlink('Open assignment', event.url))} - ${event.id}`)
                                    .setFooter({text: `${++i} assignments listed, ${value.events.length} assigments found.`, iconURL: interaction.user.avatarURL()})
                                    .setDescription("You can use `/done <assignment ID>` to mark one as done.");
                                interaction.editReply({embeds: [assigmentEmbed], ephemeral: true});
                            }
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