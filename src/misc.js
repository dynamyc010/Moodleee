module.exports = {
  contains: (arr, key, val) => {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][key] === val) return true;
      }
      return false;
    },
  // god I hate this
  alreadyDone: (arr, val) => {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) return true;
      }
      return false;
  }
}