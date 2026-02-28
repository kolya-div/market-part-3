"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// Interfaces for our strictly-typed frontend
export interface DiscountProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    discount_price: number | null;
    is_discount: boolean;
    image: string;
    brand: string;
    stock: number;
    rating: number;
    rating_count: number;
    tag: string;
}

export default function DiscountCarousel() {
    const [products, setProducts] = useState<DiscountProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [width, setWidth] = useState(0);

    const carouselRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const isInView = useInView(carouselRef, { once: false, amount: 0.2 });

    useEffect(() => {
        // Phase 2 sync: Fetch from the newly created Flask endpoint
        const fetchDiscountProducts = async () => {
            try {
                const res = await fetch('/api/products/sale');
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                if (data.success && data.products) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDiscountProducts();
    }, []);

    useEffect(() => {
        // Calculate full scrollable width for framer-motion drag constraints
        if (carouselRef.current) {
            setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
        }
    }, [products]);

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [isInView, controls]);

    // Framer Motion variants for Apple-style smooth entry
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 12 }
        }
    };

    if (loading) {
        return (
            <div className="w-full h-80 flex items-center justify-center">
                <div className="animate-pulse w-8 h-8 rounded-full bg-indigo-500"></div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="relative w-full py-16 overflow-hidden bg-[#fafafa]">
            <div className="max-w-7xl mx-auto px-6 mb-10">
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-gray-900">
                    Exclusive Flash Sales.
                    <span className="block text-gray-500 font-normal">Don't miss out.</span>
                </h2>
            </div>

            <motion.div
                ref={carouselRef}
                variants={containerVariants}
                initial="hidden"
                animate={controls}
                className="cursor-grab active:cursor-grabbing max-w-[1400px] mx-auto overflow-hidden pl-6"
            >
                <motion.div
                    drag="x"
                    dragConstraints={{ right: 0, left: -width }}
                    className="flex gap-6 pb-8 px-4"
                >
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="min-w-[280px] md:min-w-[340px] h-[440px] rounded-3xl p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/10 backdrop-blur-xl border border-white/20 transition-all duration-300"
                            style={{
                                // Glassmorphism Apple-Style base
                                background: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%)",
                                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.05)"
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-100 rounded-full">
                                    Save ${(product.price - (product.discount_price || 0)).toFixed(0)}
                                </span>
                                <button className="text-gray-400 hover:text-red-500 transition-colors">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 flex items-center justify-center py-6 pointer-events-none">
                                <motion.img
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    src={product.image}
                                    alt={product.name}
                                    className="max-h-[160px] object-contain drop-shadow-xl"
                                    draggable="false"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <h3 className="font-semibold text-lg text-gray-900 leading-tight line-clamp-2">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>

                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-2xl font-bold tracking-tight text-gray-900">
                                        ${product.discount_price ? product.discount_price.toFixed(2) : product.price.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">
                                        ${product.price.toFixed(2)}
                                    </span>
                                </div>

                                <button
                                    className="mt-4 w-full py-3.5 bg-gray-900 text-white rounded-2xl font-medium text-sm hover:bg-black transition-colors flex justify-center items-center gap-2 group"
                                    onClick={() => alert(`Added ${product.name} to cart`)}
                                >
                                    Add to Bag
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
}
