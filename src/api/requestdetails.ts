import * as BussinesLogicService from "../services/logic.service";
import { Request, Response } from "express";
import { verifyToken } from "../security/api.security";
import { ICompanyData } from "../repo/Ipsmt.model";
import { IClientData } from "../repo/Ipsmt.model";
import { execute } from "../config/mysql.connector";
import { PelezaQueries } from "../repo/querries";

export default (router) => {
  router.get("/details/:ref", async (req: Request, res: Response) => {
    try {
      console.log(" == Fetching details for ref == ", req.params.ref);
      if (!req.params.ref) {
        throw new Error(" Reference is Required ");
      }
      const details = await BussinesLogicService.fetchDetailsByRef(
        req.params.ref
      );
      return res.status(200).json(details);
    } catch (error) {
      return res.status(502).json(error.message);
    }
  });

  router.get("/ourrequest/:ref", async (req: Request, res: Response) => {
    try {
      if (!req.params.ref) {
        throw new Error(" Reference is Required ");
      }
      const details = await BussinesLogicService.FetchPeldataByClientRef(
        req.params.ref
      );
      return res.status(200).json(details);
    } catch (error) {
      return res.status(502).json(error.message);
    }
  });

  router.get("/requests/:type?", async (req: Request, res: Response) => {
    const tkn = req.body.token || req.header("token");
    const client_id = req.body.client_id || req.header("client_id");
    if (!tkn) {
      const errMsg = {
        message: "token missing in header",
      };
      return res.status(403).json(errMsg);
    }

    if (!client_id) {
      const errMsg = {
        message: "Pass client id in header",
      };
      return res.status(403).json(errMsg);
    }

    const type = req.params.type;

    const CompanyResult: ICompanyData = (
      await execute<IClientData>(PelezaQueries.FetchCompany, [client_id])
    )[0];

    const details = await BussinesLogicService.FetchPeldataByCompany(
      CompanyResult.company_name
    );

    const pel_search_ids: Array<string> = [];

    details.forEach((detail) => {
      pel_search_ids.push(detail.request_ref_number);
    });

    const company_details = await BussinesLogicService.FetchPelCompanyData(
      pel_search_ids
    );

    let data = [];

    if (type == "llc") {
      data = company_details.filter((detail) => {
        !detail.registration_number.startsWith("PVT");
      });
    } else if (type === "proprietor") {
      data = company_details.filter((detail) => {
        !detail.registration_number.startsWith("BN");
      });
    } else {
      data = company_details;
    }

    return res.status(200).json(data);
  });

  // api to retry callback
  router.post("/retrycallback", async (req: Request, res: Response) => {
    try {
      const tkn = req.body.token || req.header("token");
      if (!tkn) {
        const errMsg = {
          message: "token missing in header",
        };
        return res.status(403).json(errMsg);
      }

      const tknData: any = await verifyToken(tkn);
      if (!req.body.request_id) {
        throw new Error(" request id is required ");
      }
      await BussinesLogicService.processQueueMessage(req.body.request_id);
      return res.status(200).json({ status: "success" });
    } catch (e) {
      const errMsg = {
        message: e.message,
      };
      return res.status(502).json(errMsg);
    }
  });
};
