import react from "react";
import NavButton from "./NavButton";

type StepButtonProps = {
  children: React.ReactNode;
  selected: boolean;
  onClick?: react.MouseEventHandler<HTMLButtonElement>;
  id: string;
  keyboardShortcut: string;
  tooltipDir?: string;
  tooltipText?: string;
};

const selectedState = [
  "bg-indigo-50",
  "border-indigo-500",
  "text-indigo-600",
  "z-10",
];

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
  "px-1",
  "py-1",
  "relative",
  "text-gray-500",
  "text-sm",
];

const noop: react.MouseEventHandler<HTMLButtonElement> = () => {};

const StepButton: React.FC<StepButtonProps> = ({
  children,
  selected,
  onClick,
  id,
  keyboardShortcut,
  tooltipDir,
  tooltipText,
}) => {
  const classes = [];
  classes.push(...alwaysClasses);

  if (selected) {
    classes.push(...selectedState);
  } else {
    classes.push(...unselectedState);
  }
  const clickHandler = onClick || noop;

  return (
    <NavButton
      onClick={clickHandler}
      onKey={clickHandler}
      showKeyboardShortcut={false}
      selected={selected}
      id={id}
      keyboardShortcut={keyboardShortcut}
      narrow={true}
      tooltipText={tooltipText}
      tooltipDir={tooltipDir}
    >
      {children}
    </NavButton>
  );
};

export default StepButton;
