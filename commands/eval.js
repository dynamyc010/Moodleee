const { SlashCommandBuilder, codeBlock } = require('@discordjs/builders');
var moodle = require('moodle-client');
var config = require('../config.json');
var fs = require('fs');
const { MessageEmbed } = require('discord.js');

let errorEmbed = new MessageEmbed()
  .setColor(config.colors.red)
  .setTitle('Oh no! An error occurred!')
  .setTimestamp()

let successEmbed = new MessageEmbed()
  .setColor(config.colors.purple)
  .setTitle('Output: ') 
  .setTimestamp()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
    .setDefaultPermission(false)
		.setDescription('Evaluator - dev only')
    .addStringOption(option => option.setName('input').setDescription('Input to be eval\'d').setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        // If the message author's ID does not equal
        // our ownerID, get outta there!
        if (interaction.user.id !== config.discord.owner){
            errorEmbed.setDescription("You are not the owner of this bot!")
            .setFooter({text: `What did you think would happen? lmao`, iconURL: interaction.user.avatarURL()})
            return interaction.editReply({embeds: [errorEmbed], ephemeral: true});
        }
        // In case something fails, we to catch errors
        // in a try/catch block
        try {
          const client = await interaction.client;

          // Evaluate (execute) our input
          const evaled = eval(interaction.options.getString('input'));

          // Put our eval result through the function
          // we defined above
          const cleaned = await clean(evaled);

          // Reply in the channel with our result
          successEmbed.setDescription(codeBlock('js', cleaned))

          if(cleaned.length > 4096){
              successEmbed.setDescription(`Output is too long to display.`)
              .setFooter({text: `Check your local console for your output!`, iconURL: interaction.user.avatarURL()})
              console.log(cleaned)
          }
          interaction.editReply({embeds: [successEmbed], ephemeral: true});
        } catch (err) {
          // Reply in the channel with our error
          errorEmbed.setTitle("Errored output:").setDescription(codeBlock('js',err));
          interaction.editReply({embeds: [errorEmbed], ephemeral: true});
        }

  // End of our command
    }
}

// This function cleans up and prepares the
// result of our eval command input for sending
// to the channel
const clean = async (text) => {
  // If our input is a promise, await it before continuing
  if (text && text.constructor.name == "Promise")
    text = await text;
  
  // If the response isn't a string, `util.inspect()`
  // is used to 'stringify' the code in a safe way that
  // won't error out on objects with circular references
  // (like Collections, for example)
  if (typeof text !== "string")
    text = require("util").inspect(text, { depth: 1 });
  
  // Replace symbols with character code alternatives
  text = text
    .replace(/`/g, "`" + String.fromCharCode(8203))
    .replace(/@/g, "@" + String.fromCharCode(8203));
  

  // You will need to place this inside the clean
  // function, before the result is returned.
  text = text.replaceAll(config.discord.token, "[REDACTED]");
  // Send off the cleaned up result
  return text;
}