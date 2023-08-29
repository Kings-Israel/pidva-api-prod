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
exports.ValidateSingleRequest = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv = new ajv_1.default();
const schema = {
    type: "object",
    properties: {
        client_number: { type: "string" },
        dataset_citizenship: { type: "string" },
        dataset_name: { type: "string" },
        module_code: { type: "string" },
        package_id: { type: "number" },
        registration_number: { type: "string" },
        req_plan: { type: "string" },
    },
    required: ["client_number", "dataset_citizenship", "dataset_name", "module_code", "package_id", "registration_number", "req_plan"],
    additionalProperties: false
};
const singleValidator = ajv.compile(schema);
//const BatchValidator = ajv.compile(Batchschema);
const ValidateSingleRequest = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield validateRequest(data, singleValidator);
});
exports.ValidateSingleRequest = ValidateSingleRequest;
/*
 export const ValidateBatchRequest = async (data:[any]) => {
    return await validateRequest(data,BatchValidator);
};
*/
const validateRequest = (data, validator) => {
    return new Promise((resolve, reject) => {
        try {
            if (validator(data)) {
                resolve(data);
            }
            else {
                reject(validator.errors[0]);
            }
        }
        catch (err) {
            reject(err);
        }
    });
};
