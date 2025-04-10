// src/components/Flower.jsx
import React, { useEffect, useRef } from "react";
import { TweenMax, Linear, Sine } from "gsap";

const Flower = ({ className, type }) => {
  const flowerRef = useRef(null);

  useEffect(() => {
    const flower = flowerRef.current;
    const w = window.innerWidth;
    const h = window.innerHeight;
    TweenMax.set(flower, {
      x: Math.random() * w,
      y: Math.random() * -200 - 150,
      z: Math.random() * 400 - 200,
      xPercent: -50,
      yPercent: -50,
      className,
    });
    animateFlower(flower, h);
  }, [className]);

  const animateFlower = (flower, h) => {
    TweenMax.to(flower, Math.random() * 9 + 6, {
      y: h + 100,
      ease: Linear.easeNone,
      repeat: -1,
      delay: -15,
    });
    TweenMax.to(flower, Math.random() * 4 + 4, {
      x: "+=100",
      rotationZ: Math.random() * 180,
      repeat: -1,
      yoyo: true,
      ease: Sine.easeInOut,
    });
    TweenMax.to(flower, Math.random() * 6 + 2, {
      repeat: -1,
      yoyo: true,
      ease: Sine.easeInOut,
      delay: -5,
    });
  };

  return <div ref={flowerRef} className={className}></div>;
};

export default Flower;
