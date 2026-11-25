import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatMoney } from "@/lib/format";

/** An amount that counts up (or down) to its value whenever it changes. */
export default function AnimatedMoney({ value, className = "" }) {
    const { i18n } = useTranslation();
    const language = i18n.language;
    const reduceMotion = useReducedMotion();
    const node = useRef(null);
    const shown = useRef(0);
    const target = parseFloat(value) || 0;

    useEffect(() => {
        const write = (amount) => {
            shown.current = amount;
            if (node.current) node.current.textContent = formatMoney(amount, language);
        };
        if (reduceMotion) {
            write(target);
            return;
        }
        const controls = animate(shown.current, target, { duration: 0.6, ease: "easeOut", onUpdate: write });
        return () => controls.stop();
    }, [target, language, reduceMotion]);

    // The final value is in the markup from the start, for assistive technology.
    return <span ref={node} className={`tabular-nums ${className}`}>{formatMoney(target, language)}</span>;
}
