import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { Navigate, useNavigate } from "react-router-dom";

const CardDefault = ({ icon, title, content }) => {
  const navigate = useNavigate();
  return (
    <Card className="mt-6 w-72 mx-12 h-60">
      <CardBody>
        <div className="mb-4 h-12 w-12 text-gray-900">{icon}</div>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {title}
        </Typography>
        <Typography>{content}</Typography>
      </CardBody>
    </Card>
  );
};

export default CardDefault;
