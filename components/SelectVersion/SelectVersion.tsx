import ReactSelect from "react-select";
import React, { useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./SelectVersion.module.scss";
import DropdownIndicator from "@assets/svgs/select-arrow.svg";

const Indicator = () => <DropdownIndicator style={{ marginRight: 10 }} />;

const customStyle = {
  container: (provided) => ({
    ...provided,
    outline: "none",
    width: 150,
    cursor: "pointer",
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#1F2F3D" : "#061828",
    border: "2px solid #384653",
    outline: "none",
    cursor: "pointer",
    ...(state.menuIsOpen
      ? {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }
      : null),
  }),
  valueContainer: (provided) => ({
    ...provided,
    outline: "none",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "white",
  }),
  menu: (provided) => ({
    ...provided,
    margin: 0,
    backgroundColor: "#061828",
    border: "2px solid #384653",
    borderTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
  }),
  option: (provided, state) => {
    const isLast =
      state.options[state.options.length - 1].label === state.label;
    return {
      ...provided,
      color: "white",
      backgroundColor: state.isFocused ? "#4636E3" : undefined,
      borderBottom: !isLast ? "2px solid #384653" : undefined,
      cursor: "pointer",
    };
  },
};

export const SelectVersion: React.FC<IProps> = ({ options, preSavedData }) => {
  const router = useRouter();

  const handleChange = useCallback(
    ({ value }) => {
      router.push({
        pathname: "/",
        query: {
          ...router.query,
          version: value,
        },
      });
    },
    [router]
  );

  return (
    <ReactSelect
      className={styles.container}
      defaultValue={options.filter((x) => x.value === preSavedData.version)}
      options={options}
      classNamePrefix="bl"
      styles={customStyle}
      onChange={handleChange}
      components={{ DropdownIndicator: Indicator }}
    />
  );
};

interface IProps {
  options: {
    label: string;
    value: string;
  }[];
  preSavedData: {
    version: string;
    [k: string]: any;
  };
}
