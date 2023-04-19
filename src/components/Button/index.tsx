import styles from './styles.module.css';

type ButtonProps = {
  type: "button" | "submit" | "reset" | undefined;
  className?: React.HTMLProps<HTMLButtonElement>['className'];
  children?: React.HTMLProps<HTMLButtonElement>['children'];
  onClick?: React.HTMLProps<HTMLButtonElement>['onClick'];
  variant?: "dark" | "light" | "danger";
  size?: "sm";
};

const Button = ({ ...buttonProps }: ButtonProps) => {
  return (
    <button
      {...buttonProps}
      className={`
        ${buttonProps.className || ''}
        ${styles.btn}
        ${buttonProps.variant ? styles[`btn--${buttonProps.variant}`] : ''}
        ${buttonProps.size ? styles[`btn--${buttonProps.size}`] : ''}
      `}
    >
      {buttonProps.children}
    </button>
  )
};

export default Button;