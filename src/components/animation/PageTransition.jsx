import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

/** Each page fades and rises into place when the route changes. */
export default function PageTransition({ children, className = "" }) {
    const { pathname } = useLocation();

    return (
        <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
