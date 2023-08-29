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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (router) => {
    // app.use('/request/single', route);
    router.post('/simulation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.body.request_id) {
                throw new Error(" request id is required ");
            }
            //  TestService.testSimulation(req.body.request_id);
            let responseStatus = {
                message: "sim"
            };
            return res.status(200).json(responseStatus);
        }
        catch (e) {
            console.log(" errr ", e);
            let errMsg = {
                message: e.message
            };
            return res.status(502).json(errMsg);
        }
    }));
    router.post('/testCallback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(" === Local Callback Called ====");
            console.log(req.body);
            console.log(" === Local Callback Called ====");
            let responseStatus = {
                message: "sim"
            };
            return res.status(200).json(responseStatus);
        }
        catch (e) {
            console.log(" errr ", e);
            return res.status(502).json(e);
        }
    }));
};
