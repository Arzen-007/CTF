import React from 'react';
import { motion } from 'framer-motion';

const LandingPage = ({ onSignIn, onSignUp }) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          Green Eco CTF
        </h1>
        <p className="text-2xl md:text-3xl mb-8 text-green-300">
          Hack for a Greener Tomorrow
        </p>
        <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
          Join the ultimate cybersecurity challenge where every solved problem contributes to environmental awareness. 
          Compete with teams worldwide while making a positive impact on our planet.
        </p>
        
        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-green-900/30 backdrop-blur-sm border border-green-500/30 rounded-lg p-6"
          >
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2 text-green-300">Environmental Impact</h3>
            <p className="text-gray-300">Every challenge solved plants trees and reduces carbon footprint</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-green-900/30 backdrop-blur-sm border border-green-500/30 rounded-lg p-6"
          >
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2 text-green-300">Competitive Challenges</h3>
            <p className="text-gray-300">Web exploitation, cryptography, forensics, and more</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-green-900/30 backdrop-blur-sm border border-green-500/30 rounded-lg p-6"
          >
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold mb-2 text-green-300">Global Community</h3>
            <p className="text-gray-300">Connect with eco-conscious hackers worldwide</p>
          </motion.div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignUp}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Join the Mission
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignIn}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Sign In
          </motion.button>
        </div>

        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">500+</div>
            <div className="text-sm text-gray-400">Active Hackers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">1,200</div>
            <div className="text-sm text-gray-400">Trees Planted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">50+</div>
            <div className="text-sm text-gray-400">Challenges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">24/7</div>
            <div className="text-sm text-gray-400">Competition</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;

