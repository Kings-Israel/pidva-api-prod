
import Ajv, {JSONSchemaType} from "ajv"
const ajv = new Ajv();


interface RequestData {
    client_number: string,
    dataset_citizenship: string,
    dataset_name:string,
    module_code: string,
    package_id: number
    registration_number: string,
    req_plan: string,
  
  }

  const schema: JSONSchemaType<RequestData> = {
    type: "object",
    properties: {
        client_number: {type: "string"},
        dataset_citizenship: {type: "string"},
        dataset_name: {type: "string"},
        module_code: {type: "string"},
        package_id: {type: "number"},
        registration_number: {type: "string"},
        req_plan: {type: "string"},

    },
    required: ["client_number","dataset_citizenship","dataset_name","module_code","package_id","registration_number","req_plan"],
    additionalProperties: false
  }



const singleValidator = ajv.compile(schema);
//const BatchValidator = ajv.compile(Batchschema);


 export const ValidateSingleRequest = async (data:any) => {
     return await validateRequest(data,singleValidator);
 };

/*
 export const ValidateBatchRequest = async (data:[any]) => {
    return await validateRequest(data,BatchValidator);
};
*/
 const validateRequest = <T>(data:any, validator:any ): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
       try {
         if (validator(data)) {
             resolve(data);
          } else {
             reject(validator.errors[0])
           }
       }
       catch (err) {
        reject(err) 
       }      
      });
  }