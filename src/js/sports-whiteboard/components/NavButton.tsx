import hotkeys from "hotkeys-js";
import React, { useEffect, MouseEventHandler } from "react";
import { useState } from "react";
import { isTouchDevice } from "../lib/detect";
import ToolTip from "./ToolTip";

type NavButtonProps = {
  id: string;
  children: React.ReactNode;
  selected?: boolean;
  tooltipText?: string;
  tooltipDir?: string;
  keyboardShortcut: string;
  onKey: Function;
  onClick: MouseEventHandler<HTMLButtonElement>;
  showKeyboardShortcut: boolean;
  narrow?: boolean;
  disabled?: boolean;
};

const selectedState = ["bg-indigo-50", "border-indigo-500", "text-indigo-600"];

const unselectedState = [
  "bg-white",
  "border-gray-300",
  "hover:bg-gray-50",
  "text-gray-500",
];

const alwaysClasses = [
  "border-gray-300",
  "border",
  "font-medium",
  "hover:bg-gray-100",
  "inline-flex",
  "items-center",
  "py-2",
  "relative",
  "text-gray-500",
  "text-sm",
];

const NavButton: React.FC<NavButtonProps> = ({
  children,
  selected = false,
  id,
  tooltipText,
  tooltipDir,
  keyboardShortcut,
  onKey,
  onClick,
  showKeyboardShortcut = true,
  narrow = false,
  disabled = false,
}) => {
  useEffect(() => {
    hotkeys(keyboardShortcut, (e) => {
      onKey();
      e.preventDefault();
    });

    return () => {
      hotkeys.unbind(keyboardShortcut);
    };
  });

  const [tooltip, setTooltip] = useState(false);
  const classes = [];
  classes.push(...alwaysClasses);
  if (selected) {
    classes.push(...selectedState);
  } else {
    classes.push(...unselectedState);
  }
  classes.push(narrow ? "px-2" : "px-3");

  let keyboardShortcutDisplay = <></>;
  if (showKeyboardShortcut) {
    keyboardShortcutDisplay = (
      <div className="absolute bottom-1 right-1 text-xs">
        {keyboardShortcut}
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={onClick}
          className={classes.join(" ")}
          id={id}
          onMouseEnter={(e) => {
            !isTouchDevice() && setTooltip(true);
          }}
          onMouseLeave={() => {
            setTooltip(false);
          }}
          disabled={disabled}
        >
          {children}
          {keyboardShortcutDisplay}
        </button>
        {tooltipText ? (
          <ToolTip open={tooltip} text={tooltipText} dir={tooltipDir} />
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default NavButton;
