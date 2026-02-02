/**
 * ROGUE COSMIC - GSAP Animation Hooks
 * Premium animation utilities for React components
 * 
 * Usage:
 *   const ref = useGsapFadeIn({ delay: 0.2 });
 *   <div ref={ref}>Animated content</div>
 */

import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

// Use useLayoutEffect on client, useEffect for SSR safety
const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Basic fade-in animation on mount
 */
export function useGsapFadeIn(options = {}) {
    const ref = useRef(null);

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            gsap.from(element, {
                y: options.y ?? 20,
                opacity: 0,
                duration: options.duration ?? 0.5,
                delay: options.delay ?? 0,
                ease: options.ease ?? 'power2.out',
                clearProps: "transform" // Cleanup after animation to avoid layout issues
            });
        }, element); // Scope to element

        return () => ctx.revert();
    }, [options.y, options.duration, options.delay, options.ease]);

    return ref;
}

/**
 * Staggered fade-in for list items
 * Attach ref to parent container
 */
export function useGsapStagger(options = {}) {
    const ref = useRef(null);

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            const selector = options.childSelector || ':scope > *';
            // Check if children exist before animating to prevent warnings
            const children = element.querySelectorAll(selector);
            if (children.length === 0) return;

            // Use the actual elements instead of selector string
            gsap.from(children, {
                y: options.y ?? 20,
                opacity: 0,
                duration: options.duration ?? 0.5,
                stagger: options.stagger ?? 0.1,
                delay: options.delay ?? 0.1,
                ease: options.ease ?? 'power2.out',
                clearProps: "all"
            });
        }, element);

        return () => ctx.revert();
    }, [options.stagger, options.delay, options.childSelector]);

    return ref;
}

/**
 * Number counter animation
 */
export function useGsapCounter(endValue, options = {}) {
    const ref = useRef(null);
    const counterRef = useRef({ value: 0 });

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;
        if (!element || endValue === undefined) return;

        const ctx = gsap.context(() => {
            gsap.to(counterRef.current, {
                value: endValue,
                duration: options.duration ?? 1.5,
                delay: options.delay ?? 0.2,
                ease: options.ease ?? 'power2.out',
                onUpdate: () => {
                    if (ref.current) {
                        ref.current.textContent = Math.round(counterRef.current.value).toLocaleString();
                    }
                },
            });
        }, element);

        return () => ctx.revert();
    }, [endValue]);

    return ref;
}

/**
 * Hover Scale & Glow Effect
 * Premium interaction for cards/buttons
 */
export function useGsapHoverScale(options = {}) {
    const ref = useRef(null);
    const scale = options.scale ?? 1.02;
    const duration = options.duration ?? 0.3;

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            // Mouse Enter
            element.addEventListener('mouseenter', () => {
                gsap.to(element, {
                    scale: scale,
                    y: -2, // Slight lift
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(99, 102, 241, 0.2)', // Custom glow
                    borderColor: 'rgba(99, 102, 241, 0.5)', // Indigo-ish border
                    duration: duration,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            });

            // Mouse Leave
            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    scale: 1,
                    y: 0,
                    boxShadow: 'none', // Reset shadow? Or back to default? 
                    // Better to clearProps used by GSAP so CSS takes over again
                    borderColor: 'rgba(51, 65, 85, 0.5)', // Reset to default border
                    duration: duration,
                    ease: 'power2.out',
                    clearProps: 'boxShadow,borderColor,scale,y'
                });
            });
        }, element);

        return () => ctx.revert();
    }, [scale, duration]);

    return ref;
}

// Export default for backwards compatibility if any
export default {
    useGsapFadeIn,
    useGsapStagger,
    useGsapCounter,
    useGsapHoverScale
};
