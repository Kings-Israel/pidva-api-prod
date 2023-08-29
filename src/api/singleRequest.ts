import {  Request, Response } from 'express';
import * as BussinesLogicService from '../services/logic.service';
import {IRequestData} from "../services/Iapirequest.iface";
import {verifyToken} from '../security/api.security';

export default (router) => {
   // app.use('/request/single', route);
   router.post('/single', async (req: Request, res: Response) => {
        try {

                let tkn = req.body.token || req.header('token');
                if (!tkn) {
                  let errMsg={
                    message:'token missing in header'
                  }
                  return res.status(403).json(errMsg)
                }

                let tknData:any= await verifyToken(tkn);

             //   console.log(" === Token Data ===== ",tknData)

                if(!req.body.client_reference) {
                   throw new Error (" client_reference missing ")
                }
                if(!req.body.callback) {
                  throw new Error (" callback missing ")
                }
                if(!req.body.terms_and_condition || req.body.terms_and_condition==false ) {
                  throw new Error (" terms_and_condition missing or is false (should be true)")
                }
                if(!req.body.validation_data) {
                  throw new Error (" validation_data missing ")
                }

                let apiReq:IRequestData ={
                  company_name:tknData.company_name,
                  client_number:tknData.client_reference,
                  client_id:tknData.client_id,
                  user_name:tknData.user_name,
                  user_id:tknData.user_id,
                  request_type:"single",
                  request_sub_type:"single",
                  client_reference:req.body.client_reference,
                  channel:"api",
                  callback_url:req.body.callback,
                  number_of_records:1,
                  upload_path:"N/A",
                  validation_data:[req.body.validation_data] ,
                  client_login_id:tknData.client_company_id
            
                }
                //      // client_company_id:

                 const systemRefrence = await BussinesLogicService.saveApiRequest(apiReq);
                 const responseStatus = {
                     "status":"success",
                     "reference":systemRefrence
                 }        
     
          return res.status(200).json(responseStatus)
        } catch (e) {
          console.log(" errr ",e)
          let errMsg={
            message:e.message
          }
          return res.status(502).json(errMsg)
        }
    });

   // return route;

}