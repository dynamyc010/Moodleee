const { SlashCommandBuilder } = require('@discordjs/builders');
const { tokenHarvest } = require('../src/token-harvester');
const { contains } = require('../src/misc');
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
		.setName('register')
		.setDescription('Register your Moodle account!')
        .addSubcommand(connect =>
            connect
                .setName('connect')
                .setDescription('Connect a Moodle account to your Discord account.')
                .addStringOption(option => option.setName('username').setDescription('Your Moodle username').setRequired(true))
                .addStringOption(option => option.setName('password').setDescription('Your Moodle password').setRequired(true)))
        .addSubcommand(disconnect =>
            disconnect
                .setName('disconnect')
                .setDescription('Disconnect your Moodle account from your Discord account.')),
	async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if(interaction.options.getSubcommand() === 'connect'){
        moodle.init({
            wwwroot: config.moodle.url,
            username: interaction.options.getString('username'),
            password: interaction.options.getString('password')
          }).then(function(client) {
            if(contains(config.moodle.tokens, "discordid", interaction.member.id)){
              //console.log("Token already exists for this discord user");
              config.moodle.tokens[config.moodle.tokens.findIndex(x => x.discordid === interaction.member.id)].token = client.token;
            }
            else{
              //console.log("Token does not exist for this discord user");
              config.moodle.tokens.push({"discordid": interaction.member.id, "token": client.token});
            }
            fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
            //console.log('Token written to config.json successfully!');
            successEmbed
              .setDescription(`You are now connected to Moodle!`)
            return interaction.editReply({embeds: [successEmbed], ephemeral: true});
          })
          .catch(function(err) {
            //console.log("Failed to log in: " + err);
            errorEmbed
              .setDescription("Failed to connect your Moodle account!")
              .setFooter({text: `Please try again later. ${err}`});
            return interaction.editReply({embeds: [errorEmbed], ephemeral: true});
          });
      }
    else if(interaction.options.getSubcommand() === 'disconnect'){
      if(contains(config.moodle.tokens, "discordid", interaction.member.id)){
          config.moodle.tokens.splice(config.moodle.tokens.findIndex(x => x.discordid === interaction.member.id), 1);
          fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
          successEmbed
            .setDescription(`You are now disconnected from Moodle!`)
          return interaction.editReply({embeds: [successEmbed], ephemeral: true});
      }else{
          errorEmbed
            .setDescription("You are not connected to Moodle!")
            .setFooter({text: `Connect your account first.`});
          await interaction.editReply({embeds: [errorEmbed], ephemeral: true});
      }
    };
	},
};