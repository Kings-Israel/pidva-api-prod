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
const BussinesLogicService = __importStar(require("../services/logic.service"));
const api_security_1 = require("../security/api.security");
exports.default = (router) => {
    router.post('/batch', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tkn = req.body.token || req.header('token');
            if (!tkn) {
                const errMsg = {
                    message: 'token missing in header'
                };
                return res.status(403).json(errMsg);
            }
            const tknData = yield (0, api_security_1.verifyToken)(tkn);
            if (!req.body.client_reference) {
                throw new Error(" client_reference missing ");
            }
            if (!req.body.callback) {
                throw new Error(" callback missing ");
            }
            if (!req.body.terms_and_condition || req.body.terms_and_condition == false) {
                throw new Error(" terms_and_condition missing or is false (should be true)");
            }
            if (!req.body.validation_data) {
                throw new Error(" validation_data missing ");
            }
            const apiReq = {
                company_name: tknData.company_name,
                client_number: tknData.client_reference,
                client_id: tknData.client_id,
                user_id: tknData.user_id,
                user_name: tknData.user_name,
                request_type: "batch",
                request_sub_type: "batch_data",
                client_reference: req.body.client_reference,
                channel: "api",
                callback_url: req.body.callback,
                number_of_records: req.body.validation_data.length,
                upload_path: "N/A",
                validation_data: req.body.validation_data,
                client_login_id: tknData.client_company_id
            };
            const systemRefrence = yield BussinesLogicService.saveApiRequest(apiReq);
            const responseStatus = {
                "status": "success",
                "reference": systemRefrence
            };
            return res.status(200).json(responseStatus);
        }
        catch (e) {
            console.log(" error : ", e);
            const errMsg = {
                message: e.message
            };
            return res.status(502).json(errMsg);
        }
    }));
    // return route;
};
