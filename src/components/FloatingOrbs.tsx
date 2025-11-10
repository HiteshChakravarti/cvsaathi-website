import { motion } from "motion/react";

export function FloatingOrbs() {
  const orbs = [
    {
      size: 400,
      top: "10%",
      left: "10%",
      gradient: "from-purple-500/20 to-pink-500/20",
      duration: 20,
    },
    {
      size: 300,
      top: "60%",
      right: "15%",
      gradient: "from-blue-500/20 to-cyan-500/20",
      duration: 15,
    },
    {
      size: 200,
      bottom: "20%",
      left: "20%",
      gradient: "from-pink-500/20 to-purple-500/20",
      duration: 25,
    },
  ];

  return (
    <>
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full bg-gradient-to-br ${orb.gradient} blur-3xl`}
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
          }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}
