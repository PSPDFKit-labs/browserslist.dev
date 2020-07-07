import React, { memo } from "react";
import styles from "./CoverageBar.module.scss";
import { animated, AnimatedValue } from "react-spring";

export const CoverageBar: React.FunctionComponent<{
  value: AnimatedValue<any>;
}> = memo(function ({ value }) {
  const height = value.interpolate((x) => (1 - x / 100) * 520);

  return (
    <div className={styles.bar}>
      <svg width={42} height={549} viewBox="0 0 42 549" fill="none">
        <path
          transform="matrix(.86603 -.5 0 1 21.022 23.525)"
          fill="#4636E3"
          d="M0 0H23.4415V524.917H0z"
        />
        <path
          transform="matrix(.86603 .5 0 1 .721 11.76)"
          fill="#5e5ceb"
          d="M0 0H23.4415V524.721H0z"
        />
        <path
          transform="matrix(.86603 .5 -.86603 .5 21.073 0)"
          fill="#2B1CC1"
          d="M0 0H23.5005V23.5005H0z"
        />
      </svg>
      <animated.div
        className={styles.barLeft}
        style={{
          height,
        }}
      />
      <animated.div
        className={styles.barRight}
        style={{
          height,
        }}
      />
    </div>
  );
});
