const { nodeModuleNameResolver } = require("typescript");

module.exports = {
  contains: (arr, key, val) => {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][key] === val) return true;
      }
      return false;
    },

    getAssignments: (token, callback) => {
      const moodle = require('moodle-client');
    }
}