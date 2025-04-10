import React from "react";
import axios from 'axios';
export const getAllProduct = async() => {
    try {
        const response =  await axios.get('http://localhost:8080/api/events/all');
        return response.data;
    }
    catch(error) {
        console.log("Co loi khi lay san pham tu server !!");
        
    }
}