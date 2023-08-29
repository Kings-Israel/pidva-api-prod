"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { timestamp } = winston_1.format;
const path = __importStar(require("path"));
const fs_1 = __importDefault(require("fs"));
const rootPath = path.normalize(__dirname + '../../');
const env = (process.env.NODE_ENV = process.env.NODE_ENV || 'development');
var ApplicationName = process.env.AMQPTS_APPLICATIONNAME ||
    (path.parse ? path.parse(process.argv[1]).name : path.basename(process.argv[1]));
var logger;
const config = {
    logdir: process.env.LOGDIR || rootPath + 'log',
    log_api_request: process.env.LOG_API_REQUEST || 'true',
    log_api_response: process.env.LOG_API_RESPONSE || 'true',
    logstash_host: process.env.LOGSTASH_HOST || '3.121.237.159',
    logstash_port: process.env.LOGSTASH_PORT || '2222',
    log_level: process.env.LOG_LEVEL || 'debug',
};
var options = {
    file: {
        level: 'error',
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: 5,
        colorize: false,
        filename: ""
    },
    console: {
        level: 'verbose',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
    filename: ""
};
const ignorePrivate = (0, winston_1.format)((info, opts) => {
    if (info.private) {
        return false;
    }
    return info;
});
if (!fs_1.default.existsSync(config.logdir)) {
    fs_1.default.mkdirSync(config.logdir);
}
options.file.filename = config.logdir + '/error.log',
    logger = (0, winston_1.createLogger)({
        format: winston_1.format.combine(timestamp(), ignorePrivate(), winston_1.format.json()),
        defaultMeta: { service: ApplicationName },
        transports: [
            new winston_1.transports.File(options.file),
            new winston_1.transports.Console(options.console)
        ],
        exitOnError: false,
        exceptionHandlers: [
            new winston_1.transports.File({ filename: config.logdir + '/exceptions.log' })
        ]
    });
exports.default = logger;
