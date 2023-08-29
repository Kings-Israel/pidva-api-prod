import * as BussinesLogicService from '../services/logic.service';
import { Request, Response } from 'express';
import {verifyToken} from '../security/api.security';

export default (router) => {
    
    router.get('/details/:ref', async (req: Request, res: Response) => {
       try {
     console.log(" == Fetching details for ref == ",req.params.ref)
        if(!req.params.ref) {
            throw new Error (' Reference is Required ')
        }
        const details =await BussinesLogicService.fetchDetailsByRef(req.params.ref);
        return res.status(200).json(details)
       } catch (error) {
        return res.status(502).json(error.message)
       }
    })

    router.get('/ourrequest/:ref', async (req: Request, res: Response) => {
        try {
         if(!req.params.ref) {
             throw new Error (' Reference is Required ')
         }
         const details =await BussinesLogicService.FetchPeldataByClientRef(req.params.ref);
         return res.status(200).json(details)
        } catch (error) {
         return res.status(502).json(error.message)
        }
     })


   // api to retry callback 
     router.post('/retrycallback', async (req: Request, res: Response) => {
        try {

            const tkn = req.body.token || req.header('token');
            if (!tkn) {
              let errMsg={
                message:'token missing in header'
              }
              return res.status(403).json(errMsg)
            }

            const tknData:any= await verifyToken(tkn);
            if(!req.body.request_id) {
                throw new Error (" request id is required ")
            }
            await BussinesLogicService.processQueueMessage(req.body.request_id)
            return res.status(200).json({status:"success"})
       } 
          catch (e) {
            const errMsg={
                message:e.message
            }
      return res.status(502).json(errMsg)
    }

     })





    

}

