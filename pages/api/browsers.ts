import { NextApiRequest, NextApiResponse } from "next";
import browserslist from "browserslist";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const browsers = browserslist(req.body);
    res.status(200).json(browsers);
  } catch (e) {
    res.status(404).send(e.message);
  }
}
