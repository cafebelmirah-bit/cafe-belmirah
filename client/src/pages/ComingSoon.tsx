import { motion } from 'framer-motion';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center"
        >
          {/* Logo / Brand */}
          <div className="mb-8">
            <div className="font-display text-4xl md:text-5xl font-light text-cream tracking-[0.2em] mb-2">CAFÉ</div>
            <div className="font-display text-6xl md:text-8xl font-light text-gradient-gold tracking-[0.3em] uppercase">BELMIRAH</div>
          </div>
          
          <div className="w-24 h-px bg-gold/50 mx-auto mb-10" />
          
          <h2 className="font-body text-lg md:text-xl text-cream/80 tracking-[0.3em] uppercase font-light mb-12">
            Something extraordinary is brewing
          </h2>
          
          <div className="glass px-8 py-4 border border-gold/20 rounded-lg">
            <p className="text-gold tracking-[0.4em] uppercase text-sm font-bold">
              Opening Soon
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
