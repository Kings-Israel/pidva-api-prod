
   import { execute } from "../config/mysql.connector";
   import {PelezaReportQueries} from  './querry.report';

   const ngo=['NGO','SACCO','TR','CBO','SOCIETIES','TRUSTS','SOC'];
   const business=['CLG','CO','BN','ICO','LLP','NCBA','COOPERATIVE'];


   export const fetchCallbackData = async (request_id)=> {
      return new Promise(async (resolve, reject) => {
         try {

            let cbData:any= {};
            if(!request_id) {
               throw new Error (' The request id is Required ')
            }

            let defaultData= (await execute<any>(PelezaReportQueries.DefaultReportQuerry, [request_id]))[0];
             if(!defaultData) {
              throw new Error (' invalid Request id : Data not found ')
             }
             if(defaultData && defaultData.api_req_channel==='api' ) {
               // console.log(" === data come through api , you can process ====")
                 if( business.includes(defaultData.module_code.toUpperCase())) {
               //   console.log(" === its company data  ====")   
                   let companyDetails= await execute<any>(PelezaReportQueries.BussinessReportQuerry, [request_id]);
                  // fetch company details
                   cbData.data_type='COMPANY'  
                   cbData.company_details= {}
                     if(defaultData.module_code.toUpperCase() === 'CO' || defaultData.module_code.toUpperCase() === 'ICO') {
                        console.log(" === fetch shares details  ====")  
                        let nominalShares= await execute<any>(PelezaReportQueries.BussinessNominalShare, [request_id]); 
                        let Encumburance= await execute<any>(PelezaReportQueries.BussinessEncumburance, [request_id]); 
                        cbData.company_details= {
                           "Shareholders":companyDetails,
                           "Nominalshares":nominalShares,
                           "Encumburance":Encumburance
                        }
                     }  

                     if(defaultData.module_code.toUpperCase() === 'CLG' || defaultData.module_code.toUpperCase() === 'BN') {
                        cbData.company_details= {
                           "Owners":companyDetails
                        }

                     }
                 }
                 else if (ngo.includes(defaultData.module_code.toUpperCase())) {
                  let Ngo= await execute<any>(PelezaReportQueries.NgoReportQuerry, [request_id]); 
                  console.log(" === its ngo data  ====")  
                  cbData.data_type='NGO' 
                  cbData.ngo_details= {
                     Ngo:Ngo
                  }
                 }
                 else{
                  cbData.data_type='OTHERS' 
                  let other={
                     bg_dataset_name:  defaultData.bg_dataset_name,
                     dataset_citizenship:  defaultData.dataset_citizenship,
                     bg_dataset_email:  defaultData.bg_dataset_email,
                     bg_dataset_mobile:  defaultData.bg_dataset_mobile,
                     bg_dataset_idnumber:  defaultData.bg_dataset_idnumber,
                     registration_number:  defaultData.registration_number,
                     client_number:  defaultData.client_number,
                     company_type:  defaultData.company_type,
                     dataset_incorporation_no:  defaultData.dataset_incorporation_no,
                     dataset_kra_pin:  defaultData.dataset_kra_pin,
                     dataset_name:  defaultData.dataset_name,
                     client_name:  defaultData.client_name,
                     verified_date:  defaultData.verified_date,
                     adverse_status:  defaultData.adverse_status,
                     company_name:  defaultData.company_name,
                  }
                  cbData.other_details= {
                     Other:other
                  }
                 }
               /// return empty if request_channel is not equal to api
             }
          
            let request_details={
               request_ref_number: defaultData.request_ref_number,
               bg_dataset_name: defaultData.bg_dataset_name,
               dataset_citizenship: defaultData.dataset_citizenship,
               registration_number: defaultData.registration_number,
               dataset_name: defaultData.dataset_name,
               status: defaultData.status,
               comments: defaultData.comments,
               module_code: defaultData.module_code,
               request_date: defaultData.request_date,
               package_id: defaultData.package_id,
               verified_date:  defaultData.verified_date,
               api_request_type: defaultData.api_request_type,
               api_request_sub_type: defaultData.api_request_sub_type,
               api_client_reference: defaultData.api_client_reference,
               api_callback_url: defaultData.api_callback_url,
               api_number_of_records: defaultData.api_number_of_records,
               api_callback_status: defaultData.api_callback_status,
               api_system_request: defaultData.api_system_request,
               api_callback_error_details: defaultData.api_callback_error_details
            }

            return resolve({cbData,request_details})
         }
         catch (err) {
          return reject(err)
         }
      })  
   }