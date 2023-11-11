import { SaveIcon, UploadIcon } from "@heroicons/react/solid";

interface StateNav {}

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

const buttonClasses = (selected: boolean) => {
  const classes = [];
  classes.push(...alwaysClasses);
  if (selected) {
    classes.push(...selectedState);
  } else {
    classes.push(...unselectedState);
  }

  return classes;
};

const StateNav: React.FC<StateNav> = ({}) => {
  return (
    <nav
      className="mr-12 relative z-0 inline-flex rounded-md ml-12 mt-2 shadow-sm -space-x-px"
      aria-label="Pagination"
    >
      <button
        className={buttonClasses(false).join(" ")}
        onClick={() => {
          console.log("save on click");
        }}
      >
        <SaveIcon className="w-5 h-5"></SaveIcon>
      </button>
      <button className={buttonClasses(false).join(" ")}>
        <UploadIcon className="w-5 h-5"></UploadIcon>
      </button>
    </nav>
  );
};

export default StateNav;
