import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

/**
 * Wraps a page so it fades/slides in on arrival and fades out on exit.
 * Exit animations only play because App.jsx wraps the routes in <AnimatePresence>.
 * Respects the user's "reduce motion" setting (fade only, no movement).
 *
 * @param {React.ReactNode} children - The page to animate.
 */
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