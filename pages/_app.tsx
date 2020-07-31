import "../styles/main.scss";
import React, { useEffect } from "react";
import Head from "next/head";

const ID = process.env.GA;
const META_TAG_ID = process.env.META_TAG_ID;

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      // @ts-ignore
      window.dataLayer.push(arguments);
    }
    // @ts-ignore
    gtag("js", new Date());

    // @ts-ignore
    gtag("config", ID, { anonymize_ip: true });
  }, []);

  return (
    <>
      <Head>
        <meta name="google-site-verification" content={META_TAG_ID} />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${ID}`}
        />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
