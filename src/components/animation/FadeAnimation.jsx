import { motion } from "framer-motion";

export default function FadeAnimation({ children, className = "", delay = 0, opacity = 1 }) {
    return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity }}
          transition={{ duration: 0.8, delay: delay }}
          className={ className }
        >{ children }</motion.div>
    );
}
