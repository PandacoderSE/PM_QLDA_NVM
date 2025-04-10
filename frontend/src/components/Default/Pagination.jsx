import React from "react";
import ReactPaginate from "react-paginate";
import PropTypes from "prop-types";
import { MdArrowBack, MdArrowBackIos, MdArrowForward, MdArrowLeft, MdArrowRight, MdNextWeek } from "react-icons/md";

const Pagination_T = ({ pageCount, onPageChange }) => {
  if (pageCount <= 1) return null;
  return (
    <ReactPaginate
      previousLabel={(<MdArrowBack size={20}/>)}
      nextLabel={(<MdArrowForward size={20}/>)}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
      onPageChange={onPageChange}
      containerClassName={"my-4 flex justify-center mt-4"}
      pageClassName={"mx-1"}
      pageLinkClassName={
        "block px-3 py-2 leading-tight text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 rounded"
      }
      previousClassName={"mx-1"}
      previousLinkClassName={
        "block px-3 py-2 leading-tight text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 rounded"
      }
      nextClassName={"mx-1"}
      nextLinkClassName={
        "block px-3 py-2 leading-tight text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 rounded"
      }
      breakClassName={"mx-1"}
      breakLinkClassName={
        "block px-3 py-2 leading-tight text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 rounded"
      }
      activeClassName={"text-black rounded"}
      activeLinkClassName={
        "block px-3 py-2 leading-tight text-white bg-blue-500 border border-blue-500 rounded"
      }
      disabledClassName={"opacity-50 cursor-not-allowed"}
    />
  );
};

Pagination_T.propTypes = {
  pageCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination_T;
