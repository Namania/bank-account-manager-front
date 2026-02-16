import { motion } from "framer-motion";

export default function SlideYAnimation({ children, className = "", delay = 0, reverse = false }) {
    return (
        <motion.div
          initial={{ opacity: 0, y: reverse ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: delay }}
          className={ className }
        >{ children }</motion.div>
    );
}
