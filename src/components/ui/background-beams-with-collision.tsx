"use client";
import React, { useEffect, useState } from "react";
import { useMotionValue, motion, animate } from "framer-motion";

export const BackgroundBeamsWithCollision = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // The effect that runs
  useEffect(() => {
    const ctx = gsap.context(() => {});
    return () => ctx.revert();
  }, []);

  const pointerLocation = useMotionValue({ x: 0, y: 0 });
  const [hasPointerMoved, setHasPointerMoved] = useState(false);

  // Handle pointer move
  const handlePointerMove = (e: React.PointerEvent) => {
    const { clientX, clientY } = e;
    animate(pointerLocation, { x: clientX, y: clientY }, { duration: 0.8 });
    setHasPointerMoved(true);
  };

  return (
    <div
      className="h-screen relative flex items-center justify-center"
      style={{ backgroundColor: "#f8e6ff" }}
      onPointerMove={handlePointerMove}
    >
      <svg className="hidden">
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
      </svg>
      <div
        className="absolute inset-0 overflow-hidden bg-opacity-50"
        style={{
          filter: "url(#blur)",
        }}
      >
        <div className="absolute inset-0">
          <motion.div
            style={{
              position: "absolute",
              top: hasPointerMoved ? pointerLocation.y : "50%",
              left: hasPointerMoved ? pointerLocation.x : "50%",
              transform: "translate(-50%, -50%)",
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, rgba(155, 135, 245, 0.8) 0%, rgba(155, 135, 245, 0) 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "25%",
              width: "500px",
              height: "500px",
              background: "radial-gradient(circle, rgba(155, 135, 245, 0.8) 0%, rgba(155, 135, 245, 0) 70%)",
              borderRadius: "100%",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "10%",
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, rgba(155, 135, 245, 0.8) 0%, rgba(155, 135, 245, 0) 70%)",
              borderRadius: "100%",
              opacity: 0.4,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              left: "20%",
              width: "600px",
              height: "600px",
              background: "radial-gradient(circle, rgba(155, 135, 245, 0.8) 0%, rgba(155, 135, 245, 0) 70%)",
              borderRadius: "100%",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              right: "15%",
              width: "500px",
              height: "500px",
              background: "radial-gradient(circle, rgba(155, 135, 245, 0.8) 0%, rgba(155, 135, 245, 0) 70%)",
              borderRadius: "100%",
              opacity: 0.4,
            }}
          />
        </div>
      </div>
      {children}
    </div>
  );
};
