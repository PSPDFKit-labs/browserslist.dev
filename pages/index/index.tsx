import browserslist from "browserslist";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./main.module.scss";
import { getIconName, getName, getVersion } from "@constants/browserMap";
import { useRouter } from "next/router";

export default function Home() {
  const query = useMemo(() => {
    if (typeof window !== "undefined") {
      const query = new URLSearchParams(window.location.search);
      if (query.has("q")) {
        return decodeURI(query.get("q"));
      }
    }

    return "last 2 version";
  }, []);

  const [config, setConfig] = useState<string>(query);
  const [supportedBrowsers, setSupportedBrowsers] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    try {
      const browsers = browserslist(config);
      setSupportedBrowsers(browsers);
      setError("");
      router.push({
        pathname: "/",
        query: {
          q: encodeURI(config),
        },
      });
    } catch (e) {
      setError(e.message);
    }
  }, [config]);

  const groupedBrowsers = useMemo(() => {
    const grouped = {
      mobile: [],
      desktop: [],
    };

    supportedBrowsers.map((browser) => {
      if (
        browser.startsWith("ios_") ||
        browser.startsWith("and_") ||
        browser.startsWith("op_") ||
        browser.startsWith("ie_")
      ) {
        grouped.mobile.push(browser);
      } else {
        grouped.desktop.push(browser);
      }
    });

    return grouped;
  }, [supportedBrowsers]);

  return (
    <div className="container">
      <header className={styles.header}>
        <div className={styles.inputWrapper}>
          <input
            className={styles.input}
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            type="text"
            style={error ? { borderColor: "red" } : undefined}
          />
          {error && <span>Invalid Browserslist configuration</span>}
        </div>
      </header>
      <div className={styles.coverage}>
        Overall Browser Coverage:{" "}
        {Math.round(browserslist.coverage(supportedBrowsers))}%
      </div>

      <main className={styles.main}>
        <section>
          <h3>Desktop</h3>
          {groupedBrowsers.desktop.map((item) => (
            <div className={styles.list} key={item}>
              <div
                className={styles.browserIcon}
                style={{
                  backgroundImage: `url(/browser-logo/${getIconName(
                    item
                  )}.svg)`,
                }}
              />
              {getName(item)} {getVersion(item)}
            </div>
          ))}
        </section>
        <section>
          <h3>Mobile</h3>
          {groupedBrowsers.mobile.map((item) => (
            <div className={styles.list} key={item}>
              <div
                className={styles.browserIcon}
                style={{
                  backgroundImage: `url(/browser-logo/${getIconName(
                    item
                  )}.svg)`,
                }}
              />
              {getName(item)} {getVersion(item)}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
