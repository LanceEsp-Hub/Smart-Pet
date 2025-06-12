"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, UploadCloud } from "lucide-react";

export default function LoadingScreen({ progress, status }) {
  const isComplete = progress >= 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center z-[999]"
      >
        <motion.div
          initial={{ y: 20, scale: 0.98, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white/90 dark:bg-gray-900/90 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl border border-white/20 dark:border-gray-700/50 backdrop-blur-md"
        >
          <div className="flex flex-col items-center">
            {/* Animated icon with pulse effect */}
            <motion.div
              animate={{
                rotate: isComplete ? [0, 5, -5, 0] : 360,
                scale: isComplete ? [1, 1.1, 1] : 1,
              }}
              transition={{
                rotate: { 
                  repeat: isComplete ? 0 : Infinity, 
                  duration: 2, 
                  ease: "linear" 
                },
                scale: { 
                  repeat: isComplete ? 2 : 0,
                  duration: 0.5,
                  ease: "easeInOut"
                }
              }}
              className="mb-6"
            >
              {isComplete ? (
                <CheckCircle className="h-14 w-14 text-green-500 drop-shadow-md" strokeWidth={1.5} />
              ) : (
                <UploadCloud className="h-14 w-14 text-purple-500 drop-shadow-md" strokeWidth={1.5} />
              )}
            </motion.div>

            {/* Status text with smoother transition */}
            <motion.h3 
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white"
            >
              {status || (isComplete ? "Upload Complete!" : "Uploading your pet data...")}
            </motion.h3>

            {/* Glowing progress bar */}
            <div className="w-full bg-gray-200/70 dark:bg-gray-700/70 rounded-full h-3 mb-4 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`h-full rounded-full relative ${
                  isComplete 
                    ? 'bg-green-500 shadow-green-500/30' 
                    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-purple-500/30'
                } shadow-lg`}
              >
                {!isComplete && (
                  <motion.div
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "linear"
                    }}
                    className="absolute top-0 left-0 w-1/4 h-full bg-white/30 backdrop-blur-sm"
                  />
                )}
              </motion.div>
            </div>

            {/* Progress text with glow */}
            <div className="flex justify-between w-full text-sm font-medium">
              <motion.span 
                animate={{
                  color: isComplete ? "#10B981" : "#6B7280"
                }}
                className="text-gray-600 dark:text-gray-300"
              >
                {isComplete ? "Completed" : "Uploading..."}
              </motion.span>
              <motion.span
                animate={{
                  scale: [1, 1.1, 1],
                  color: isComplete ? "#10B981" : "#6B7280"
                }}
                transition={{ repeat: isComplete ? 1 : 0 }}
                className="font-semibold text-gray-700 dark:text-gray-200"
              >
                {progress}%
              </motion.span>
            </div>

            {/* Confetti-like effect on completion */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute inset-0 overflow-hidden pointer-events-none"
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      x: "50%",
                      y: "50%",
                      rotate: Math.random() * 360
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      rotate: Math.random() * 360
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.05,
                      ease: "easeOut"
                    }}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: `hsl(${Math.random() * 60 + 120}, 80%, 60%)`
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}