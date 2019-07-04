function CancelledError(message) {
  this.message = message;
  this.isCancelledError = true;
}
CancelledError.prototype = Object.create(Error.prototype);
CancelledError.prototype.name = 'CancelledError';
CancelledError.prototype = new Error();

export default CancelledError;
