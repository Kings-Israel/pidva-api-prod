"use strict";
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
const fs_1 = __importDefault(require("fs"));
exports.default = (router) => {
    router.post('/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(" callback received ", req.body);
            let data = JSON.stringify(req.body);
            fs_1.default.writeFileSync('latest-callback.json', data);
            return res.status(200).json({ status: "received" });
        }
        catch (err) {
            return res.status(502).json(err);
        }
    }));
    router.get('/latest-callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let rawdata = fs_1.default.readFileSync('latest-callback.json');
            let latestData = JSON.parse(rawdata.toString());
            return res.status(200).json(latestData);
        }
        catch (err) {
            return res.status(502).json(err);
        }
    }));
    router.get('/callbackview', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let rawdata = fs_1.default.readFileSync('latest-callback.json');
            let latestData = JSON.parse(rawdata.toString());
            return res.render('pages/index', latestData);
        }
        catch (err) {
            return res.render('pages/error');
        }
    }));
};
