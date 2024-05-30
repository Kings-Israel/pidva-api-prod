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
const mysql_connector_1 = require("../config/mysql.connector");
const querries_1 = require("../repo/querries");
exports.default = (router) => {
    router.get("/details/:ref", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(" == Fetching details for ref == ", req.params.ref);
            if (!req.params.ref) {
                throw new Error(" Reference is Required ");
            }
            const details = yield BussinesLogicService.fetchDetailsByRef(req.params.ref);
            return res.status(200).json(details);
        }
        catch (error) {
            return res.status(502).json(error.message);
        }
    }));
    router.get("/ourrequest/:ref", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.params.ref) {
                throw new Error(" Reference is Required ");
            }
            const details = yield BussinesLogicService.FetchPeldataByClientRef(req.params.ref);
            return res.status(200).json(details);
        }
        catch (error) {
            return res.status(502).json(error.message);
        }
    }));
    router.get("/requests/:type?", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const tkn = req.body.token || req.header("token");
        const client_id = req.body.client_id || req.header("client_id");
        if (!tkn) {
            const errMsg = {
                message: "token missing in header",
            };
            return res.status(403).json(errMsg);
        }
        if (!client_id) {
            const errMsg = {
                message: "Pass client id in header",
            };
            return res.status(403).json(errMsg);
        }
        const type = req.params.type;
        const CompanyResult = (yield (0, mysql_connector_1.execute)(querries_1.PelezaQueries.FetchCompany, [client_id]))[0];
        const details = yield BussinesLogicService.FetchPeldataByCompany(CompanyResult.company_name);
        const pel_search_ids = [];
        details.forEach((detail) => {
            pel_search_ids.push(detail.request_ref_number);
        });
        const company_details = yield BussinesLogicService.FetchPelCompanyData(pel_search_ids);
        let data = [];
        if (type == "llc") {
            data = company_details.filter((detail) => {
                !detail.registration_number.startsWith("PVT");
            });
        }
        else if (type === "proprietor") {
            data = company_details.filter((detail) => {
                !detail.registration_number.startsWith("BN");
            });
        }
        else {
            data = company_details;
        }
        return res.status(200).json(data);
    }));
    // api to retry callback
    router.post("/retrycallback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tkn = req.body.token || req.header("token");
            if (!tkn) {
                const errMsg = {
                    message: "token missing in header",
                };
                return res.status(403).json(errMsg);
            }
            const tknData = yield (0, api_security_1.verifyToken)(tkn);
            if (!req.body.request_id) {
                throw new Error(" request id is required ");
            }
            yield BussinesLogicService.processQueueMessage(req.body.request_id);
            return res.status(200).json({ status: "success" });
        }
        catch (e) {
            const errMsg = {
                message: e.message,
            };
            return res.status(502).json(errMsg);
        }
    }));
};
