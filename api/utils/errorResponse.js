class ErrorResponse extends Error {
  constructor(message, statuesCode) {
    super(message); //here we extends the message that Error class has
    this.statuesCode = statuesCode;
  }
}
module.exports = ErrorResponse;
