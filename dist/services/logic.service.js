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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientLogin = exports.processQueueMessage = exports.FetchPelCompanyData = exports.FetchPeldataByCompany = exports.testSimulation = exports.FetchPeldataByClientRef = exports.fetchDetailsByRef = exports.saveApiRequest = void 0;
const mysql_connector_1 = require("../config/mysql.connector");
const config_1 = require("../config/config");
const callback = __importStar(require("../interfaces/callback"));
const querries_1 = require("../repo/querries");
const service_report_1 = require("../report/service.report");
const crypto_1 = __importDefault(require("crypto"));
const Amqp = __importStar(require("../interfaces/queue"));
const request_validation_1 = require("../validations/request.validation");
const api_security_1 = require("../security/api.security");
function get_url() {
    const config = config_1.RABBITMQ;
    const queue_url = "amqp://" +
        config.user +
        ":" +
        config.pass +
        "@" +
        config.host +
        ":" +
        config.port +
        "/" +
        config.vhost;
    return queue_url;
}
const connection = new Amqp.Connection(get_url());
const exchange = connection.declareExchange("Peleza", "direct");
const queue = connection.declareQueue("VerifiedQueue");
queue.bind(exchange);
queue.activateConsumer((message) => {
    console.log(" Queue Message received ..should call process queue message: " +
        message.getContent());
    (0, exports.processQueueMessage)(message.getContent());
    message.ack();
}, { noAck: false });
connection.completeConfiguration().then(() => {
    console.log(" ==Queue  Config Done and Ready ===");
});
function getModule(module_code) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, mysql_connector_1.execute)(querries_1.PelezaQueries.validateModule, [module_code]);
    });
}
function getPackage(package_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, mysql_connector_1.execute)(querries_1.PelezaQueries.validatePackage, [package_id]);
    });
}
function findPeldata(request_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, mysql_connector_1.execute)(querries_1.PelezaQueries.findPeldata, [request_id]);
    });
}
function findPeldataByRef(request_ref) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, mysql_connector_1.execute)(querries_1.PelezaQueries.findPeldataByRef, [request_ref]);
    });
}
function findPeldataByClientRef(client_reference) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, mysql_connector_1.execute)(querries_1.PelezaQueries.findPeldataByClientRef, [
            client_reference,
        ]);
    });
}
function findPelDataByCompany(client_company_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, mysql_connector_1.execute)(querries_1.PelezaQueries.findPelDataByCompany, [client_company_id]);
    });
}
function findPelCompanyData(search_ids) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, mysql_connector_1.execute)(querries_1.PelezaQueries.findPelCompanyData, [
            search_ids,
        ]);
    });
}
function savePelRequest(pelData) {
    return __awaiter(this, void 0, void 0, function* () {
        // here you can use rest destruturing
        return (0, mysql_connector_1.execute)(querries_1.PelezaQueries.SavePelApiRequest, [
            pelData.request_ref_number,
            pelData.company_name,
            pelData.client_number,
            pelData.client_name,
            pelData.bg_dataset_name,
            pelData.user_name,
            pelData.client_id,
            pelData.file_tracker,
            pelData.request_credit_charged,
            pelData.package_cost,
            pelData.package_id,
            pelData.request_package,
            pelData.request_plan,
            pelData.request_type,
            pelData.registration_number,
            pelData.status,
            pelData.api_request_type,
            pelData.api_request_sub_type,
            pelData.api_client_reference,
            pelData.api_callback_url,
            pelData.api_number_of_records,
            pelData.api_upload_path,
            pelData.api_callback_status,
            pelData.api_system_request,
            pelData.dataset_citizenship,
            pelData.request_date,
            pelData.package_cost_currency,
            pelData.api_req_channel,
            pelData.user_id,
            pelData.client_login_id,
            pelData.medium
        ]);
    });
}
function savePelModuleRequest(moduleData) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, mysql_connector_1.execute)(querries_1.PelezaQueries.SavePelBgRequestModule, [
            moduleData.request_id,
            moduleData.client_id,
            moduleData.request_ref_number,
            moduleData.parent_module_id,
            moduleData.module_cost_quote,
            moduleData.package_name,
            moduleData.module_id,
            moduleData.module_name,
            moduleData.package_id,
            moduleData.request_type,
        ]);
    });
}
function makeid(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        if (length >= 15) {
            if (counter == 5 || counter == 12) {
                result +=
                    "-" + characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            else {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
        }
        else {
            if (counter == 10) {
                result +=
                    "-" + characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            else {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
        }
        counter += 1;
    }
    return result;
}
const saveApiRequest = (RequestData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const system_reference = randomUUID();
        const system_reference = makeid(15);
        const request_ref_number = makeid(13);
        const tasks = [];
        yield Promise.all(RequestData.validation_data.map((request_details) => (0, request_validation_1.ValidateSingleRequest)(request_details)));
        RequestData.validation_data.forEach((element) => {
            tasks.push(validateAndSaveRequest(element, system_reference, RequestData, request_ref_number));
        });
        const iterator = callTasks(tasks);
        while (true) {
            const result = iterator.next();
            if ((yield result).done) {
                break;
            }
        }
        return { system_reference: system_reference, request_ref_number: request_ref_number };
    }
    catch (err) {
        throw err;
    }
});
exports.saveApiRequest = saveApiRequest;
const fetchDetailsByRef = (requestRef) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const pelData = (yield findPeldataByRef(requestRef))[0];
            if (!pelData) {
                throw new Error(" Invalid Request Ref ");
            }
            return resolve(pelData);
        }
        catch (error) {
            return reject(error);
        }
    }));
};
exports.fetchDetailsByRef = fetchDetailsByRef;
const FetchPeldataByClientRef = (client_reference) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const pelData = yield findPeldataByClientRef(client_reference);
            if (!pelData) {
                throw new Error(" Invalid client_reference  ");
            }
            return resolve(pelData);
        }
        catch (error) {
            return reject(error);
        }
    }));
};
exports.FetchPeldataByClientRef = FetchPeldataByClientRef;
function addHours(date, hours) {
    date.setHours(date.getHours() + hours);
    return date;
}
// here we save details
const validateAndSaveRequest = (data, system_reference, requestData, request_ref_number) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const ModuleDetails = (yield getModule(data.module_code))[0];
            if (!ModuleDetails) {
                throw new Error(" Invalid Module Code ");
            }
            const PackageDetails = (yield getPackage(data.package_id))[0];
            if (!PackageDetails) {
                throw new Error(" Invalid Package id ");
            }
            // const request_ref = randomUUID();
            const pelData = {
                request_ref_number: request_ref_number.toUpperCase(),
                company_name: requestData.company_name,
                client_number: requestData.client_reference,
                bg_dataset_name: data.bg_dataset_name || data.dataset_name,
                client_name: data.bg_dataset_name || data.dataset_name,
                user_name: requestData.user_name,
                client_id: requestData.client_id,
                file_tracker: requestData.file_tracker,
                request_credit_charged: PackageDetails.package_cost,
                package_cost: PackageDetails.package_cost,
                package_id: PackageDetails.package_id,
                request_package: PackageDetails.package_id,
                request_plan: data.req_plan,
                request_type: "company",
                registration_number: data.registration_number,
                status: "00",
                api_request_type: requestData.request_type,
                api_request_sub_type: requestData.request_sub_type,
                api_client_reference: requestData.client_reference,
                api_callback_url: requestData.callback_url,
                api_number_of_records: requestData.number_of_records,
                api_upload_path: requestData.upload_path,
                api_callback_status: "PENDING",
                api_system_request: request_ref_number.toUpperCase(),
                dataset_citizenship: data.dataset_citizenship,
                request_date: addHours(new Date(), 3).toISOString().slice(0, 19).replace("T", " "),
                package_cost_currency: PackageDetails.package_currency,
                api_req_channel: requestData.channel,
                user_id: requestData.user_id,
                client_login_id: requestData.client_company_id,
                medium: 'api',
            };
            // console.log(" === Pel data === ",pelData)
            yield savePelRequest(pelData);
            const pelModuleData = {
                request_id: request_ref_number,
                client_id: requestData.client_id,
                request_ref_number: request_ref_number,
                parent_module_id: ModuleDetails.module_id,
                module_cost_quote: ModuleDetails.module_cost,
                package_name: PackageDetails.package_name,
                module_id: ModuleDetails.module_id,
                module_name: ModuleDetails.module_name,
                package_id: PackageDetails.package_id,
                request_type: "company",
            };
            yield savePelModuleRequest(pelModuleData);
            // here check if record is already for a verified doc and iff true send it to queue
            // else wait for business to validate
            // console.log(" === Data Saved ===")
            return resolve(data);
        }
        catch (err) {
            return reject(err);
        }
    }));
};
function callTasks(promises) {
    return __asyncGenerator(this, arguments, function* callTasks_1() {
        for (const promise of promises) {
            yield yield __await(yield __await(promise));
        }
    });
}
const testSimulation = (request_id) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = new Amqp.Message(request_id);
    exchange.send(msg);
    console.log(" === Test simulation message sent ===");
});
exports.testSimulation = testSimulation;
const FetchPeldataByCompany = (client_reference) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const pelData = yield findPelDataByCompany(client_reference);
            if (!pelData) {
                throw new Error(" Invalid client_id  ");
            }
            return resolve(pelData);
        }
        catch (error) {
            return reject(error);
        }
    }));
};
exports.FetchPeldataByCompany = FetchPeldataByCompany;
const FetchPelCompanyData = (search_ids) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const pelData = yield findPelCompanyData(search_ids);
            return resolve(pelData);
        }
        catch (error) {
            return reject(error);
        }
    }));
};
exports.FetchPelCompanyData = FetchPelCompanyData;
const processQueueMessage = (request_id) => __awaiter(void 0, void 0, void 0, function* () {
    ///
    try {
        ///
        const callbackData = yield (0, service_report_1.fetchCallbackData)(request_id);
        /// should send if callbackData has data
        console.log(" ==== Callback Data === ", callbackData);
        if (callbackData) {
            if (callbackData.request_details) {
                if (callbackData.request_details.api_callback_url) {
                    // check if status is success or error
                    let status = "success";
                    let errorDetails = "";
                    if (callbackData.request_details.status) {
                        if (callbackData.request_details.status == "55" ||
                            callbackData.request_details.status == 55) {
                            status = "error";
                            errorDetails = callbackData.request_details.comments;
                        }
                    }
                    const callbackResponse = {
                        status: status,
                        data: callbackData.cbData,
                        errorDetails: errorDetails,
                        request_details: callbackData.request_details,
                    };
                    console.log(" == Callback to send  ===", callbackResponse);
                    yield callback.sendCallback(callbackData.request_details.api_callback_url, callbackResponse);
                    console.log(" == Callback Sent ===");
                    updateCallbackSuccess(request_id);
                }
                else {
                    throw new Error(" Data Missing api_callback_url / technical Error (Client should retry the request with callback url)");
                }
            }
            else {
                throw new Error(" Data Missing request details / technical Error (Client should retry the request with api request details)");
            }
        }
        else {
            throw new Error(" Data not found / technical Error (Client should retry the request)");
        }
        // check if callback is provided
    }
    catch (err) {
        // here check if its callback error 500 unreachable ==update callback status to retry
        console.error(" Techincal Error / Processing queue Message ", err);
        updateCallbackError(request_id, "technical", err.message);
    }
});
exports.processQueueMessage = processQueueMessage;
const updateCallbackSuccess = (request_id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, mysql_connector_1.execute)(querries_1.PelezaQueries.UpdateCallBackSuccess, [request_id]);
    return result.affectedRows > 0;
});
const updateCallbackError = (request_id, api_callback_error_type, api_callback_error_details) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, mysql_connector_1.execute)(querries_1.PelezaQueries.UpdateCallBackError, [api_callback_error_type, api_callback_error_details, request_id]);
    return result.affectedRows > 0;
});
const clientLogin = (LoginData) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const LoginResult = (yield (0, mysql_connector_1.execute)(querries_1.PelezaQueries.LoginQuerry, [
                LoginData.client_company_id,
                LoginData.client_login_username,
            ]))[0];
            if (!LoginResult) {
                throw new Error(" Incorrect authentication credentials. ");
            }
            const pwdEncoded = Buffer.from(LoginData.client_password, "utf8").toString();
            const pwdInmd5 = crypto_1.default
                .createHash("md5")
                .update(pwdEncoded)
                .digest("hex");
            if (pwdInmd5 !== LoginResult.client_password) {
                throw new Error(" Incorrect authentication credentials. ");
            }
            const CompanyResult = (yield (0, mysql_connector_1.execute)(querries_1.PelezaQueries.FetchCompany, [
                LoginData.client_company_id,
            ]))[0];
            const tokendet = {
                client_id: LoginResult.client_id,
                company_name: CompanyResult.company_name,
                user_name: LoginResult.client_login_username,
                client_company_id: LoginResult.client_company_id,
                company_code: CompanyResult.company_code,
                user_id: LoginResult.client_id,
            };
            //          client_number:LoginResult.client_mobile_number , lient number is a unique ref from client
            const tkn = (0, api_security_1.generateToken)(tokendet);
            return resolve(tkn);
        }
        catch (err) {
            return reject(err);
        }
    }));
});
exports.clientLogin = clientLogin;
