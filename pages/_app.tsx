import "../styles/main.scss";
import React from "react";
import Head from "next/head";

const ID = process.env.GA;
const META_TAG_ID = process.env.META_TAG_ID;

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="google-site-verification" content={META_TAG_ID} />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${ID}', { 'anonymize_ip': true});
          `,
          }}
        ></script>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
