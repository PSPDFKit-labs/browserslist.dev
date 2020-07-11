import "../styles/main.scss";
import React, { useEffect } from "react";
import ReactGA from "react-ga";

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    ReactGA.initialize(process.env.GA);
  }, []);

  return <Component {...pageProps} />;
}
