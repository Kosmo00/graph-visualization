import { useState } from "react";
import arrowDown from "../assets/arrow-down-icon.svg";

export type Option = { value: string | number; label: string };

type Props = {
  className?: string;
  icon?: string;
  label?: string;
  value?: string | number | null;
  onChange: (newValue: string | number) => void;
  placeholder?: string;
  options: Option[];
};

export default function SelectDropdownLabel({
  className,
  icon,
  label,
  placeholder,
  value,
  options,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const currentLabel = options.find((element) => element.value == value)?.label;

  return (
    <div className={`${className ?? ''} relative`}>
      {/* select */}
      <span
        className={`absolute text-[12px] top-2 left-5 bg-main-secondary px-2 ${
          open && "z-40"
        }`}
      >
        {label}
      </span>
      <div
        tabIndex={0}
        onClick={() => setOpen(!open)}
        className="w-full py-3 px-6 bg-main-secondary border border-white/5 rounded-full justify-between items-center flex cursor-pointer [&_p]:hover:text-text-primary [&_img]:hover:brightness-200"
      >
        {icon ? (
          <div className="flex items-center gap-2">
            <img src={icon} alt="icon" />
            <p className="text-lg">
              {currentLabel ? `${currentLabel}` : placeholder}
            </p>
          </div>
        ) : (
          <p className="text-lg">
            {currentLabel ? `${currentLabel}` : placeholder}
          </p>
        )}
        <img
          src={arrowDown}
          alt="icon-arrrow"
          className={`transition-all ${open && "rotate-180"}`}
        />
      </div>

      {/* options */}
      {open && (
        <div
          className={`absolute top-0 w-full bg-main-secondary border border-white rounded-3xl overflow-auto max-h-[250px] ${
            open ? "z-20" : "z-0"
          }`}
        >
          {options?.map(({ value, label }, index) => (
            <div
              key={index}
              onClick={() => {
                console.log(value)
                onChange(value);
                setOpen(false);
              }}
              className="w-full px-6 py-3 cursor-pointer hover:bg-hover"
            >
              <p className="text-lg">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
