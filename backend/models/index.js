const User = require('./User');
const Client = require('./Client');

// Initialize models - Mongoose handles associations automatically
const initializeModels = () => {
  console.log('📄 Models initialized successfully');
  return { User, Client };
};

// Export models and initialization function
module.exports = {
  User,
  Client,
  initializeModels
};
