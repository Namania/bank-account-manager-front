import { motion } from "framer-motion";

const group = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/** Children appear one after the other. Wrap each one in a StaggerItem. */
export function StaggerGroup({ children, className = "" }) {
    return (
        <motion.div variants={group} initial="hidden" animate="show" className={className}>
            {children}
        </motion.div>
    );
}

/** One element of a StaggerGroup. `lift` raises it slightly on hover. */
export function StaggerItem({ children, className = "", lift = false }) {
    return (
        <motion.div
            variants={item}
            whileHover={lift ? { y: -4, transition: { duration: 0.15 } } : undefined}
            whileTap={lift ? { scale: 0.98 } : undefined}
            className={className}
        >
            {children}
        </motion.div>
    );
}
