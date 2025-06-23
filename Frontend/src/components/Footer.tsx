
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Send } from 'lucide-react';

const Footer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // SMTP integration would go here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ email: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <footer id="contact" className="bg-gray-900 text-white py-16" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Contact Form */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-center mb-8">
            Contact <span className="text-green-500">Us</span>
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <label htmlFor="email" className="block text-lg font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-white"
                placeholder="your.email@company.com"
                required
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <label htmlFor="message" className="block text-lg font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-white resize-none"
                placeholder="Tell us about your feedback or questions..."
                required
              />
            </motion.div>
            
            <motion.button
              type="submit"
              className="w-full py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Send Message</span>
              <Send className="w-5 h-5" />
            </motion.button>
          </form>
        </motion.div>
        
        {/* Copyright */}
        <motion.div
          className="text-center pt-8 border-t border-gray-700"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-gray-400">
            © 2025 Bites Space. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;