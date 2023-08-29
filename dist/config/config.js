"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RABBITMQ = exports.DATA_SOURCES = void 0;
exports.DATA_SOURCES = {
    mySqlDataSource: {
        DB_HOST: process.env.MY_SQL_DB_HOST,
        DB_USER: process.env.MY_SQL_DB_USER,
        DB_PASSWORD: process.env.MY_SQL_DB_PASSWORD,
        DB_PORT: process.env.MY_SQL_DB_PORT,
        DB_DATABASE: process.env.MY_SQL_DB_DATABASE,
        DB_CONNECTION_LIMIT: process.env.MY_SQL_DB_CONNECTION_LIMIT ? parseInt(process.env.MY_SQL_DB_CONNECTION_LIMIT) : 4,
    }
};
exports.RABBITMQ = {
    port: process.env.QUEUE_PORT || '5672',
    user: process.env.QUEUE_USER || 'peleza',
    pass: process.env.QUEUE_PASS || 'peleza123!',
    host: process.env.QUEUE_HOST || 'localhost',
    vhost: process.env.QUEUE_VHOST || 'peleza',
};
