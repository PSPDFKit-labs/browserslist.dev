import browserslist from "browserslist";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./main.module.scss";
import { getIconName, getName, getVersion } from "@constants/browserMap";
import { useRouter } from "next/router";
import Search from "@assets/svgs/search.svg";
import Info from "@assets/svgs/info.svg";
import PSPDFKit from "@assets/svgs/pspdfkit.svg";
import Error from "@assets/svgs/error.svg";
import DottedFloor from "@assets/svgs/dotted-floor.svg";
import Arrow from "@assets/svgs/arrow.svg";
import ArrowDown from "@assets/svgs/arrow-down.svg";
import { useSpring, animated } from "react-spring";
import { CoverageBar } from "@components/CoverageBar/CoverageBar";
import groupBy from "just-group-by";
import { version as browserslistVersion } from "../../node_modules/browserslist/package.json";
import { version as canIUse } from "../../node_modules/caniuse-lite/package.json";
import fs from "fs";
import globby from "globby";
import path from "path";
import Head from "next/head";
import cn from "classnames";
import atob from "atob";
import ReactTooltip from "react-tooltip";

const usage = browserslist.usage.global;

function getConfigFromQuery() {
  if (typeof window !== "undefined") {
    const query = new URLSearchParams(window.location.search);
    if (query.has("q")) {
      return atob(query.get("q"));
    }
  }

  return "last 2 versions";
}

export default function Home({ savedData, initialBrowsers, searchQuery }) {
  const preSavedData = useMemo(() => {
    let { ref, version } = searchQuery;

    if (ref === "pspdfkit") {
      const ver = version.split(".");
      if (ver.length === 2) ver.push("0");
      version = ver.join(".");
    }

    if (ref && version) {
      return savedData[`${ref}/${version}.json`];
    }
  }, [savedData, searchQuery]);

  const [config, setConfig] = useState<string>(
    preSavedData?.config || getConfigFromQuery()
  );
  const [supportedBrowsers, setSupportedBrowsers] = useState<string[]>(
    preSavedData?.supportedBrowsers || initialBrowsers
  );
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
    function handleUrlChange() {
      const config = getConfigFromQuery();
      const browsers = browserslist(config);
      setSupportedBrowsers(browsers);
      setConfig(config);
    }

    router.events.on("routeChangeComplete", handleUrlChange);

    return () => {
      router.events.off("routeChangeComplete", handleUrlChange);
    };
  }, []);

  useEffect(() => {
    if (preSavedData) return;
    try {
      browserslist(config);
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
  }, [config, preSavedData]);

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
    config: { duration: 200 },
    onRest() {
      lastCoverage.current = coverage;
    },
  });

  const searchClassName = cn(styles.search, {
    [styles.searchSticky]: sticky,
  });

  return (
    <>
      <Head>
        <title>Browserslist</title>
        <meta
          property="og:title"
          content="A page to display compatible browsers from browserslist string."
          key="title"
        />
      </Head>
      <div className={styles.wrapper}>
        <ReactTooltip effect="solid" backgroundColor="#4636e3" />
        <div className={styles.containerWrapper}>
          <div className={styles.container} ref={headerRef}>
            <header className={styles.header}>
              <span className={styles.title}>browserslist</span>

              {preSavedData?.title ? (
                <div
                  className={styles.description}
                  dangerouslySetInnerHTML={{ __html: preSavedData?.title }}
                />
              ) : (
                <span className={styles.description}>
                  A page to display compatible browsers from{" "}
                  <a
                    href="https://github.com/browserslist/browserslist"
                    target="_blank"
                  >
                    browserslist string
                  </a>
                  .
                </span>
              )}
            </header>
            <div className={styles.hr} />
          </div>

          {!preSavedData && (
            <div key="search" className={searchClassName}>
              <div className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} />
                  <input
                    className={error && styles.error}
                    type="text"
                    value={config}
                    onChange={(event) => setConfig(event.target.value)}
                  />
                  {error && (
                    <div className={styles.errorIcon}>
                      <Error />
                      <div
                        className={cn(styles.tooltip, {
                          [styles.stickyTooltip]: sticky,
                        })}
                      >
                        <span className={styles.tooltiptext}>
                          Invalid Configuration
                        </span>
                        <ArrowDown />
                      </div>
                    </div>
                  )}
                </div>

                <a
                  href="https://github.com/browserslist/browserslist#query-composition"
                  target="_blank"
                  className={styles.queryComposition}
                >
                  <Info />
                  <span>
                    Query Composition <Arrow />
                  </span>
                </a>
              </div>
            </div>
          )}

          {coverage && (
            <section key="progress" className={styles.progressContainer}>
              <div className={styles.horProgressWrapper}>
                <animated.div
                  style={{
                    width: animatedCoverage.coverage.interpolate(
                      (x) => `${Math.trunc(x)}%`
                    ),
                  }}
                ></animated.div>
                <span>Overall Browser Coverage: {coverage}%</span>
              </div>
            </section>
          )}

          <div className={styles.container}>
            <main className={styles.main}>
              <div className={styles.results}>
                <div>
                  {!!Object.keys(groupedBrowsers.desktop)?.length && (
                    <h3>Desktop</h3>
                  )}
                  {Object.keys(groupedBrowsers.desktop).map((key) => {
                    const versions = groupedBrowsers.desktop[key];

                    return (
                      <div key={key} className={styles.list}>
                        <div className={styles.listLeft}>
                          <div
                            className={cn(
                              styles.browserIcon,
                              "icon",
                              `icon-${getIconName(key)}`
                            )}
                          />
                          {getName(key)}
                        </div>

                        <div className={styles.listRight}>
                          {versions.map((version) => (
                            <div key={version} className={styles.version}>
                              <span>{getVersion(version)}</span>
                              <span
                                data-tip={getTooltipData(version)}
                                data-tip-disable={!usage[version]}
                                className={styles.usage}
                              >
                                {getUsage(version)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  {!!Object.keys(groupedBrowsers.mobile)?.length && (
                    <h3>Mobile</h3>
                  )}
                  {Object.keys(groupedBrowsers.mobile).map((key) => {
                    const versions = groupedBrowsers.mobile[key];

                    return (
                      <div key={key} className={styles.list}>
                        <div className={styles.listLeft}>
                          <div
                            className={cn(
                              styles.browserIcon,
                              "icon",
                              `icon-${getIconName(key)}`
                            )}
                          />
                          {getName(key)}
                        </div>

                        <div className={styles.listRight}>
                          {versions.map((version) => (
                            <div key={version} className={styles.version}>
                              <span>{getVersion(version)}</span>
                              <span
                                data-tip={getTooltipData(version)}
                                data-tip-disable={!usage[version]}
                                className={styles.usage}
                              >
                                {getUsage(version)}
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
                      {animatedCoverage.coverage.interpolate((x) =>
                        Math.trunc(x)
                      )}
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
        </div>
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <div className={styles.madeBy}>
              <PSPDFKit className={styles.logo} />
              Made by&nbsp;
              <a href="https://pspdfkit.com" target="_blank">
                PSPDFKit
              </a>
            </div>
            <div className={styles.dependencies}>
              <div>
                <div>Code on</div>
                <a
                  href="https://github.com/PSPDFKit-labs/browserslist.dev"
                  target="_blank"
                >
                  Github
                </a>
              </div>

              <div>
                <div>Functionality provided by</div>
                <a
                  href="https://github.com/browserslist/browserslist"
                  target="_blank"
                >
                  browserslist {browserslistVersion}
                </a>
              </div>

              <div>
                <div>Data provided by</div>
                <a
                  href="https://github.com/ben-eb/caniuse-lite"
                  target="_blank"
                >
                  caniuse-db {canIUse}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export async function getServerSideProps({ query }) {
  let initialBrowsers;
  try {
    const config = atob(query.q);
    initialBrowsers = browserslist(config);
  } catch (e) {
    initialBrowsers = browserslist("last 2 versions");
  }

  const files = await globby("*/*.json", {
    cwd: path.resolve("./", "data"),
  });

  const savedData = {};

  files.forEach((file) => {
    savedData[file] = JSON.parse(
      fs.readFileSync(path.resolve("./data", file), {
        encoding: "utf-8",
      })
    );
  });

  return {
    props: {
      savedData,
      initialBrowsers,
      searchQuery: query,
    },
  };
}

function getUsage(version) {
  if (usage[version]?.toString(10) === "0") return "0%";

  return typeof usage[version] === "number"
    ? `${usage[version].toFixed(3)}%`
    : "N/A";
}

function getTooltipData(version) {
  return typeof usage[version] === "number" ? `${usage[version]}%` : "N/A";
}
