
import  {createLogger,format, transports} from "winston";
const {timestamp } = format;
import * as path from "path";
import fs  from 'fs';

const rootPath = path.normalize(__dirname + '../../');
const env = (process.env.NODE_ENV = process.env.NODE_ENV || 'development');


var ApplicationName = process.env.AMQPTS_APPLICATIONNAME ||
    (path.parse ? path.parse(process.argv[1]).name : path.basename(process.argv[1]));

var logger;
const config = {
    logdir: process.env.LOGDIR || rootPath + 'log',
    log_api_request: process.env.LOG_API_REQUEST || 'true',
    log_api_response: process.env.LOG_API_RESPONSE || 'true',
    logstash_host: process.env.LOGSTASH_HOST || '3.121.237.159', // localhost
    logstash_port: process.env.LOGSTASH_PORT || '2222',
    log_level: process.env.LOG_LEVEL || 'debug',
}


var options = {
    file: {
      level: 'error',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
      filename:""
    },
    console: {
      level: 'verbose',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
    filename:""
  };


  const ignorePrivate = format((info, opts) => {
    if (info.private) { return false; }
    return info;
  });


  if (!fs.existsSync(config.logdir)) {
    fs.mkdirSync(config.logdir);
  }
  

  options.file.filename=config.logdir+'/error.log',
  logger = createLogger({
   format: format.combine(
     timestamp(),
     ignorePrivate(),
     format.json()
   ),
    defaultMeta: { service: ApplicationName },
       transports: [
         new transports.File(options.file),
         new transports.Console(options.console)
       ],
       exitOnError: false, // do not exit on handled exceptions
       exceptionHandlers: [
         new transports.File({ filename: config.logdir+'/exceptions.log' })
       ]
    });

  export default logger