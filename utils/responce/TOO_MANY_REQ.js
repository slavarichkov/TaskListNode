class TOO_MANY_REQ extends Error {
    constructor(message) {
      super(message);
      this.statusCode = 429;
    }
  }
  
  module.exports = TOO_MANY_REQ;