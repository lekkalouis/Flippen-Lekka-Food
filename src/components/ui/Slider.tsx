import React from "react";
import "../../styles/primitives.css";

type SliderProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  valueLabel?: string;
};

export function Slider({ label, valueLabel, className = "", ...props }: SliderProps) {
  return (
    <label className={`ui-slider ${className}`.trim()}>
      <span className="ui-slider__label">{label}</span>
      <input type="range" className="ui-slider__input" {...props} />
      {valueLabel && <span className="ui-slider__value">{valueLabel}</span>}
    </label>
  );
}
