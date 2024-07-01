import { NextApiRequest, NextApiResponse } from "next";
import * as lite from "caniuse-lite";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const featuresData = Object.keys(lite.features).map((feature) => {
      const featureData = require(`caniuse-lite/data/features/${feature}.js`);

      return {
        name: feature,
        ...lite.feature(featureData),
      };
    });
    const matchingFeaturesData = featuresData.filter(
      (feature) =>
        feature.name.includes(req.body) || feature.title.includes(req.body)
    );
    res.status(200).json(matchingFeaturesData);
  } catch (e) {
    res.status(400).send(e.message);
  }
}
