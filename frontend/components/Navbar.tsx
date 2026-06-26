"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Analytics", href: "#analytics" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full fixed top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-350">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent group-hover:text-white transition-colors">
              SurveyRouter
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative py-1 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-emerald-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/signin"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signin"
              className="text-sm font-medium px-5 py-2.5 bg-white text-black rounded-full hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white focus:outline-none focus:ring-1 focus:ring-zinc-800 rounded-lg bg-white/5 border border-white/5"
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
            className="fixed top-[73px] left-0 w-full z-45 bg-[#09090b]/95 border-b border-white/5 backdrop-blur-xl md:hidden overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col gap-4 px-6 py-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-zinc-400 hover:text-white transition-colors py-1"
                >
                  {link.name}
                </Link>
              ))}

              <hr className="border-white/5 my-2" />

              <div className="flex flex-col gap-4">
                <Link
                  href="/signin"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-full"
                >
                  Sign in
                </Link>
                <Link
                  href="/signin"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition-colors flex items-center justify-center gap-1.5"
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
