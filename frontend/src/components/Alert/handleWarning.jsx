import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const handleWarning = ({ title, icon }) => {
  console.log("title" + title);

  const MySwal = withReactContent(Swal);
  return MySwal.fire({
    title: title,
    icon: icon,
  });
};
export default handleWarning;
