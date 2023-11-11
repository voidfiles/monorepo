type ComponentDict = {
  [key: string]: string[];
};
type PoistionDict = {
  [key: string]: ComponentDict;
};

const classesByPosition: PoistionDict = {
  bottom: {
    tooltip: ["top-full", "left-1/2", "-translate-x-1/2", "mb-3"],
    text: ["top-[-2px]", "left-1/2", "-translate-x-1/4"],
  },
  top: {
    tooltip: ["bottom-full", "left-1/2", "-translate-x-1/2", "mt-3"],
    text: ["bottom-[-2px]", "left-1/2", "-translate-x-1/2"],
  },
  right: {
    tooltip: ["left-full", "top-1/2", "-translate-y-1/2"],
    text: [
      "left-[-2px]",
      "right-full",
      "top-1/2",
      "-translate-x-1/4",
      "-translate-y-1/4",
    ],
  },
  left: {
    tooltip: ["right-full", "top-1/2", "-translate-y-1/2"],
    text: [
      "right-[-2px]",
      "left-full",
      "top-[42%]",
      "-translate-x-2/3",
      "-translate-y-1/2",
    ],
  },
};
const tooltipClasses = [
  "absolute",
  "z-40",
  "whitespace-nowrap",
  "rounded",
  "bg-black",
  "py-[6px]",
  "px-4",
  "text-sm",
  "font-semibold",
  "text-white",
];

const textClasses = [
  "absolute",
  "-z-10",
  "h-2",
  "w-4",
  "rotate-45",
  "rounded-sm",
  "bg-black",
];

interface ToolTipProps {
  open: boolean;
  text: string;
  dir?: string;
}

const ToolTip: React.FC<ToolTipProps> = ({ text, open, dir = "bottom" }) => {
  if (!open) {
    return <></>;
  }

  const tl: Array<String> = [];
  tl.push(...tooltipClasses);
  tl.push(...classesByPosition[dir]["tooltip"]);
  const t: Array<String> = [];
  t.push(...textClasses);
  t.push(...classesByPosition[dir]["text"]);

  return (
    <div className={tl.join(" ")}>
      <span className={t.join(" ")}></span>
      {text}
    </div>
  );
};

export default ToolTip;
