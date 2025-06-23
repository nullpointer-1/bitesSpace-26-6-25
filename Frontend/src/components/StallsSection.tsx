
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const StallsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Dynamic stalls data matching admin module vendor data
  const stalls = [
    {
      name: "Spice Paradise",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      specialty: "Multi Cuisine"
    },
    {
      name: "Healthy Bites",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      specialty: "Healthy Food"
    },
    {
      name: "Fast Corner",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      specialty: "Fast Food"
    },
    {
      name: "Cafe Delight",
      image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      specialty: "Cafe & Beverages"
    },
    {
      name: "Snack Hub",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      specialty: "Snacks"
    },
    {
      name: "Green Bowl",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      specialty: "Healthy Food"
    },
    {
      name: "Pizza Point",
      image: "https://img.freepik.com/free-photo/pizza-pizza-filled-with-tomatoes-salami-olives_140725-1200.jpg?semt=ais_hybrid&w=740",
      specialty: "Fast Food"
    },
    {
      name: "Tea Time",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      specialty: "Cafe & Beverages"
    }
  ];

  return (
    <section id="stalls" className="py-20 bg-gradient-to-br from-blue-50 to-blue-100" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Our <span className="text-blue-600">Food</span> <span className="text-green-600">Stalls</span>
          </h2>
          <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Discover amazing flavors from our partner stalls</p>
        </motion.div>
        
        {/* Seamless Continuous Marquee Animation */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex space-x-8"
            animate={{
              x: [0, -(320 + 32) * stalls.length]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop"
            }}
            style={{ width: `${(320 + 32) * stalls.length * 3}px` }}
          >
            {/* Triple the stalls for seamless loop */}
            {[...stalls, ...stalls, ...stalls].map((stall, index) => (
              <motion.div
                key={`${stall.name}-${index}`}
                className="flex-shrink-0 w-80 bg-white rounded-3xl shadow-xl overflow-hidden group cursor-pointer border border-blue-200"
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  boxShadow: "0 25px 50px rgba(37, 99, 235, 0.2)",
                  borderColor: "#2563eb"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={stall.image}
                    alt={stall.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-sm font-medium bg-blue-600 px-3 py-1 rounded-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      {stall.specialty}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {stall.name}
                  </h3>
                  <p className="text-gray-600" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Fresh, quality ingredients delivered daily</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StallsSection;