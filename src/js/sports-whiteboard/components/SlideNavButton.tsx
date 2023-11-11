/* This example requires Tailwind CSS v2.0+ */
import React, { MouseEventHandler } from "react";

function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(" ");
}

type SlideNavButtonProps = {
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  selected: boolean;
};

const SlideNavButton: React.FC<
  React.PropsWithChildren<SlideNavButtonProps>
> = ({ onClick, children, selected }) => {
  if (!onClick) {
    return (
      <div>
        <span
          className={classNames(
            selected ? "bg-gray-100 text-gray-900" : "text-gray-700",
            "block px-4 py-2 text-lg pt-4"
          )}
        >
          {children}
        </span>
      </div>
    );
  }

  return (
    <div>
      <a
        onClick={onClick}
        className={classNames(
          selected ? "bg-gray-100 text-gray-900" : "text-gray-700",
          "block px-4 py-2 text-md cursor-pointer"
        )}
      >
        {children}
      </a>
    </div>
  );
};

export default SlideNavButton;
