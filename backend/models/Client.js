const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/crypto');

const clientSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  apiToken: { type: String, required: true }, // stored encrypted, see setApiToken/getApiToken
  markets: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

clientSchema.methods.setApiToken = function setApiToken(plainToken) {
  this.apiToken = encrypt(plainToken);
};

clientSchema.methods.getApiToken = function getApiToken() {
  return decrypt(this.apiToken);
};

// Never serialize the raw encrypted token to API responses
clientSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.apiToken;
    return ret;
  }
});

module.exports = mongoose.model('Client', clientSchema);
