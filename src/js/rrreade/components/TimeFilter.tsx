import React from "react";
import { Select } from "@radix-ui/themes";

export enum TimeOptions {
  ANY_TIME = "Any Time",
  PAST_DAY = "Past Day",
  PAST_WEEK = "Past Week",
  PAST_MONTH = "Past Month",
  PAST_YEAR = "Past Year",
}

export const TimeItems = [
  TimeOptions.ANY_TIME,
  TimeOptions.PAST_DAY,
  TimeOptions.PAST_WEEK,
  TimeOptions.PAST_MONTH,
  TimeOptions.PAST_YEAR,
];

export interface TimeFilterProps {
  onChange: (value: TimeOptions) => void;
  currentValue?: TimeOptions;
}
const TimeFilter: React.FunctionComponent<TimeFilterProps> = ({
  onChange,
  currentValue,
}) => {
  return (
    <Select.Root
      defaultValue={TimeOptions.ANY_TIME}
      value={currentValue}
      onValueChange={onChange}
    >
      <Select.Trigger />
      <Select.Content>
        {TimeItems.map((v) => {
          return <Select.Item value={v}>{v}</Select.Item>;
        })}
      </Select.Content>
    </Select.Root>
  );
};

export default TimeFilter;
