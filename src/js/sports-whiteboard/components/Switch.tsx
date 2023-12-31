/* This example requires Tailwind CSS v2.0+ */
import React, { useState } from "react";
import { Switch } from "@headlessui/react";

function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(" ");
}

type SwitchInterface = {
  setEnabled: Function;
  enabled: boolean;
  label: string;
};

const MySwitch: React.FC<React.PropsWithChildren<SwitchInterface>> = ({
  setEnabled,
  enabled,
  label,
}) => {
  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={enabled}
        onChange={() => {
          setEnabled(!enabled);
        }}
        className={classNames(
          enabled ? "bg-indigo-600" : "bg-gray-200",
          "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </Switch.Label>
    </Switch.Group>
  );
};

export default MySwitch;
