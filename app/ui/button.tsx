interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({children, ...rest}: IButtonProps) {
  return (
    <button {...rest}>
      {children}
    </button>
  )
}
