
import * as https from'https';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import * as http from'http';

export const sendCallback = async (callbackUrl:string,data:any) => {
     try {
        var request_url = new URL(callbackUrl);
        let Callbackdata = JSON.stringify(data) ;
        const options = {
            protocol:request_url.protocol,
            hostname: request_url.hostname,
            port:request_url.port,
            path:request_url.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Callbackdata.length
            }
        }
     return await send(options,Callbackdata);
     }  
     catch (err) {
      // here check if status is 500 and iff true update number of tries as 
      // retry(sendCallback(callbackUrl,data),3)
       throw err
     }
     
}


const retry = (callback, times = 3) => {
  let numberOfTries = 0;
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      numberOfTries++;
      if (numberOfTries === times) {
        console.log(`Trying for the last time... (${times})`);
        clearInterval(interval);
      }
      try {
        await callback();
        clearInterval(interval);
        console.log(`Operation successful, retried ${numberOfTries} times.`);
        resolve("ok");
      } catch (err) {
        console.log(`Unsuccessful, retried ${numberOfTries} times... ${err}`);
      }
    }, 10000); // retry after 10 sec
  });
};


export const send = <T>(options: any, data: any): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
       try {
        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`) 
            if(res.statusCode !== 200)  {
                return reject(" Invalid status code ")
            } 
            //    
            res.on('data', d => {
            return resolve(d)
            })
          })      
          req.on('error', error => {
            return reject(error)
          })      
          req.write(data)
          req.end()
        }
        catch (err) {
          return reject(err)
        }
      });
}





