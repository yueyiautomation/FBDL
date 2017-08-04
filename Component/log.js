var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/debug.log',"maxLogSize": 20480}
  ]
});
exports.logger = log4js.getLogger();