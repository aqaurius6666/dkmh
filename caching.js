const config = require('./config');




class RedisCaching {
  
  instance = null;
  constructor() {

  }

  getInstance() {
    if(!this.instance) {
      this.instance = require('redis').createClient(config.redis.port, config.redis.host);
    }
    return this.instance;
  }
}

class StorageCaching {

  constructor() {

  }
}

if (config.REDIS_URL) {
  const { createClient } = require('redis');
  const client = createClient({
    url: config.REDIS_URL,
  });
  client.connect();
  module.exports = {

  }
} else {
  module.exports = {

  }
}