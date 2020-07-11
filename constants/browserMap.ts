const map = new Map(
  Object.entries({
    and_chr: {
      name: "Chrome for Android",
      iconName: "chrome",
    },
    and_ff: {
      name: "Firefox for Android",
      iconName: "firefox",
    },
    and_qq: {
      name: "QQ Browser",
      iconName: "qq",
    },
    and_uc: {
      name: "UC Browser",
      iconName: "uc",
    },
    ios_saf: {
      name: "Safari for iOS",
      iconName: "ios-safari",
    },
    op_mob: {
      name: "Opera Mobile",
      iconName: "opera",
    },
    op_mini: {
      name: "Opera Mini",
      iconName: "opera-mini",
    },
    bb: {
      name: "Blackberry",
      iconName: "blackberry",
    },
    ie: {
      name: "Internet Explorer",
      iconName: "ie",
    },
    ie_mob: {
      name: "IE Mobile",
      iconName: "ie",
    },
  })
);

export function getVersion(browser: string) {
  return browser.split(" ")?.[1];
}

export function getName(browser: string) {
  return map.has(browser) ? map.get(browser).name : browser;
}

export function getIconName(browser: string) {
  return map.has(browser) ? map.get(browser).iconName : browser;
}
