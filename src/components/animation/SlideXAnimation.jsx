import { motion } from "framer-motion";

export default function SlideXAnimation({ children, className = "", delay = 0, reverse = false }) {
    return (
        <motion.div
          initial={{ opacity: 0, x: reverse ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: delay * 0.35, ease: "easeOut" }}
          className={ className }
        >{ children }</motion.div>
    );
}
