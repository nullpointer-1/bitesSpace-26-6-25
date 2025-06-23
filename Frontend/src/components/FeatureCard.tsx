
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, image }) => {
  return (
    <motion.div
      className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100/50 h-full group cursor-pointer overflow-hidden relative"
      whileHover={{ 
        y: -8,
        boxShadow: "0 25px 50px rgba(37, 99, 235, 0.15)",
        borderColor: "#2563eb",
        backgroundColor: "rgba(255, 255, 255, 0.9)"
      }}
      transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* Background Image with much higher transparency */}
      <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300">
        <img 
          src={image} 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <motion.div
          className="w-24 h-24 bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
          whileHover={{ rotate: 5 }}
        >
          <Icon className="w-12 h-12 text-white" />
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {description}
        </p>
      </div>

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ scale: 0 }}
        whileHover={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default FeatureCard;