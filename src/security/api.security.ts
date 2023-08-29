import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

/**
 * generates JWT used for local testing
 */
 const publicKey = fs.readFileSync(path.join(__dirname, '../../public.pem'));
 const privateKey = fs.readFileSync(path.join(__dirname, '../../private.pem'));
// for now wil put security keys in the same folder later somewhere else

const passphrase = process.env.PASSPHRASE || 'top secret'
const signInOptions: SignOptions = {
  issuer: 'Peleza',
  subject: 'info@peleza.co.ke',
  algorithm: 'RS256',
  expiresIn: '30d',
};

const verifyOption: VerifyOptions = {
  issuer: 'Peleza',
  subject: 'info@peleza.co.ke',
  algorithms: ['RS256'],
  expiresIn: '30d',
};



export const generateToken = async (payload: any) => {
  return sign(payload,  {key: privateKey,passphrase:passphrase}, signInOptions);
};

export const verifyToken = async (token: any) => {
  return new Promise(async (resolve, reject) => {
    try {
        let tokenData= verify(token,  publicKey, verifyOption);
         return resolve(tokenData)
    }
    catch (err) {
      return reject(err)
    }
  })  
};

interface TokenPayload {
  exp: number;
  accessTypes: string[];
  name: string;
  userId: number;
}

/**
 * checks if JWT token is valid
 *
 * @param token the expected token payload
 */
export function validateToken(token: string): Promise<TokenPayload> {


  const verifyOptions: VerifyOptions = {
    algorithms: ['RS256'],
  };

  return new Promise((resolve, reject) => {
    verify(token, publicKey, verifyOptions, (error, decoded: any) => {
      if (error) return reject(error);

      resolve(decoded);
    })
  });
}