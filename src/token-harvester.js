var config = require('../config.json');
var moodle = require('moodle-client');
var fs = require('fs');
var { contains } = require('./misc');

module.exports = {
  tokenHarvest: (USERNAME, PASSWORD, discord) => {
    moodle.init({
      wwwroot: config.moodle.url,
      username: USERNAME,
      password: PASSWORD,
    }).then(function(client) {
      if(contains(config.moodle.tokens, "discordid", discord.id)){
        //console.log("Token already exists for this discord user");
        config.moodle.tokens[config.moodle.tokens.findIndex(x => x.discordid === discord.id)].token = client.token;
      }
      else{
        //console.log("Token does not exist for this discord user");
        config.moodle.tokens.push({"discordid": id, "token": client.token});
      }
      fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
      //console.log('Token written to config.json successfully!');
      return;
    }).catch(function(err) {
       //console.log("Failed to log in: " + err);
    });
  }
}