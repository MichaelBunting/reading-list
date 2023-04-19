import styles from './styles.module.css';

type InputProps = React.HTMLProps<HTMLInputElement> & {
  variant?: 'dark' | 'light'
};

const Input = (inputProps: InputProps) => {
  return (
    <input
      {...inputProps}
      className={`${inputProps.className || ''} ${styles.input} ${inputProps.variant ? styles[`input--${inputProps.variant}`] : ''}`}
    />
  );
}

export default Input;