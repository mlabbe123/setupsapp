var config = {};

config.base_url = process.env.BASE_URL || 'http://localhost:8080';
config.node_env = process.env.NODE_ENV || 'DEV';

module.exports = config;