import { Request, Response } from 'express';
import  fs from 'fs';

export default (router) => {
    router.post('/callback', async (req: Request, res: Response) => {
          try {
              console.log(" callback received ",req.body);
              let data = JSON.stringify(req.body);
              fs.writeFileSync('latest-callback.json', data);
            return res.status(200).json({status:"received"})
          }
          catch (err) {
            return res.status(502).json(err)
          }
    }) 


    router.get('/latest-callback', async (req: Request, res: Response) => {
        try {
            let rawdata = fs.readFileSync('latest-callback.json');
            let latestData = JSON.parse(rawdata.toString());
            return res.status(200).json(latestData)
        }
        catch (err) {
            return res.status(502).json(err)
        }

    })

    router.get('/callbackview', async (req: Request, res: Response) => {
        try {
            let rawdata = fs.readFileSync('latest-callback.json');
            let latestData = JSON.parse(rawdata.toString());
            return  res.render('pages/index',latestData);
        }
        catch (err) {
            return  res.render('pages/error');
        }

    })

    
    
} 