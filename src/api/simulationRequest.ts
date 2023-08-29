import {  Request, Response, NextFunction } from 'express';
import * as TestService from '../services/logic.service';
import {ValidateSingleRequest} from '../validations/request.validation';
import {IRequestData} from "../services/Iapirequest.iface";
export default (router) => {
   // app.use('/request/single', route);
   router.post('/simulation', async (req: Request, res: Response) => {
        try {

            if(!req.body.request_id) {
                throw new Error (" request id is required ")
            }
          //  TestService.testSimulation(req.body.request_id);
            let responseStatus={
                message:"sim"
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



    router.post('/testCallback', async (req: Request, res: Response) => {
        try {

            console.log(" === Local Callback Called ====")
            console.log(req.body)
            console.log(" === Local Callback Called ====")
            let responseStatus={
                message:"sim"
            }
            return res.status(200).json(responseStatus)
        } catch (e) {
          console.log(" errr ",e)
          return res.status(502).json(e)
        }
    });

}  