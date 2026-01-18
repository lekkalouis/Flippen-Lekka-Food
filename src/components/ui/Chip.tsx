import React from "react";
import "../../styles/primitives.css";

type ChipProps = {
  label: string;
  tone?: "accent" | "muted" | "danger";
};

export function Chip({ label, tone = "accent" }: ChipProps) {
  return <span className={`ui-chip ui-chip--${tone}`}>{label}</span>;
}
