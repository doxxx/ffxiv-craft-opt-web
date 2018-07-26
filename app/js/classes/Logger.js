function Logger(logOutput) {
  this.logOutput = logOutput;
}

Logger.prototype.log = function (myString) {
  var args = Array.prototype.slice.call(arguments, 1);
  var msg = String.prototype.sprintf.apply(myString, args);
  if (this.logOutput !== undefined && this.logOutput !== null) {
    this.logOutput.write(msg + '\n');
  }
  else {
    console.log(msg);
  }
};
