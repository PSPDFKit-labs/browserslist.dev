import browserslist from "browserslist";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./main.module.scss";
import { getIconName, getName, getVersion } from "@constants/browserMap";
import { useRouter } from "next/router";
import Search from "../../assets/svgs/search.svg";
import Info from "../../assets/svgs/info.svg";
import PSPDFKit from "../../assets/svgs/pspdfkit.svg";
import Error from "../../assets/svgs/Error.svg";
import DottedFloor from "../../assets/svgs/dotted-floor.svg";
import { useSpring, animated, config as springConfig } from "react-spring";
import { CoverageBar } from "../../components/CoverageBar/CoverageBar";
import groupBy from "just-group-by";

const usage = browserslist.usage.global;

export default function Home() {
  const query = useMemo(() => {
    if (typeof window !== "undefined") {
      const query = new URLSearchParams(window.location.search);
      if (query.has("q")) {
        return atob(query.get("q"));
      }
    }

    return "last 2 version";
  }, []);

  const [config, setConfig] = useState<string>(query);
  const [supportedBrowsers, setSupportedBrowsers] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [sticky, setSticky] = useState<boolean>();
  const router = useRouter();
  const headerRef = useRef(null);

  const lastCoverage = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver((entry) => {
      setSticky(!entry[0].isIntersecting);
    });
    observer.observe(headerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    try {
      const browsers = browserslist(config);
      setSupportedBrowsers(browsers);
      setError("");
      router.push({
        pathname: "/",
        query: {
          q: btoa(config),
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

    return {
      desktop: groupBy(grouped.desktop, (x) => x.split(" ")[0]),
      mobile: groupBy(grouped.mobile, (x) => x.split(" ")[0]),
    };
  }, [supportedBrowsers]);

  const coverage = Math.round(browserslist.coverage(supportedBrowsers));

  const animatedCoverage = useSpring({
    coverage,
    from: {
      coverage: lastCoverage.current,
    },
    onRest() {
      lastCoverage.current = coverage;
    },
  });

  console.log(groupedBrowsers);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container} ref={headerRef}>
        <header className={styles.header}>
          <span className={styles.title}>browserslist</span>

          <span className={styles.description}>
            A page to display compatible browsers from{" "}
            <a href="">browserslist string</a>.
          </span>
        </header>
        <hr className={styles.hr} />
      </div>

      <div className={`${styles.search} ${sticky && styles.searchSticky}`}>
        <div
          className={styles.container}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              className={error && styles.error}
              type="text"
              value={config}
              onChange={(event) => setConfig(event.target.value)}
            />
            {error && <Error className={styles.errorIcon} />}
          </div>

          <div className={styles.queryComposition}>
            <Info />
            &nbsp;&nbsp;
            <a>Query Composition →</a>
          </div>
        </div>
      </div>
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.results}>
            <div>
              <h3>Desktop</h3>
              {Object.keys(groupedBrowsers.desktop).map((key) => {
                const versions = groupedBrowsers.desktop[key];

                return (
                  <div key={key} className={styles.list}>
                    <div className={styles.listLeft}>
                      <div
                        className={styles.browserIcon}
                        style={{
                          backgroundImage: `url(/browser-logo/${getIconName(
                            key
                          )}.svg)`,
                        }}
                      />
                      {getName(key)}
                    </div>

                    <div className={styles.listRight}>
                      {versions.map((version) => (
                        <div className={styles.version}>
                          <span>{getVersion(version)}</span>
                          <span className={styles.usage}>
                            {usage[version].toFixed(3)} %
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <h3>Mobile</h3>
              {Object.keys(groupedBrowsers.mobile).map((key) => {
                const versions = groupedBrowsers.mobile[key];

                return (
                  <div key={key} className={styles.list}>
                    <div className={styles.listLeft}>
                      <div
                        className={styles.browserIcon}
                        style={{
                          backgroundImage: `url(/browser-logo/${getIconName(
                            key
                          )}.svg)`,
                        }}
                      />
                      {getName(key)}
                    </div>

                    <div className={styles.listRight}>
                      {versions.map((version) => (
                        <div className={styles.version}>
                          <span>{getVersion(version)}</span>
                          <span className={styles.usage}>
                            {usage[version].toFixed(3)} %
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.coverageSidebar}>
            <div className={styles.coverageCount}>
              Overall browser coverage: <br />
              <span>
                <animated.span>
                  {animatedCoverage.coverage.interpolate((x) => Math.trunc(x))}
                </animated.span>
                %
              </span>
            </div>
            <div className={styles.bar}>
              <CoverageBar value={animatedCoverage.coverage} />
            </div>
            <DottedFloor className={styles.dottedFloor} />
          </div>
        </main>
      </div>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.madeBy}>
            <PSPDFKit className={styles.logo} />
            Made by&nbsp;<a href="">PSPDFKit</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
