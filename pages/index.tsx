import browserslist from "browserslist";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/main.module.scss";
import { getIconName, getName, getVersion } from "@constants/browserMap";
import { useRouter } from "next/router";
import Search from "@assets/svgs/search.svg";
import Info from "@assets/svgs/info.svg";
import PSPDFKit from "@assets/svgs/pspdfkit.svg";
import Error from "@assets/svgs/error.svg";
import DottedFloor from "@assets/svgs/dotted-floor.svg";
import Arrow from "@assets/svgs/arrow.svg";
import ArrowDown from "@assets/svgs/arrow-down.svg";
import Disclaimer from "@assets/svgs/disclaimer.svg";
import { useSpring, animated } from "react-spring";
import { CoverageBar } from "@components/CoverageBar/CoverageBar";
import groupBy from "just-group-by";
import packageBrowserslist from "browserslist/package.json";
import packageCanIUse from "caniuse-lite/package.json";
import fs from "fs";
import globby from "globby";
import path from "path";
import Head from "next/head";
import cn from "classnames";
import atob from "atob";
import ReactTooltip from "react-tooltip";
import { SelectVersion } from "@components/SelectVersion/SelectVersion";

function getConfigFromQuery() {
  if (typeof window !== "undefined") {
    const query = new URLSearchParams(window.location.search);
    if (query.has("q")) {
      return atob(query.get("q"));
    }
  }

  return "last 2 versions";
}

export default function Home({
  savedData,
  initialBrowsers,
  searchQuery,
  usage,
}) {
  const preSavedData = useMemo(() => {
    let { ref, version } = searchQuery;

    if (ref === "pspdfkit") {
      const ver = version?.split(".");
      if (ver?.length === 2) ver?.push("0");
      version = ver?.join(".");
    }

    if (ref && version) {
      const x = savedData[`${ref}/${version}.json`];
      x.version = version;
      return x;
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
  const [makeAPICall, setMakeAPICall] = useState(false);
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
    async function handleUrlChange() {
      const config = getConfigFromQuery();
      let browsers;
      if (makeAPICall) {
        const res = await fetch(`/api/browsers`, {
          method: "POST",
          body: config,
        });
        browsers = await res.json();
      } else {
        browsers = browserslist(config);
      }
      setSupportedBrowsers(browsers);
      setConfig(config);
    }

    router.events.on("routeChangeComplete", handleUrlChange);

    return () => {
      router.events.off("routeChangeComplete", handleUrlChange);
    };
  }, [makeAPICall]);

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
      if (
        e.message.toLowerCase().includes("in client-side build of browserslist")
      ) {
        setMakeAPICall(true);
        setError("");
        router.push({
          pathname: "/",
          query: {
            q: btoa(config),
          },
        });
      } else {
        setError(e.message);
      }
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

  useEffect(() => {
    if (!preSavedData) return;
    preSavedData.supportedBrowsers &&
      setSupportedBrowsers(preSavedData.supportedBrowsers);
    debugger;
  }, [preSavedData]);

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

  const disclaimerText =
    preSavedData &&
    "This is the list of browsers supported on the day this version was released.";

  const options = useMemo(
    () =>
      Object.keys(savedData).map((x) => {
        const label = x.split("/")[1].replace(".json", "");
        return {
          label,
          value: label,
        };
      }),
    [savedData]
  );

  const [featureQuery, setFeatureQuery] = useState("");
  const [featureQueryResponse, setFeatureQueryResponse] = useState([]);

  React.useEffect(() => {
    (async () => {
      if (featureQuery) {
        const featuresData = await fetch(`/api/features`, {
          method: "POST",
          body: featureQuery,
        }).then((res) => res.json());

        setFeatureQueryResponse(featuresData.map((feature) => feature.title));

        if (
          featuresData.length === 1 &&
          featuresData[0].title.toLowerCase() === featureQuery.toLowerCase()
        ) {
          const queryTokens = Object.entries(featuresData[0].stats).reduce(
            (acc, [browser, versions]) => {
              const firstSupportingVersion = Object.entries(versions).find(
                ([_, support]) => support === "y"
              )?.[0];

              if (!firstSupportingVersion) {
                return acc;
              }

              let extractedFirstSupportingVersion;

              if (firstSupportingVersion.includes("-")) {
                extractedFirstSupportingVersion =
                  firstSupportingVersion.split("-")[0];
              } else {
                extractedFirstSupportingVersion = firstSupportingVersion;
              }

              return acc.concat([
                `${browser} >= ${extractedFirstSupportingVersion}`,
              ]);
            },
            []
          );
          setConfig(queryTokens.join(", "));
        }
      }
    })();
  }, [featureQuery]);

  return (
    <>
      <Head>
        <title>Browserslist</title>
        <meta charSet="UTF-8" />
        <meta
          name="description"
          content="A page to display compatible browsers from browserslist string."
        />
      </Head>
      <div className={styles.wrapper}>
        <ReactTooltip effect="solid" backgroundColor="#4636e3" />
        <div className={styles.containerWrapper}>
          <div className={styles.container} ref={headerRef}>
            <header className={styles.header}>
              <span className={styles.title}>browserslist</span>

              {preSavedData?.title ? (
                <div className={styles.preSavedDatatitlewrapper}>
                  <div
                    className={cn(
                      styles.description,
                      styles.presavedDescription
                    )}
                    dangerouslySetInnerHTML={{ __html: preSavedData?.title }}
                  />
                  <SelectVersion
                    options={options}
                    preSavedData={preSavedData}
                  />
                </div>
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
                    onChange={(event) => {
                      setFeatureQuery("");
                      setFeatureQueryResponse([]);
                      setConfig(event.target.value);
                    }}
                    placeholder="Browser query..."
                  />
                  {error && (
                    <div
                      className={cn(styles.tooltip, {
                        [styles.stickyTooltip]: sticky,
                      })}
                    >
                      <div className={styles.errorIcon}>
                        <Error />
                      </div>

                      <span className={styles.tooltiptext}>{error}</span>
                    </div>
                  )}
                </div>

                <div className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} />
                  <input
                    className={error && styles.error}
                    type="text"
                    value={featureQuery}
                    onChange={(event) => setFeatureQuery(event.target.value)}
                    placeholder="Query by feature..."
                    list="features"
                  />
                  {featureQueryResponse && (
                    <datalist id="features">
                      {featureQueryResponse.map((featureTitle, index) => (
                        <option
                          key={`${featureTitle}_${index}`}
                          value={featureTitle}
                        />
                      ))}
                    </datalist>
                  )}
                  {error && (
                    <div
                      className={cn(styles.tooltip, {
                        [styles.stickyTooltip]: sticky,
                      })}
                    >
                      <div className={styles.errorIcon}>
                        <Error />
                      </div>

                      <span className={styles.tooltiptext}>{error}</span>
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

          {coverage && !preSavedData && (
            <section key="progress" className={styles.progressContainer}>
              <div className={styles.horProgressWrapper}>
                <animated.div
                  style={{
                    width: animatedCoverage.coverage.interpolate(
                      (x) => `${Math.trunc(x as number)}%`
                    ),
                  }}
                ></animated.div>
                <span>Overall Browser Coverage: {coverage}%</span>
              </div>
            </section>
          )}

          {preSavedData && (
            <div className={styles.disclaimer}>
              <div className={styles.disclaimerInner}>
                <Disclaimer />

                <p>{disclaimerText}</p>
              </div>
            </div>
          )}

          <div
            style={{
              overflow: "hidden",
            }}
          >
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

                          <div
                            className={styles.listRight}
                            style={{
                              width: preSavedData ? 82 : 164,
                            }}
                          >
                            {versions.map((version) => (
                              <div
                                key={version}
                                className={cn(styles.version, {
                                  [styles.versionPresaved]: preSavedData,
                                })}
                              >
                                <span>{getVersion(version)}</span>
                                {!preSavedData && (
                                  <span
                                    data-tip={getTooltipData(version, usage)}
                                    data-tip-disable={!usage.global[version]}
                                    className={styles.usage}
                                  >
                                    {getUsage(version, usage)}
                                  </span>
                                )}
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

                          <div
                            className={styles.listRight}
                            style={{
                              width: preSavedData ? 82 : 164,
                            }}
                          >
                            {versions.map((version) => (
                              <div
                                key={version}
                                className={cn(styles.version, {
                                  [styles.versionPresaved]: preSavedData,
                                })}
                              >
                                <span>{getVersion(version)}</span>
                                {!preSavedData && (
                                  <span
                                    data-tip={getTooltipData(version, usage)}
                                    data-tip-disable={!usage.global[version]}
                                    className={styles.usage}
                                  >
                                    {getUsage(version, usage)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.coverageSidebar}>
                  {preSavedData ? (
                    <div
                      className={styles.coverageCount}
                      style={{
                        flexDirection: "column",
                        height: "auto",
                      }}
                    >
                      <Disclaimer />

                      <p>{disclaimerText}</p>
                    </div>
                  ) : (
                    <div className={styles.coverageCount}>
                      Overall browser coverage: <br />
                      <span>
                        <animated.span>
                          {animatedCoverage.coverage.interpolate((x) =>
                            Math.trunc(x as number)
                          )}
                        </animated.span>
                        %
                      </span>
                    </div>
                  )}
                  {!preSavedData && (
                    <>
                      <div className={styles.bar}>
                        <CoverageBar value={animatedCoverage.coverage} />
                      </div>
                      <DottedFloor className={styles.dottedFloor} />
                    </>
                  )}
                </div>
              </main>
            </div>
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
                  GitHub
                </a>
              </div>

              <div>
                <div>Functionality provided by</div>
                <a
                  href="https://github.com/browserslist/browserslist"
                  target="_blank"
                >
                  browserslist {packageBrowserslist.version}
                </a>
              </div>

              <div>
                <div>Data provided by</div>
                <a
                  href="https://github.com/ben-eb/caniuse-lite"
                  target="_blank"
                >
                  caniuse-db {packageCanIUse.version}
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
      usage: browserslist.usage,
    },
  };
}

function getUsage(version, usage) {
  const globalUsage = usage.global;

  if (globalUsage[version]?.toString(10) === "0") return "0%";

  return typeof globalUsage[version] === "number"
    ? `${globalUsage[version].toFixed(3)}%`
    : "N/A";
}

function getTooltipData(version, usage) {
  return typeof usage.global[version] === "number"
    ? `🌐 ${usage.global[version]}%`
    : "N/A";
}
