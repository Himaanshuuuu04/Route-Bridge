"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full fixed top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm"
      >
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img src="/logo.webp" alt="EvoGlobal Insight" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              EvoGlobal Insight
            </span>
          </Link>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/signin"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signin"
              className="text-sm font-semibold px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-blue-600 focus:outline-none rounded-lg bg-slate-50 border border-slate-200"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-[73px] left-0 w-full z-40 bg-white border-b border-slate-200 shadow-2xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-8">
              <div className="flex flex-col gap-4">
                <Link
                  href="/signin"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors bg-slate-50 border border-slate-200 rounded-full"
                >
                  Sign in
                </Link>
                <Link
                  href="/signin"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
