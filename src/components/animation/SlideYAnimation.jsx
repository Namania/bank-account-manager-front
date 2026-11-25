import { motion } from "framer-motion";

export default function SlideYAnimation({ children, className = "", delay = 0, reverse = false }) {
    return (
        <motion.div
          initial={{ opacity: 0, y: reverse ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: delay * 0.35, ease: "easeOut" }}
          className={ className }
        >{ children }</motion.div>
    );
}
