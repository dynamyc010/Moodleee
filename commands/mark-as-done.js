const { alreadyDone } = require("../src/misc")
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder, hyperlink, italic, time } = require('@discordjs/builders');
const fs = require('fs');
const config = require('../config.json')

let successEmbed = new MessageEmbed()
  .setColor(config.colors.green)
  .setTitle('Success!') 
  .setTimestamp()
  .setFooter({text: "Powered by my hatred towards Moodle's API"});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('done')
		.setDescription('Mark your assignments as done!')
        .addIntegerOption(option => option.setName('id').setDescription('The assignment\'s ID you want to mark as done (or undone).').setRequired(true)),
        async execute(interaction) {
            await interaction.deferReply({ ephemeral: true });
            var user = config.moodle.tokens.find(x => x.discordid === interaction.user.id);
            const id = interaction.options.getInteger('id')
            // Making sure this exists
            if(!user.done){ 
                user.done = [];
            }
            if(await !alreadyDone(user.done, id)){
                user.done.push(id);
                fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
                successEmbed
                    .setDescription(`Added \`${id}\` to your list of done assignments.`)
                    .setFooter({text: "Powered by my hatred towards Moodle's API"});
                
            }else{
                //config.moodle.tokenssplice(config.moodle.tokens.findIndex(x => x.discordid === interaction.user.id), 1);
                user.done.splice(user.done.indexOf(id),1);
                fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
                successEmbed
                    .setDescription(`Removed \`${id}\` from the list of done assignments.`)
                }
            return interaction.editReply({embeds: [successEmbed], ephemeral: true});
        }
    }