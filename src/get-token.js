const prompt = require('prompt');
const harvester = require('./token-harvester');
// This script is used for writing your user token into config.json.
// You can use it to get your user token from moodle.

const properties = [
  {
    name: 'username',
    warning: 'Username must be only letters, spaces, or dashes'
  },
  {
    name: 'password',
    hidden: true
  }
];

prompt.start();

prompt.get(properties, function (err, result) {
  if (err) {
    console.log(err);
    return 1;
  }

  harvester.tokenHarvest(result.username,result.password,{member: {id: '123456789'}});

});