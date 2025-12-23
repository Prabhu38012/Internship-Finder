import React from "react";
import { Card, CardContent, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const AnimatedCard = ({
  children,
  delay = 0,
  direction = "up",
  hover = true,
  ...cardProps
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
  };

  const variants = {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const hoverVariants = hover
    ? {
        hover: {
          y: -8,
          scale: 1.02,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          transition: {
            duration: 0.3,
            ease: "easeOut",
          },
        },
      }
    : {};

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover="hover"
      variants={{ ...variants, ...hoverVariants }}
    >
      <Card
        {...cardProps}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
          ...cardProps.sx,
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;
