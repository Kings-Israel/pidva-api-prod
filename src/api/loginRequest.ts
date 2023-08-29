
import { Request, Response } from 'express';
import * as BussinesLogicService from '../services/logic.service';
import {ILoginRequestData} from "../services/Iapirequest.iface";

export default (router) => {

    router.post('/login', async (req: Request, res: Response) => {
        try {

            if(!req.body.username) {
                throw new Error (" username is required ")
            }
            if(!req.body.client_id) {
                throw new Error (" client_id is required ")
            }
            if(!req.body.password) {
                throw new Error (" password is required ")
            }
     
             let logindata:ILoginRequestData={
                client_company_id:req.body.client_id,
                client_login_username :req.body.username,
                client_password:req.body.password,
             }

          let token=  await BussinesLogicService.clientLogin(logindata);

            let responseStatus = {
                "status":"success",
                "token":token
            }  
            return res.status(200).json(responseStatus)  
        }
        catch (e) {
            console.log(" error : " ,e);
            let errMsg={
              message:e.message
            }
            return res.status(502).json(errMsg)
        }

     });

}