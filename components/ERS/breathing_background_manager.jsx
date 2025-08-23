// components/BreathingBackgroundManager.jsx

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function BreathingBackgroundManager({ phase }) {
  const [backgroundImage, setBackgroundImage] = useState("/images/fog.png");
  const [backgroundVisible, setBackgroundVisible] = useState(true);

  useEffect(() => {
    if (phase === "fog") {
      // Transition back to fog
      setBackgroundVisible(false);
      setTimeout(() => {
        setBackgroundImage("/images/fog.png");
        setBackgroundVisible(true);
      }, 4000); // 4s fade-out then swap
    } else if (phase === "universe") {
      // Transition to universe
      setBackgroundVisible(false);
      setTimeout(() => {
        setBackgroundImage("/images/universe.png");
        setBackgroundVisible(true);
      }, 4000); // 4s fade-out then swap
    }
  }, [phase]);

  return (
    <motion.div
      className="breathing-background"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
      }}
      animate={{ opacity: backgroundVisible ? 1 : 0 }}
      transition={{ duration: 4 }} // 4 seconds for fade
    />
  );
}