import React from "react";
import "../../styles/primitives.css";

type CardProps = {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Card({ title, eyebrow, children, footer }: CardProps) {
  return (
    <section className="ui-card">
      {(title || eyebrow) && (
        <header className="ui-card__header">
          {eyebrow && <span className="ui-card__eyebrow">{eyebrow}</span>}
          {title && <h3 className="ui-card__title">{title}</h3>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
      {footer && <footer className="ui-card__footer">{footer}</footer>}
    </section>
  );
}
