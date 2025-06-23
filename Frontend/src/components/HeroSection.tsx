
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const HeroSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Floating ball animation variants
  const ballVariants = {
    animate: (i: number) => ({
      y: [0, -30, 10, -20, 0],
      x: [0, 15, -10, 5, 0],
      scale: [1, 1.2, 0.8, 1.1, 1],
      rotate: [0, 45, -30, 60, 0],
      transition: {
        duration: 6 + i * 0.7,
        repeat: Infinity,
        delay: i * 0.5,
        ease: "easeInOut"
      }
    })
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center pt-20 relative overflow-hidden" ref={ref}>
      {/* Enhanced Animated Background Balls - More scattered throughout */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top area balls */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`top-${i}`}
            className={`absolute rounded-full ${
              i % 5 === 0 ? 'w-4 h-4 bg-blue-400/30' : 
              i % 5 === 1 ? 'w-6 h-6 bg-green-400/25' :
              i % 5 === 2 ? 'w-3 h-3 bg-orange-300/35' : 
              i % 5 === 3 ? 'w-5 h-5 bg-purple-400/20' : 'w-2 h-2 bg-pink-400/40'
            }`}
            style={{
              left: `${2 + i * 6}%`,
              top: `${3 + (i % 6) * 12}%`,
            }}
            variants={ballVariants}
            animate="animate"
            custom={i}
          />
        ))}
        
        {/* Middle area balls */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`middle-${i}`}
            className={`absolute rounded-full ${
              i % 4 === 0 ? 'w-7 h-7 bg-rose-300/25' : 
              i % 4 === 1 ? 'w-3 h-3 bg-indigo-300/30' : 
              i % 4 === 2 ? 'w-5 h-5 bg-yellow-300/35' : 'w-4 h-4 bg-teal-300/25'
            }`}
            style={{
              right: `${5 + i * 8}%`,
              top: `${35 + (i % 4) * 18}%`,
            }}
            variants={ballVariants}
            animate="animate"
            custom={i + 15}
          />
        ))}
        
        {/* Bottom area balls */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`bottom-${i}`}
            className={`absolute rounded-full ${
              i % 3 === 0 ? 'w-6 h-6 bg-cyan-300/30' : 
              i % 3 === 1 ? 'w-4 h-4 bg-emerald-300/25' : 'w-3 h-3 bg-violet-300/35'
            }`}
            style={{
              left: `${8 + i * 10}%`,
              bottom: `${3 + (i % 3) * 12}%`,
            }}
            variants={ballVariants}
            animate="animate"
            custom={i + 27}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl lg:text-7xl font-bold leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="text-green-600">Hungry?</span>{' '}
            <span className="text-gray-800">Hassle in</span>{' '}
            <span className="text-blue-600">Queues?</span>
          </motion.h1>
          
          <motion.p
            className="text-xl lg:text-2xl text-gray-600 leading-relaxed"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Redefining Cafeteria Convenience. Bites Space is not just a digital menu—it's your smart food partner. Designed for modern offices, our platform connects you to your favorite cafeteria stalls, streamlines orders, and eliminates the hassle of queues.
          </motion.p>
        </motion.div>
        
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative">
            {/* Modern splashy polygon-shaped container for multi-cuisine platter with biryani, chicken masala, egg dishes */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden" style={{
                clipPath: 'polygon(5% 0%, 12% 2%, 20% 0%, 28% 3%, 35% 1%, 43% 4%, 50% 0%, 58% 2%, 65% 5%, 73% 1%, 80% 3%, 88% 0%, 95% 4%, 98% 12%, 100% 20%, 97% 28%, 99% 36%, 96% 44%, 98% 52%, 94% 60%, 97% 68%, 93% 76%, 89% 84%, 84% 91%, 78% 96%, 70% 99%, 62% 97%, 54% 100%, 46% 96%, 38% 98%, 30% 95%, 22% 97%, 14% 93%, 7% 88%, 3% 81%, 0% 73%, 2% 65%, 5% 57%, 1% 49%, 4% 41%, 2% 33%, 6% 25%, 3% 17%, 8% 9%)',
                height: '520px',
                width: '100%'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Multi-cuisine platter with biryani, chicken masala, egg dishes and various Indian delicacies"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20" />
              </div>
            </motion.div>
            

            
 
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;