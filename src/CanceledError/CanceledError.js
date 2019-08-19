function CanceledError(message) {
  this.message = message;
  this.isCanceledError = true;
}
CanceledError.prototype = Object.create(Error.prototype);
CanceledError.prototype.name = 'CanceledError';
CanceledError.prototype = new Error();

export default CanceledError;
