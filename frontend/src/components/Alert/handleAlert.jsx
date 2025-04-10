import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const handleAlert = ( title, text, icon, confirmButton ) => {
  console.log("title" + title);

  const MySwal = withReactContent(Swal);
  return MySwal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButton: confirmButton
  });
};
export default handleAlert;