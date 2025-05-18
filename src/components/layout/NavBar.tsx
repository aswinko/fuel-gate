"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

import { Fuel } from "lucide-react";
import LogoutBtn from "@/components/LogoutBtn";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/actions/auth-actions";



export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const isUserLoggedIn = async () => {
      const data = await getCurrentUser();
      setUser(data);
    };
    isUserLoggedIn();
  }, []);


  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-white/80 ${
        scrolled ? " backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto container flex h-20 items-center justify-between py-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 font-bold text-xl"
        >
          <Fuel className="h-6 w-6 text-purple-600" />
          <span>Fuel Gate</span>
        </motion.div>
        <nav className="hidden md:flex items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href="#features"
              className="text-sm font-medium hover:text-purple-600 transition-colors"
            >
              Features
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:text-purple-600 transition-colors"
            >
              How It Works
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="#benefits"
              className="text-sm font-medium hover:text-purple-600 transition-colors"
            >
              Benefits
            </Link>
          </motion.div>
        </nav>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          {user ? (
            <LogoutBtn />
          ) : (
            <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-200/50 transition-all">
              <Link href="/login">Log In</Link>
            </Button>
          )}
        </motion.div>
      </div>
    </header>
  );
}
