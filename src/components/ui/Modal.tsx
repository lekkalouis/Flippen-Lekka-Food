import React from "react";
import "../../styles/primitives.css";

type ModalProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function Modal({ title, description, isOpen, actions, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="ui-modal__backdrop" role="dialog" aria-modal="true">
      <div className="ui-modal">
        <header className="ui-modal__header">
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </header>
        <div className="ui-modal__body">{children}</div>
        {actions && <footer className="ui-modal__footer">{actions}</footer>}
      </div>
    </div>
  );
}
