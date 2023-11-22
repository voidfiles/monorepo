import { DocumentArrowDownIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";

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
        <DocumentArrowDownIcon className="w-5 h-5"></DocumentArrowDownIcon>
      </button>
      <button className={buttonClasses(false).join(" ")}>
        <DocumentArrowUpIcon className="w-5 h-5"></DocumentArrowUpIcon>
      </button>
    </nav>
  );
};

export default StateNav;
