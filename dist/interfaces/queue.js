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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Binding = exports.Queue = exports.Exchange = exports.Message = exports.Connection = exports.log = void 0;
const AmqpLib = __importStar(require("amqplib/callback_api"));
//import * as Promise from "bluebird";
const logger_1 = __importDefault(require("../utilities/logger"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const events_1 = require("events");
let ApplicationName = process.env.AMQPTS_APPLICATIONNAME ||
    (path.parse ? path.parse(process.argv[1]).name : path.basename(process.argv[1]));
// create a custom winston logger for amqp-ts
exports.log = logger_1.default;
// name for the RabbitMQ direct reply-to queue
const DIRECT_REPLY_TO_QUEUE = "amq.rabbitmq.reply-to";
//----------------------------------------------------------------------------------------------------
// Connection class
//----------------------------------------------------------------------------------------------------
class Connection extends events_1.EventEmitter {
    constructor(url = "amqp://localhost", socketOptions = {}, reconnectStrategy = { retries: 0, interval: 1500 }) {
        super();
        this.connectedBefore = false;
        this._rebuilding = false;
        this._isClosing = false;
        this.isConnected = false;
        this.url = url;
        this.socketOptions = socketOptions;
        this.reconnectStrategy = reconnectStrategy;
        this._exchanges = {};
        this._queues = {};
        this._bindings = {};
        this.rebuildConnection();
    }
    rebuildConnection() {
        if (this._rebuilding) { // only one rebuild process can be active at any time
            exports.log.log("debug", "Connection rebuild already in progress, joining active rebuild attempt.", { module: "amqp-ts" });
            return this.initialized;
        }
        this._retry = -1;
        this._rebuilding = true;
        this._isClosing = false;
        // rebuild the connection
        this.initialized = new Promise((resolve, reject) => {
            this.tryToConnect(this, 0, (err) => {
                /* istanbul ignore if */
                if (err) {
                    this._rebuilding = false;
                    reject(err);
                }
                else {
                    this._rebuilding = false;
                    if (this.connectedBefore) {
                        exports.log.log("warn", "Connection re-established", { module: "amqp-ts" });
                        this.emit("re_established_connection");
                    }
                    else {
                        exports.log.log("info", "Connection established.", { module: "amqp-ts" });
                        this.emit("open_connection");
                        this.connectedBefore = true;
                    }
                    resolve();
                }
            });
        });
        /* istanbul ignore next */
        this.initialized.catch((err) => {
            exports.log.log("warn", "Error creating connection!", { module: "amqp-ts" });
            this.emit("error_connection", err);
            //throw (err);
        });
        return this.initialized;
    }
    tryToConnect(thisConnection, retry, callback) {
        AmqpLib.connect(thisConnection.url, thisConnection.socketOptions, (err, connection) => {
            /* istanbul ignore if */
            if (err) {
                thisConnection.isConnected = false;
                // only do every retry once, amqplib can return multiple connection errors for one connection request (error?)
                if (retry <= this._retry) {
                    //amqpts_log.log("warn" , "Double retry " + retry + ", skipping.", {module: "amqp-ts"});
                    return;
                }
                exports.log.log("warn", "Connection failed.", { module: "amqp-ts" });
                this._retry = retry;
                if (thisConnection.reconnectStrategy.retries === 0 || thisConnection.reconnectStrategy.retries > retry) {
                    exports.log.log("warn", "Connection retry " + (retry + 1) + " in " + thisConnection.reconnectStrategy.interval + "ms", { module: "amqp-ts" });
                    thisConnection.emit("trying_connect");
                    setTimeout(thisConnection.tryToConnect, thisConnection.reconnectStrategy.interval, thisConnection, retry + 1, callback);
                }
                else { //no reconnect strategy, or retries exhausted, so return the error
                    exports.log.log("warn", "Connection failed, exiting: No connection retries left (retry " + retry + ").", { module: "amqp-ts" });
                    callback(err);
                }
            }
            else {
                let restart = (err) => {
                    exports.log.log("debug", "Connection error occurred.", { module: "amqp-ts" });
                    connection.removeListener("error", restart);
                    //connection.removeListener("end", restart); // not sure this is needed
                    thisConnection._rebuildAll(err); //try to rebuild the topology when the connection  unexpectedly closes
                };
                let onClose = () => {
                    connection.removeListener("close", onClose);
                    if (!this._isClosing) {
                        thisConnection.emit("lost_connection");
                        restart(new Error("Connection closed by remote host"));
                    }
                };
                connection.on("error", restart);
                connection.on("close", onClose);
                //connection.on("end", restart); // not sure this is needed
                thisConnection._connection = connection;
                thisConnection.isConnected = true;
                callback(null);
            }
        });
    }
    _rebuildAll(err) {
        exports.log.log("warn", "Connection error: " + err.message, { module: "amqp-ts" });
        exports.log.log("debug", "Rebuilding connection NOW.", { module: "amqp-ts" });
        this.rebuildConnection();
        //re initialize exchanges, queues and bindings if they exist
        for (let exchangeId in this._exchanges) {
            let exchange = this._exchanges[exchangeId];
            exports.log.log("debug", "Re-initialize Exchange '" + exchange._name + "'.", { module: "amqp-ts" });
            exchange._initialize();
        }
        for (let queueId in this._queues) {
            let queue = this._queues[queueId];
            let consumer = queue._consumer;
            exports.log.log("debug", "Re-initialize queue '" + queue._name + "'.", { module: "amqp-ts" });
            queue._initialize();
            /* if (consumer) {
               log.log("debug", "Re-initialize consumer for queue '" + queue._name + "'.", { module: "amqp-ts" });
               queue._initializeConsumer();
             }
             */
        }
        for (let bindingId in this._bindings) {
            let binding = this._bindings[bindingId];
            exports.log.log("debug", "Re-initialize binding from '" + binding._source._name + "' to '" +
                binding._destination._name + "'.", { module: "amqp-ts" });
            binding._initialize();
        }
        return new Promise((resolve, reject) => {
            this.completeConfiguration().then(() => {
                exports.log.log("debug", "Rebuild success.", { module: "amqp-ts" });
                resolve();
            }, /* istanbul ignore next */ (rejectReason) => {
                exports.log.log("debug", "Rebuild failed.", { module: "amqp-ts" });
                reject(rejectReason);
            });
        });
    }
    close() {
        this._isClosing = true;
        return new Promise((resolve, reject) => {
            this.initialized.then(() => {
                this._connection.close(err => {
                    /* istanbul ignore if */
                    if (err) {
                        reject(err);
                    }
                    else {
                        this.isConnected = false;
                        this.emit("close_connection");
                        resolve();
                    }
                });
            });
        });
    }
    /**
     * Make sure the whole defined connection topology is configured:
     * return promise that fulfills after all defined exchanges, queues and bindings are initialized
     */
    completeConfiguration() {
        let promises = [];
        for (let exchangeId in this._exchanges) {
            let exchange = this._exchanges[exchangeId];
            promises.push(exchange.initialized);
        }
        for (let queueId in this._queues) {
            let queue = this._queues[queueId];
            promises.push(queue.initialized);
            if (queue._consumerInitialized) {
                promises.push(queue._consumerInitialized);
            }
        }
        for (let bindingId in this._bindings) {
            let binding = this._bindings[bindingId];
            promises.push(binding.initialized);
        }
        return Promise.all(promises);
    }
    /**
     * Delete the whole defined connection topology:
     * return promise that fulfills after all defined exchanges, queues and bindings have been removed
     */
    deleteConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            let promises = [];
            for (let bindingId in this._bindings) {
                let binding = this._bindings[bindingId];
                promises.push(binding.delete());
            }
            for (let queueId in this._queues) {
                let queue = this._queues[queueId];
                if (yield queue._consumerInitialized) {
                    promises.push(queue.stopConsumer());
                }
                promises.push(queue.delete());
            }
            for (let exchangeId in this._exchanges) {
                let exchange = this._exchanges[exchangeId];
                promises.push(exchange.delete());
            }
            return Promise.all(promises);
        });
    }
    declareExchange(name, type, options) {
        let exchange = this._exchanges[name];
        if (exchange === undefined) {
            exchange = new Exchange(this, name, type, options);
        }
        return exchange;
    }
    declareQueue(name, options) {
        let queue = this._queues[name];
        if (queue === undefined) {
            queue = new Queue(this, name, options);
        }
        return queue;
    }
    declareTopology(topology) {
        let promises = [];
        let i;
        let len;
        if (topology.exchanges !== undefined) {
            for (i = 0, len = topology.exchanges.length; i < len; i++) {
                let exchange = topology.exchanges[i];
                promises.push(this.declareExchange(exchange.name, exchange.type, exchange.options).initialized);
            }
        }
        if (topology.queues !== undefined) {
            for (i = 0, len = topology.queues.length; i < len; i++) {
                let queue = topology.queues[i];
                promises.push(this.declareQueue(queue.name, queue.options).initialized);
            }
        }
        if (topology.bindings !== undefined) {
            for (i = 0, len = topology.bindings.length; i < len; i++) {
                let binding = topology.bindings[i];
                let source = this.declareExchange(binding.source);
                let destination;
                if (binding.exchange !== undefined) {
                    destination = this.declareExchange(binding.exchange);
                }
                else {
                    destination = this.declareQueue(binding.queue || "");
                }
                promises.push(destination.bind(source, binding.pattern, binding.args));
            }
        }
        return Promise.all(promises);
    }
    get getConnection() {
        return this._connection;
    }
}
exports.Connection = Connection;
(function (Connection) {
    "use strict";
})(Connection = exports.Connection || (exports.Connection = {}));
//----------------------------------------------------------------------------------------------------
// Message class
//----------------------------------------------------------------------------------------------------
class Message {
    constructor(content, options = {}) {
        this.properties = options;
        if (content !== undefined) {
            this.setContent(content);
        }
    }
    setContent(content) {
        if (typeof content === "string") {
            this.content = new Buffer(content);
        }
        else if (!(content instanceof Buffer)) {
            this.content = new Buffer(JSON.stringify(content));
            this.properties.contentType = "application/json";
        }
        else {
            this.content = content;
        }
    }
    getContent() {
        let content = this.content.toString();
        if (this.properties.contentType === "application/json") {
            content = JSON.parse(content);
        }
        return content;
    }
    sendTo(destination, routingKey = "") {
        return __awaiter(this, void 0, void 0, function* () {
            // inline function to send the message
            let sendMessage = () => {
                try {
                    destination._channel.publish(exchange, routingKey, this.content, this.properties);
                }
                catch (err) {
                    exports.log.log("debug", "Publish error: " + err.message, { module: "amqp-ts" });
                    let destinationName = destination._name;
                    let connection = destination._connection;
                    exports.log.log("debug", "Try to rebuild connection, before Call.", { module: "amqp-ts" });
                    connection._rebuildAll(err).then(() => {
                        exports.log.log("debug", "Retransmitting message.", { module: "amqp-ts" });
                        if (destination instanceof Queue) {
                            connection._queues[destinationName].publish(this.content, this.properties);
                        }
                        else {
                            connection._exchanges[destinationName].publish(this.content, routingKey, this.properties);
                        }
                    });
                }
            };
            let exchange;
            if (destination instanceof Queue) {
                exchange = "";
                routingKey = destination._name;
            }
            else {
                exchange = destination._name;
            }
            // execute sync when possible
            if (yield destination.initialized) {
                sendMessage();
            }
            else {
                destination.initialized.then(sendMessage);
            }
        });
    }
    ack(allUpTo) {
        if (this._channel !== undefined) {
            this._channel.ack(this._message, allUpTo);
        }
    }
    nack(allUpTo, requeue) {
        if (this._channel !== undefined) {
            this._channel.nack(this._message, allUpTo, requeue);
        }
    }
    reject(requeue = false) {
        if (this._channel !== undefined) {
            this._channel.reject(this._message, requeue);
        }
    }
}
exports.Message = Message;
//----------------------------------------------------------------------------------------------------
// Exchange class
//----------------------------------------------------------------------------------------------------
class Exchange {
    constructor(connection, name, type, options = {}) {
        this._consumer_handlers = new Array();
        this._isConsumerInitializedRcp = false;
        this._connection = connection;
        this._name = name;
        this._type = type || "";
        this._options = options;
        this._initialize();
    }
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    _initialize() {
        this.initialized = new Promise((resolve, reject) => {
            this._connection.initialized.then(() => {
                this._connection._connection.createChannel((err, channel) => {
                    /* istanbul ignore if */
                    if (err) {
                        reject(err);
                    }
                    else {
                        this._channel = channel;
                        let callback = (err, ok) => {
                            /* istanbul ignore if */
                            if (err) {
                                exports.log.log("error", "Failed to create exchange '" + this._name + "'.", { module: "amqp-ts" });
                                delete this._connection._exchanges[this._name];
                                reject(err);
                            }
                            else {
                                resolve(ok);
                            }
                        };
                        if (this._options.noCreate) {
                            this._channel.checkExchange(this._name, callback);
                        }
                        else {
                            this._channel.assertExchange(this._name, this._type, this._options, callback);
                        }
                    }
                });
            }).catch((err) => {
                exports.log.log("warn", "Channel failure, error caused during connection!", { module: "amqp-ts" });
            });
        });
        this._connection._exchanges[this._name] = this;
    }
    /**
     * deprecated, use 'exchange.send(message: Message, routingKey?: string)' instead
     */
    publish(content, routingKey = "", options = {}) {
        if (typeof content === "string") {
            content = new Buffer(content);
        }
        else if (!(content instanceof Buffer)) {
            content = new Buffer(JSON.stringify(content));
            options.contentType = options.contentType || "application/json";
        }
        this.initialized.then(() => {
            try {
                this._channel.publish(this._name, routingKey, content, options);
            }
            catch (err) {
                exports.log.log("warn", "Exchange publish error: " + err.message, { module: "amqp-ts" });
                let exchangeName = this._name;
                let connection = this._connection;
                connection._rebuildAll(err).then(() => {
                    exports.log.log("debug", "Retransmitting message.", { module: "amqp-ts" });
                    connection._exchanges[exchangeName].publish(content, routingKey, options);
                });
            }
        });
    }
    send(message, routingKey = "") {
        message.sendTo(this, routingKey);
    }
    rpc(requestParameters, routingKey = "", callback) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            function generateUuid() {
                return Math.random().toString() +
                    Math.random().toString() +
                    Math.random().toString();
            }
            let processRpc = () => {
                let uuid = generateUuid();
                if (!this._isConsumerInitializedRcp) {
                    this._isConsumerInitializedRcp = true;
                    this._channel.consume(DIRECT_REPLY_TO_QUEUE, (resultMsg) => {
                        let result = new Message(resultMsg.content, resultMsg.fields);
                        result.fields = resultMsg.fields;
                        for (let handler of this._consumer_handlers) {
                            if (handler[0] === resultMsg.properties.correlationId) {
                                let func = handler[1];
                                func.apply("", [undefined, result]);
                            }
                        }
                    }, { noAck: true }, (err, ok) => {
                        /* istanbul ignore if */
                        if (err) {
                            reject(new Error("amqp-ts: Queue.rpc error: " + err.message));
                        }
                        else {
                            // send the rpc request
                            this._consumer_handlers.push([uuid, callback]);
                            // consumerTag = ok.consumerTag;
                            let message = new Message(requestParameters, { correlationId: uuid, replyTo: DIRECT_REPLY_TO_QUEUE });
                            message.sendTo(this, routingKey);
                        }
                    });
                }
                else {
                    this._consumer_handlers.push([uuid, callback]);
                    let message = new Message(requestParameters, { correlationId: uuid, replyTo: DIRECT_REPLY_TO_QUEUE });
                    message.sendTo(this, routingKey);
                }
            };
            // execute sync when possible
            if (yield this.initialized) {
                processRpc();
            }
            else {
                this.initialized.then(processRpc);
            }
        }));
    }
    delete() {
        if (this._deleting === undefined) {
            this._deleting = new Promise((resolve, reject) => {
                this.initialized.then(() => {
                    return Binding.removeBindingsContaining(this);
                }).then(() => {
                    this._channel.deleteExchange(this._name, {}, (err, ok) => {
                        /* istanbul ignore if */
                        if (err) {
                            reject(err);
                        }
                        else {
                            this._channel.close((err) => {
                                //  delete this.initialized; // invalidate exchange
                                delete this._connection._exchanges[this._name]; // remove the exchange from our administration
                                /* istanbul ignore if */
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    delete this._channel;
                                    //  delete this._connection;
                                    resolve();
                                }
                            });
                        }
                    });
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        return this._deleting;
    }
    close() {
        if (this._closing === undefined) {
            this._closing = new Promise((resolve, reject) => {
                this.initialized.then(() => {
                    return Binding.removeBindingsContaining(this);
                }).then(() => {
                    //  delete this.initialized; // invalidate exchange
                    delete this._connection._exchanges[this._name]; // remove the exchange from our administration
                    this._channel.close((err) => {
                        /* istanbul ignore if */
                        if (err) {
                            reject(err);
                        }
                        else {
                            delete this._channel;
                            //    delete this._connection;
                            resolve();
                        }
                    });
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        return this._closing;
    }
    bind(source, pattern = "", args = {}) {
        let binding = new Binding(this, source, pattern, args);
        return binding.initialized;
    }
    unbind(source, pattern = "", args = {}) {
        return this._connection._bindings[Binding.id(this, source, pattern)].delete();
    }
    consumerQueueName() {
        return this._name + "." + ApplicationName + "." + os.hostname() + "." + process.pid;
    }
    /**
     * deprecated, use 'exchange.activateConsumer(...)' instead
     */
    startConsumer(onMessage, options) {
        let queueName = this.consumerQueueName();
        if (this._connection._queues[queueName]) {
            return new Promise((_, reject) => {
                reject(new Error("amqp-ts Exchange.startConsumer error: consumer already defined"));
            });
        }
        else {
            let promises = [];
            let queue = this._connection.declareQueue(queueName, { durable: false });
            promises.push(queue.initialized);
            let binding = queue.bind(this);
            promises.push(binding);
            let consumer = queue.startConsumer(onMessage, options);
            promises.push(consumer);
            return Promise.all(promises);
        }
    }
    activateConsumer(onMessage, options) {
        let queueName = this.consumerQueueName();
        if (this._connection._queues[queueName]) {
            return new Promise((_, reject) => {
                reject(new Error("amqp-ts Exchange.activateConsumer error: consumer already defined"));
            });
        }
        else {
            let promises = [];
            let queue = this._connection.declareQueue(queueName, { durable: false });
            promises.push(queue.initialized);
            let binding = queue.bind(this);
            promises.push(binding);
            let consumer = queue.activateConsumer(onMessage, options);
            promises.push(consumer);
            return Promise.all(promises);
        }
    }
    stopConsumer() {
        let queue = this._connection._queues[this.consumerQueueName()];
        if (queue) {
            return queue.delete();
        }
        else {
            return Promise.resolve();
        }
    }
}
exports.Exchange = Exchange;
(function (Exchange) {
    "use strict";
})(Exchange = exports.Exchange || (exports.Exchange = {}));
//----------------------------------------------------------------------------------------------------
// Queue class
//----------------------------------------------------------------------------------------------------
class Queue {
    constructor(connection, name, options = {}) {
        this._connection = connection;
        this._name = name;
        this._options = options;
        this._connection._queues[this._name] = this;
        this._initialize();
    }
    get name() {
        return this._name;
    }
    _initialize() {
        this.initialized = new Promise((resolve, reject) => {
            this._connection.initialized.then(() => {
                this._connection._connection.createChannel((err, channel) => {
                    /* istanbul ignore if */
                    if (err) {
                        reject(err);
                    }
                    else {
                        this._channel = channel;
                        let callback = (err, ok) => {
                            /* istanbul ignore if */
                            if (err) {
                                exports.log.log("error", "Failed to create queue '" + this._name + "'.", { module: "amqp-ts" });
                                delete this._connection._queues[this._name];
                                reject(err);
                            }
                            else {
                                if (this._options.prefetch) {
                                    this._channel.prefetch(this._options.prefetch);
                                }
                                resolve(ok);
                            }
                        };
                        if (this._options.noCreate) {
                            this._channel.checkQueue(this._name, callback);
                        }
                        else {
                            this._channel.assertQueue(this._name, this._options, callback);
                        }
                    }
                });
            }).catch((err) => {
                exports.log.log("warn", "Channel failure, error caused during connection!", { module: "amqp-ts" });
            });
        });
    }
    static _packMessageContent(content, options) {
        if (typeof content === "string") {
            content = new Buffer(content);
        }
        else if (!(content instanceof Buffer)) {
            content = new Buffer(JSON.stringify(content));
            options.contentType = "application/json";
        }
        return content;
    }
    static _unpackMessageContent(msg) {
        let content = msg.content.toString();
        if (msg.properties.contentType === "application/json") {
            content = JSON.parse(content);
        }
        return content;
    }
    /**
     * deprecated, use 'queue.send(message: Message)' instead
     */
    publish(content, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // inline function to send the message
            let sendMessage = () => {
                try {
                    this._channel.sendToQueue(this._name, content, options);
                }
                catch (err) {
                    exports.log.log("debug", "Queue publish error: " + err.message, { module: "amqp-ts" });
                    let queueName = this._name;
                    let connection = this._connection;
                    exports.log.log("debug", "Try to rebuild connection, before Call.", { module: "amqp-ts" });
                    connection._rebuildAll(err).then(() => {
                        exports.log.log("debug", "Retransmitting message.", { module: "amqp-ts" });
                        connection._queues[queueName].publish(content, options);
                    });
                }
            };
            content = Queue._packMessageContent(content, options);
            // execute sync when possible
            if (yield this.initialized) {
                sendMessage();
            }
            else {
                this.initialized.then(sendMessage);
            }
        });
    }
    send(message) {
        message.sendTo(this);
    }
    rpc(requestParameters) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let processRpc = () => {
                let consumerTag;
                this._channel.consume(DIRECT_REPLY_TO_QUEUE, (resultMsg) => {
                    this._channel.cancel(consumerTag);
                    let result = new Message(resultMsg.content, resultMsg.fields);
                    result.fields = resultMsg.fields;
                    resolve(result);
                }, { noAck: true }, (err, ok) => {
                    /* istanbul ignore if */
                    if (err) {
                        reject(new Error("amqp-ts: Queue.rpc error: " + err.message));
                    }
                    else {
                        // send the rpc request
                        consumerTag = ok.consumerTag;
                        let message = new Message(requestParameters, { replyTo: DIRECT_REPLY_TO_QUEUE });
                        message.sendTo(this);
                    }
                });
            };
            // execute sync when possible
            if (yield this.initialized) {
                processRpc();
            }
            else {
                this.initialized.then(processRpc);
            }
        }));
    }
    prefetch(count) {
        this.initialized.then(() => {
            this._channel.prefetch(count);
            this._options.prefetch = count;
        });
    }
    recover() {
        return new Promise((resolve, reject) => {
            this.initialized.then(() => {
                this._channel.recover((err, ok) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    /**
     * deprecated, use 'queue.activateConsumer(...)' instead
     */
    startConsumer(onMessage, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this._consumerInitialized) {
                return new Promise((_, reject) => {
                    reject(new Error("amqp-ts Queue.startConsumer error: consumer already defined"));
                });
            }
            this._isStartConsumer = true;
            this._rawConsumer = (options.rawMessage === true);
            delete options.rawMessage; // remove to avoid possible problems with amqplib
            this._consumerOptions = options;
            this._consumer = onMessage;
            this._initializeConsumer();
            return this._consumerInitialized;
        });
    }
    activateConsumer(onMessage, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this._consumerInitialized) {
                return new Promise((_, reject) => {
                    reject(new Error("amqp-ts Queue.activateConsumer error: consumer already defined"));
                });
            }
            this._consumerOptions = options;
            this._consumer = onMessage;
            this._initializeConsumer();
            return this._consumerInitialized;
        });
    }
    _initializeConsumer() {
        let processedMsgConsumer = (msg) => {
            try {
                /* istanbul ignore if */
                if (!msg) {
                    return; // ignore empty messages (for now)
                }
                let payload = Queue._unpackMessageContent(msg);
                let result = this._consumer(payload);
                // convert the result to a promise if it isn't one already
                Promise.resolve(result).then((resultValue) => {
                    // check if there is a reply-to
                    if (msg.properties.replyTo) {
                        let options = {};
                        resultValue = Queue._packMessageContent(resultValue, options);
                        this._channel.sendToQueue(msg.properties.replyTo, resultValue, options);
                    }
                    // 'hack' added to allow better manual ack control by client (less elegant, but should work)
                    if (this._consumerOptions.manualAck !== true && this._consumerOptions.noAck !== true) {
                        this._channel.ack(msg);
                    }
                }).catch((err) => {
                    exports.log.log("error", "Queue.onMessage RPC promise returned error: " + err.message, { module: "amqp-ts" });
                });
            }
            catch (err) {
                /* istanbul ignore next */
                exports.log.log("error", "Queue.onMessage consumer function returned error: " + err.message, { module: "amqp-ts" });
            }
        };
        let rawMsgConsumer = (msg) => {
            try {
                this._consumer(msg, this._channel);
            }
            catch (err) {
                /* istanbul ignore next */
                exports.log.log("error", "Queue.onMessage consumer function returned error: " + err.message, { module: "amqp-ts" });
            }
        };
        let activateConsumerWrapper = (msg) => {
            try {
                let message = new Message(msg.content, msg.properties);
                message.fields = msg.fields;
                message._message = msg;
                message._channel = this._channel;
                let result = this._consumer(message);
                // convert the result to a promise if it isn't one already
                Promise.resolve(result).then((resultValue) => {
                    // check if there is a reply-to
                    if (msg.properties.replyTo) {
                        if (!(resultValue instanceof Message)) {
                            resultValue = new Message(resultValue, {});
                        }
                        resultValue.properties.correlationId = msg.properties.correlationId;
                        this._channel.sendToQueue(msg.properties.replyTo, resultValue.content, resultValue.properties);
                    }
                }).catch((err) => {
                    exports.log.log("error", "Queue.onMessage RPC promise returned error: " + err.message, { module: "amqp-ts" });
                });
            }
            catch (err) {
                /* istanbul ignore next */
                exports.log.log("error", "Queue.onMessage consumer function returned error: " + err.message, { module: "amqp-ts" });
            }
        };
        this._consumerInitialized = new Promise((resolve, reject) => {
            this.initialized.then(() => {
                let consumerFunction = activateConsumerWrapper;
                if (this._isStartConsumer) {
                    consumerFunction = this._rawConsumer ? rawMsgConsumer : processedMsgConsumer;
                }
                this._channel.consume(this._name, consumerFunction, this._consumerOptions, (err, ok) => {
                    /* istanbul ignore if */
                    if (err) {
                        reject(err);
                    }
                    else {
                        this._consumerTag = ok.consumerTag;
                        resolve(ok);
                    }
                });
            });
        });
    }
    stopConsumer() {
        if (!this._consumerInitialized || this._consumerStopping) {
            return Promise.resolve();
        }
        this._consumerStopping = true;
        return new Promise((resolve, reject) => {
            this._consumerInitialized.then(() => {
                this._channel.cancel(this._consumerTag, (err, ok) => {
                    /* istanbul ignore if */
                    if (err) {
                        reject(err);
                    }
                    else {
                        // delete this._consumerInitialized;
                        // delete this._consumer;
                        // delete this._consumerOptions;
                        //  delete this._consumerStopping;
                        resolve();
                    }
                });
            });
        });
    }
    delete() {
        if (this._deleting === undefined) {
            this._deleting = new Promise((resolve, reject) => {
                this.initialized.then(() => {
                    return Binding.removeBindingsContaining(this);
                }).then(() => {
                    return this.stopConsumer();
                }).then(() => {
                    return this._channel.deleteQueue(this._name, {}, (err, ok) => {
                        /* istanbul ignore if */
                        if (err) {
                            reject(err);
                        }
                        else {
                            // delete this.initialized; // invalidate queue
                            delete this._connection._queues[this._name]; // remove the queue from our administration
                            this._channel.close((err) => {
                                /* istanbul ignore if */
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    delete this._channel;
                                    //  delete this._connection;
                                    resolve(ok);
                                }
                            });
                        }
                    });
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        return this._deleting;
    }
    close() {
        if (this._closing === undefined) {
            this._closing = new Promise((resolve, reject) => {
                this.initialized.then(() => {
                    return Binding.removeBindingsContaining(this);
                }).then(() => {
                    return this.stopConsumer();
                }).then(() => {
                    //delete this.initialized; // invalidate queue
                    delete this._connection._queues[this._name]; // remove the queue from our administration
                    this._channel.close((err) => {
                        /* istanbul ignore if */
                        if (err) {
                            reject(err);
                        }
                        else {
                            delete this._channel;
                            // delete this._connection;
                            resolve();
                        }
                    });
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        return this._closing;
    }
    bind(source, pattern = "", args = {}) {
        let binding = new Binding(this, source, pattern, args);
        return binding.initialized;
    }
    unbind(source, pattern = "", args = {}) {
        return this._connection._bindings[Binding.id(this, source, pattern)].delete();
    }
}
exports.Queue = Queue;
(function (Queue) {
    "use strict";
})(Queue = exports.Queue || (exports.Queue = {}));
//----------------------------------------------------------------------------------------------------
// Binding class
//----------------------------------------------------------------------------------------------------
class Binding {
    constructor(destination, source, pattern = "", args = {}) {
        this._source = source;
        this._destination = destination;
        this._pattern = pattern;
        this._args = args;
        this._destination._connection._bindings[Binding.id(this._destination, this._source, this._pattern)] = this;
        this._initialize();
    }
    _initialize() {
        this.initialized = new Promise((resolve, reject) => {
            if (this._destination instanceof Queue) {
                let queue = this._destination;
                queue.initialized.then(() => {
                    queue._channel.bindQueue(this._destination._name, this._source._name, this._pattern, this._args, (err, ok) => {
                        /* istanbul ignore if */
                        if (err) {
                            exports.log.log("error", "Failed to create queue binding (" +
                                this._source._name + "->" + this._destination._name + ")", { module: "amqp-ts" });
                            delete this._destination._connection._bindings[Binding.id(this._destination, this._source, this._pattern)];
                            reject(err);
                        }
                        else {
                            resolve(this);
                        }
                    });
                });
            }
            else {
                let exchange = this._destination;
                exchange.initialized.then(() => {
                    exchange._channel.bindExchange(this._destination._name, this._source._name, this._pattern, this._args, (err, ok) => {
                        /* istanbul ignore if */
                        if (err) {
                            exports.log.log("error", "Failed to create exchange binding (" +
                                this._source._name + "->" + this._destination._name + ")", { module: "amqp-ts" });
                            delete this._destination._connection._bindings[Binding.id(this._destination, this._source, this._pattern)];
                            reject(err);
                        }
                        else {
                            resolve(this);
                        }
                    });
                });
            }
        });
    }
    delete() {
        return new Promise((resolve, reject) => {
            if (this._destination instanceof Queue) {
                let queue = this._destination;
                queue.initialized.then(() => {
                    queue._channel.unbindQueue(this._destination._name, this._source._name, this._pattern, this._args, (err, ok) => {
                        /* istanbul ignore if */
                        if (err) {
                            reject(err);
                        }
                        else {
                            delete this._destination._connection._bindings[Binding.id(this._destination, this._source, this._pattern)];
                            resolve();
                        }
                    });
                });
            }
            else {
                let exchange = this._destination;
                exchange.initialized.then(() => {
                    exchange._channel.unbindExchange(this._destination._name, this._source._name, this._pattern, this._args, (err, ok) => {
                        /* istanbul ignore if */
                        if (err) {
                            reject(err);
                        }
                        else {
                            delete this._destination._connection._bindings[Binding.id(this._destination, this._source, this._pattern)];
                            resolve();
                        }
                    });
                });
            }
        });
    }
    static id(destination, source, pattern) {
        pattern = pattern || "";
        return "[" + source._name + "]to" + (destination instanceof Queue ? "Queue" : "Exchange") + "[" + destination._name + "]" + pattern;
    }
    static removeBindingsContaining(connectionPoint) {
        let connection = connectionPoint._connection;
        let promises = [];
        for (let bindingId in connection._bindings) {
            let binding = connection._bindings[bindingId];
            if (binding._source === connectionPoint || binding._destination === connectionPoint) {
                promises.push(binding.delete());
            }
        }
        return Promise.all(promises);
    }
}
exports.Binding = Binding;
