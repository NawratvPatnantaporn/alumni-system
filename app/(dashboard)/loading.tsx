"use client"

import { motion } from "framer-motion"

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative h-12 w-12">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      </motion.div>
    </div>
  )
}
