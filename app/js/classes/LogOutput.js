function LogOutput() {
  this.log = '';
}

LogOutput.prototype.write = function (s) {
  this.log += s;
};

LogOutput.prototype.clear = function () {
  this.log = '';
};
