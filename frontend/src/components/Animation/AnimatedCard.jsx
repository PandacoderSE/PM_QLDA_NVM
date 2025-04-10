import React from "react";
import { motion } from "framer-motion";
const AnimatedCard = ({ children, animationType, duration = 1, delay = 0 }) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: animationType === "slideUp" ? 100 : 0,
      scale: animationType === "scaleUp" ? 0.8 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration, delay }}
      className=""
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
