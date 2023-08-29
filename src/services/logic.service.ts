import { execute } from "../config/mysql.connector";
import { RABBITMQ } from '../config/config';
import * as callback from '../interfaces/callback'
import { PelezaQueries } from "../repo/querries";
import {Ipackage,Imodule ,IPelReq ,IPelModule ,IPelData ,IClientData ,ICompanyData} from "../repo/Ipsmt.model";
import {fetchCallbackData} from '../report/service.report';
import crypto,{ randomUUID } from 'crypto'
import * as Amqp from "../interfaces/queue";
import {ValidateSingleRequest} from '../validations/request.validation';
import {ILoginRequestData} from './Iapirequest.iface';
import {generateToken} from '../security/api.security';




function get_url () {
const config=RABBITMQ;
  const queue_url ='amqp://'+config.user+':'+config.pass+'@'+config.host+':'+config.port+'/'+config.vhost;
  
     return queue_url;
}


const connection = new Amqp.Connection(get_url ());
const exchange = connection.declareExchange("Peleza","direct");
const queue = connection.declareQueue("VerifiedQueue");
queue.bind(exchange);


queue.activateConsumer((message) => {
    console.log(" Queue Message received ..should call process queue message: " + message.getContent());
    processQueueMessage(message.getContent());
    message.ack();
}, {noAck: false});



connection.completeConfiguration().then(() => {
  console.log(" ==Queue  Config Done and Ready ===")
});

 async function getModule  (module_code) {
    return execute<Imodule>(PelezaQueries.validateModule, [module_code]);
 };

 async function getPackage (package_id)  {
    return execute<Ipackage>(PelezaQueries.validatePackage, [package_id]);
 };

 async function findPeldata (request_id)  {
  return execute<IPelData>(PelezaQueries.findPeldata, [request_id]);
};


async function findPeldataByRef (request_ref)  {
  return execute<IPelData>(PelezaQueries.findPeldataByRef, [request_ref]);
};


async function findPeldataByClientRef (client_reference)  {
  return execute<IPelData>(PelezaQueries.findPeldataByClientRef, [client_reference]);
};





 

 async function savePelRequest (pelData:IPelReq)  {

  // here you can use rest destruturing
  return execute<IPelReq>(PelezaQueries.SavePelApiRequest, [
    pelData.request_ref_number,
    pelData.company_name ,
    pelData.client_number,
    pelData.client_name,
    pelData.bg_dataset_name,
    pelData.user_name,
    pelData.client_id,
    pelData.file_tracker,
    pelData.request_credit_charged,
    pelData.package_cost ,
    pelData.package_id ,
    pelData.request_package,
    pelData.request_plan ,
    pelData.request_type,
    pelData.registration_number,
    pelData.status,
    pelData.api_request_type,
    pelData.api_request_sub_type ,
    pelData.api_client_reference ,
    pelData.api_callback_url ,
    pelData.api_number_of_records ,
    pelData.api_upload_path ,
    pelData.api_callback_status,
    pelData.api_system_request ,
    pelData.dataset_citizenship ,
    pelData.request_date ,
    pelData.package_cost_currency ,
    pelData.api_req_channel ,
    pelData.user_id,
    pelData.client_login_id
  ]);
};

async function savePelModuleRequest (moduleData:IPelModule)  {
  return execute<IPelModule>(PelezaQueries.SavePelBgRequestModule, [   
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
};

  export const saveApiRequest = async (RequestData: any) => {
    try {
      const system_reference =randomUUID();
      const tasks:Promise<any>[]=[];
         await Promise.all(RequestData.validation_data.map((request_details) => ValidateSingleRequest(request_details)));
       RequestData.validation_data.forEach((element) => {
           tasks.push(validateAndSaveRequest(element,system_reference,RequestData))
       });     
       const iterator = callTasks(tasks);
        while (true) {
          const result = iterator.next();
          if ((await result).done){
            break
          }
        }
        
       return  system_reference 
    }
    catch (err) {
       throw err
    }
  };

  export const fetchDetailsByRef =<T> (requestRef:string) :Promise<T> => {
    return new Promise(async (resolve, reject) => {
          try {
            const pelData = (await findPeldataByRef(requestRef))[0];
            if(!pelData) {
              throw new Error (" Invalid Request Ref ")
            }
            return resolve(pelData)
          } catch (error) {
            return reject(error) 
          }
    })
  }



  export const FetchPeldataByClientRef = (client_reference:string) :Promise<any> => {
    return new Promise(async (resolve, reject) => {
          try {
            const pelData = (await findPeldataByClientRef(client_reference));
            if(!pelData) {
              throw new Error (" Invalid client_reference  ")
            }
            return resolve(pelData)
          } catch (error) {
            return reject(error) 
          }
    })
  }

  

// here we save details
  const validateAndSaveRequest = <T>(data:any,system_reference:string,requestData:any ): Promise<T> => {
    return new Promise<T>(async (resolve, reject) => {
     try {
        const ModuleDetails:Imodule = (await getModule(data.module_code))[0];
        if(!ModuleDetails) {
          throw new Error (" Invalid Module Code ")
        }
        const PackageDetails:Ipackage = (await getPackage(data.package_id))[0];
        if(!PackageDetails) {
          throw new Error (" Invalid Package id ")
        }



        const request_ref=randomUUID();
        const pelData:IPelReq= {
          request_ref_number:request_ref,
          company_name:requestData.company_name,
          client_number:requestData.client_reference,
          bg_dataset_name:data.bg_dataset_name || data.dataset_name,
          client_name:data.bg_dataset_name || data.dataset_name,
          user_name:requestData.user_name,
          client_id:requestData.client_id,
          file_tracker:requestData.file_tracker,
          request_credit_charged:PackageDetails.package_cost,
          package_cost:PackageDetails.package_cost,
          package_id:PackageDetails.package_id,
          request_package:PackageDetails.package_id,
          request_plan :data.req_plan,
          request_type:"company",
          registration_number:data.registration_number,
          status:"00",
          api_request_type:requestData.request_type,
          api_request_sub_type :requestData.request_sub_type,
          api_client_reference :requestData.client_reference,
          api_callback_url :requestData.callback_url,
          api_number_of_records :requestData.number_of_records,
          api_upload_path :requestData.upload_path,
          api_callback_status:"PENDING",
          api_system_request:system_reference,
          dataset_citizenship:data.dataset_citizenship,
          request_date:new Date().toISOString().slice(0, 19).replace('T', ' '),
          package_cost_currency :PackageDetails.package_currency ,
          api_req_channel:requestData.channel ,
          user_id:requestData.user_id,
          client_login_id:requestData.client_company_id,
        }
       // console.log(" === Pel data === ",pelData)
        await savePelRequest(pelData);

        const pelModuleData:IPelModule= {
          request_id:request_ref,
          client_id:requestData.client_id ,
          request_ref_number:request_ref,
          parent_module_id:ModuleDetails.module_id,
          module_cost_quote:ModuleDetails.module_cost,
          package_name:PackageDetails.package_name,
          module_id:ModuleDetails.module_id,
          module_name:ModuleDetails.module_name,
          package_id:PackageDetails.package_id,
          request_type:"company",
        }
        await savePelModuleRequest (pelModuleData);
      // here check if record is already for a verified doc and iff true send it to queue
      // else wait for business to validate 
      // console.log(" === Data Saved ===")
        return resolve(data);
     }
     catch (err) {
     return reject(err) 
     }      
    });
}

  

 async function* callTasks(promises) {
  for(const promise of promises) {
    yield await promise;
  }
};


 export const testSimulation =async (request_id)=> {
    const msg = new Amqp.Message(request_id);
    exchange.send(msg);
    console.log(" === Test simulation message sent ===")

 }

 export const processQueueMessage =async (request_id ) => {
   /// 
   try {
     /// 
    const callbackData:any= await fetchCallbackData(request_id);
   /// should send if callbackData has data
   console.log(" ==== Callback Data === ",callbackData)
    if(callbackData) {
      if(callbackData.request_details) {
        if(callbackData.request_details.api_callback_url) {
          // check if status is success or error 
           let status ="success"
           let errorDetails=''
             if(callbackData.request_details.status) {
               if(callbackData.request_details.status =='55' || callbackData.request_details.status ==55) {
                  status='error'
                  errorDetails=callbackData.request_details.comments
                }
             }
           const callbackResponse={
               status:status,
               data:callbackData.cbData,
               errorDetails:errorDetails,
               request_details:callbackData.request_details
           }
           console.log(" == Callback to send  ===",callbackResponse)
            await callback.sendCallback(callbackData.request_details.api_callback_url,callbackResponse);
            console.log(" == Callback Sent ===")
            updateCallbackSuccess(request_id);

        }
        else{
          throw new Error (" Data Missing api_callback_url / technical Error (Client should retry the request with callback url)")
        }
      }else{
        throw new Error (" Data Missing request details / technical Error (Client should retry the request with api request details)")
      }
    }
    else{
      throw new Error (" Data not found / technical Error (Client should retry the request)")
    }
    // check if callback is provided
   }
   catch (err) {
    // here check if its callback error 500 unreachable ==update callback status to retry 
     console.error(" Techincal Error / Processing queue Message ",err)
     updateCallbackError(request_id,'technical',err.message)
   }

 }

  const updateCallbackSuccess =async (request_id)=> {
    const result = await execute<{ affectedRows: number }>(PelezaQueries.UpdateCallBackSuccess, [
      request_id
    ]);
    return result.affectedRows > 0;
  }

 const updateCallbackError =async (request_id,api_callback_error_type ,api_callback_error_details)=> {
  const result = await execute<{ affectedRows: number }>(PelezaQueries.UpdateCallBackError, [
    api_callback_error_type ,
    api_callback_error_details ,
    request_id
  ]);
   
  return result.affectedRows > 0;
 }

 export const clientLogin = async (LoginData: ILoginRequestData) => {
  return new Promise(async (resolve, reject) => {
    try {
        const LoginResult:IClientData = (await execute<IClientData>(PelezaQueries.LoginQuerry, [
          LoginData.client_company_id ,
          LoginData.client_login_username 
        ]))[0];

        if(!LoginResult) {
          throw new Error (' Incorrect authentication credentials. ')
        }
        const pwdEncoded = Buffer.from(LoginData.client_password, 'utf8').toString();
        const pwdInmd5=crypto.createHash('md5').update(pwdEncoded).digest("hex");
        if(pwdInmd5 !== LoginResult.client_password) {
          throw new Error (' Incorrect authentication credentials. ')
        }

        const CompanyResult:ICompanyData = (await execute<IClientData>(PelezaQueries.FetchCompany, [
          LoginData.client_company_id 
        ]))[0];


        const tokendet={
          client_id:LoginResult.client_id ,
          company_name :CompanyResult.company_name ,
          user_name :LoginResult.client_login_username,
          client_company_id:LoginResult.client_company_id ,
          company_code :CompanyResult.company_code ,
          user_id:LoginResult.client_id
        }
        //          client_number:LoginResult.client_mobile_number , lient number is a unique ref from client 

        const tkn= generateToken(tokendet);
        return resolve(tkn);
    }
    catch (err) {
      return reject(err)
    }
  })
 }
