
import express  from 'express';
import singleRequest from './singleRequest';
import batchRequest from './batchRequest';
import simulationRequest from './simulationRequest';
import loginRequest from './loginRequest';
import callback from './callback';
import details from './requestdetails'
const router = express.Router();

    loginRequest(router);
    singleRequest(router);
    batchRequest(router);
    simulationRequest(router);
    callback(router);
    details(router)


export default router;