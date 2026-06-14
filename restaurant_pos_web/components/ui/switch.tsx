import * as React from "react"

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
}

export const Switch = ({ className, checked, onCheckedChange, defaultChecked, ...props }: SwitchProps) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false);

  // Use controlled state if 'checked' is provided, otherwise use internal state
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextChecked = !isChecked;
    if (!isControlled) {
      setInternalChecked(nextChecked);
    }
    if (onCheckedChange) {
      onCheckedChange(nextChecked);
    }
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleToggle}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isChecked ? 'bg-orange-600' : 'bg-gray-200'} ${className}`}
      {...props}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}
