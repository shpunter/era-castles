import type { ComponentPropsWithoutRef } from "react";
import { classnames } from "#/shared/classnames";
import css from "./button.module.css";

const Button = ({
  variant = "secondary",
  size = "md",
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) => {
  const classNames = classnames(
    {
      [css.button]: true,
      [css[variant]]: true,
      [css[size]]: true,
    },
    className ? [className] : [],
  );

  return (
    <button type={type} className={classNames} {...props}>
      <span className={css.label}>{children}</span>
    </button>
  );
};

export default Button;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "gold" | "danger" | "secondary";
  size?: "sm" | "md";
};
