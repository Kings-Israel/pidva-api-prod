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
exports.validateToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * generates JWT used for local testing
 */
const publicKey = fs.readFileSync(path.join(__dirname, '../../public.pem'));
const privateKey = fs.readFileSync(path.join(__dirname, '../../private.pem'));
// for now wil put security keys in the same folder later somewhere else
const passphrase = process.env.PASSPHRASE || 'top secret';
const signInOptions = {
    issuer: 'Peleza',
    subject: 'info@peleza.co.ke',
    algorithm: 'RS256',
    expiresIn: '30d',
};
const verifyOption = {
    issuer: 'Peleza',
    subject: 'info@peleza.co.ke',
    algorithms: ['RS256'],
    expiresIn: '30d',
};
const generateToken = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, jsonwebtoken_1.sign)(payload, { key: privateKey, passphrase: passphrase }, signInOptions);
});
exports.generateToken = generateToken;
const verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let tokenData = (0, jsonwebtoken_1.verify)(token, publicKey, verifyOption);
            return resolve(tokenData);
        }
        catch (err) {
            return reject(err);
        }
    }));
});
exports.verifyToken = verifyToken;
/**
 * checks if JWT token is valid
 *
 * @param token the expected token payload
 */
function validateToken(token) {
    const verifyOptions = {
        algorithms: ['RS256'],
    };
    return new Promise((resolve, reject) => {
        (0, jsonwebtoken_1.verify)(token, publicKey, verifyOptions, (error, decoded) => {
            if (error)
                return reject(error);
            resolve(decoded);
        });
    });
}
exports.validateToken = validateToken;
