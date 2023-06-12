import { NextApiRequest, NextApiResponse } from "next";
import * as browserslist from "browserslist/node";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const browsers = browserslist.default(req.body);
    res.status(200).json(browsers);
  } catch (e) {
    res.status(404).send("Feature not found");
  }
}
