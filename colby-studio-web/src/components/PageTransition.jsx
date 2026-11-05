import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

export default function PageTransition({ children }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 1, ease } }}
      exit={{ opacity: 0, y: reduce ? 0 : -8, transition: { duration: 1, ease } }}
    >
      {children}
    </motion.div>
  );
}