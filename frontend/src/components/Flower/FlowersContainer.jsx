// src/components/FlowersContainer.jsx
import React from "react";
import Flower from "./Flowers";

const FlowersContainer = () => {
  const totalFlowers = 10;
  const flowerClasses = ["dot", "dot2", "dot3"];

  const flowers = Array.from({ length: totalFlowers * 3 }).map((_, i) => {
    const className = flowerClasses[i % 3];
    return <Flower key={i} className={className} />;
  });

  return (
    <div id="container" className="flower-container">
      {flowers}
    </div>
  );
};

export default FlowersContainer;
