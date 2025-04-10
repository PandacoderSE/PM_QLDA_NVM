import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const handleClicking = ({
  title,
  icon,
  showCancelButton,
  confirmButtonText,
  cancelButtonText,
  customeMessage,
}) => {
  console.log("title" + title);

  const MySwal = withReactContent(Swal);
  return MySwal.fire({
    title: title,
    icon: icon,
    showCloseButton: "Yes",
    showCancelButton: showCancelButton,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
  }).then((result) => {
    if (result.isConfirmed) {
      MySwal.fire(customeMessage, "", "success");
    }
  });
};
export default handleClicking;
