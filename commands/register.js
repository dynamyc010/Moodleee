const { SlashCommandBuilder } = require('@discordjs/builders');
const { contains } = require('../src/misc');
const { MessageEmbed } = require('discord.js');
var moodle = require('moodle-client');
var config = require('../config.json');
const fs = require('fs');

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
                .addStringOption(option => option.setName('password').setDescription('Your Moodle password').setRequired(true))
                .addBooleanOption(option => option.setName('scheduler').setDescription('If you want scheduled reports (default is off)').setRequired(false)))
        .addSubcommand(disconnect =>
            disconnect
                .setName('disconnect')
                .setDescription('Disconnect your Moodle account from your Discord account.'))
        .addSubcommand(scheduler => 
              scheduler
                 .setName('scheduler')
                 .setDescription('Update your scheduler preferences')
                 .addBooleanOption(option => option.setName('value').setDescription('Yes or No').setRequired(false))),
	async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if(interaction.options.getSubcommand() === 'connect'){
        console.log(interaction.options.getBoolean('scheduler'));
        var schedulerValue = interaction.options.getBoolean('scheduler') === null ? false : interaction.options.getBoolean('scheduler');
        moodle.init({
            wwwroot: config.moodle.url,
            username: interaction.options.getString('username'),
            password: interaction.options.getString('password')
          }).then(function(client) {
            if(contains(config.moodle.tokens, "discordid", interaction.user.id)){
              //console.log("Token already exists for this discord user");
              config.moodle.tokens.find(x => x.discordid === interaction.user.id).token = client.token;
              config.moodle.tokens.find(x => x.discordid === interaction.user.id).scheduler = schedulerValue;
            }
            else{
              //console.log("Token does not exist for this discord user");
              config.moodle.tokens.push({"discordid": interaction.user.id, "token": client.token, "scheduler": schedulerValue});
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
      if(contains(config.moodle.tokens, "discordid", interaction.user.id)){
          config.moodle.tokens.splice(config.moodle.tokens.findIndex(x => x.discordid === interaction.user.id), 1);
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
    }
    else if(interaction.options.getSubcommand() === 'scheduler'){
      if(config.moodle.tokens.findIndex(x => x.discordid === interaction.user.id) == -1) {
        errorEmbed
          .setDescription("You are not connected to Moodle!")
          .setFooter({text: `Connect your account first.`});
        return interaction.editReply({embeds: [errorEmbed], ephemeral: true});
      }
      var value = interaction.options.getBoolean('value');
      if(value === null){
        value = !config.moodle.tokens.find(x => x.discordid === interaction.user.id).scheduler;
      }
      
      config.moodle.tokens.find(x => x.discordid === interaction.user.id).scheduler = value;
      fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
      successEmbed
        .setDescription(`${value? '': ''} You turned ${value ? 'on' : 'off'} scheduled notifications!`);
      return interaction.editReply({embeds: [successEmbed], ephemeral: true});
    };
	},
};