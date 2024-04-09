const uuid = require('uuid');

async function checkUUID(str) {
    return uuid.validate(str);
}

module.exports = {
    checkUUID,
}