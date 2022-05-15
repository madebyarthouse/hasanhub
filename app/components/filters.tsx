import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { motion } from 'framer-motion';
import cx from 'classnames';

export type TimeFilterOptions =
  | 'all'
  | 'short'
  | 'medium'
  | 'long'
  | 'extralong';

const TimeFilterTab = ({
  active,
  value,
  label,
}: {
  active: boolean;
  value: TimeFilterOptions;
  label: string;
}) => {
  return (
    <ToggleGroup.Item
      value={value}
      className={cx(
        'px-3 py-2 text-sm border border-twitchPurpleLight transition-colors min-w-min hover:bg-twitchPurple duration-400 hover:text-white saturate-50 relative rounded-lg ',
        active ? 'bg-twitchPurple text-white' : 'text-twitchPurpleLight'
      )}
    >
      {label}
    </ToggleGroup.Item>
  );
};

const TimeFilters = ({
  value,
  onValueChange,
}: {
  value: TimeFilterOptions;
  onValueChange: (value: TimeFilterOptions) => void;
}) => {
  return (
    <ToggleGroup.Root
      className="flex flex-row flex-wrap rounded gap-3"
      type="single"
      value={value}
      onValueChange={onValueChange}
    >
      <TimeFilterTab active={'all' === value} value="all" label="All" />
      <TimeFilterTab active={'short' === value} value="short" label="< 2 min" />
      <TimeFilterTab
        active={'medium' === value}
        value="medium"
        label="2 - 15 min"
      />
      <TimeFilterTab active={'long' === value} value="long" label="15-30 min" />
      <TimeFilterTab
        active={'extralong' === value}
        value="extralong"
        label="> 30 min"
      />
    </ToggleGroup.Root>
  );
};

const Filters = ({
  onTimeFilterChange,
  timeFilterValue,
}: {
  onTimeFilterChange: (value: TimeFilterOptions) => void;
  timeFilterValue: TimeFilterOptions;
}) => {
  return (
    <>
      <div className="flex flex-row">
        <TimeFilters
          value={timeFilterValue}
          onValueChange={onTimeFilterChange}
        />
      </div>
    </>
  );
};

export default Filters;
