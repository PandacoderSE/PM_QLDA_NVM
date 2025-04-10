import { MouseEvent } from "react";

interface Props {
  children: React.ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  id?: string;
  buttonCss: string;
}
const BaseButton = ({ children, onClick, id, buttonCss }: Props) => {
  return (
    <>
      <button id={id} type="button" onClick={onClick} className={buttonCss}>
        {children}
      </button>
    </>
  );
};

export default BaseButton;
