import { NextApiRequest, NextApiResponse } from "next";
import browserslist from "browserslist";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const x = browserslist(req.body);
  res.status(200).json(x);
}
