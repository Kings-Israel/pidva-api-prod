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
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = exports.sendCallback = void 0;
const https = __importStar(require("https"));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const sendCallback = (callbackUrl, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var request_url = new URL(callbackUrl);
        let Callbackdata = JSON.stringify(data);
        const options = {
            protocol: request_url.protocol,
            hostname: request_url.hostname,
            port: request_url.port,
            path: request_url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Callbackdata.length
            }
        };
        return yield (0, exports.send)(options, Callbackdata);
    }
    catch (err) {
        // here check if status is 500 and iff true update number of tries as 
        // retry(sendCallback(callbackUrl,data),3)
        throw err;
    }
});
exports.sendCallback = sendCallback;
const retry = (callback, times = 3) => {
    let numberOfTries = 0;
    return new Promise((resolve) => {
        const interval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            numberOfTries++;
            if (numberOfTries === times) {
                console.log(`Trying for the last time... (${times})`);
                clearInterval(interval);
            }
            try {
                yield callback();
                clearInterval(interval);
                console.log(`Operation successful, retried ${numberOfTries} times.`);
                resolve("ok");
            }
            catch (err) {
                console.log(`Unsuccessful, retried ${numberOfTries} times... ${err}`);
            }
        }), 10000); // retry after 10 sec
    });
};
const send = (options, data) => {
    return new Promise((resolve, reject) => {
        try {
            const req = https.request(options, res => {
                console.log(`statusCode: ${res.statusCode}`);
                if (res.statusCode !== 200) {
                    return reject(" Invalid status code ");
                }
                //    
                res.on('data', d => {
                    return resolve(d);
                });
            });
            req.on('error', error => {
                return reject(error);
            });
            req.write(data);
            req.end();
        }
        catch (err) {
            return reject(err);
        }
    });
};
exports.send = send;
