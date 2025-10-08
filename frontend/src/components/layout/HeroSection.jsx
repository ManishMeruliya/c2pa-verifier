const HeroSection = ({ title, subtitle, className = "" }) => {
  return (
    <div className={`text-center mb-16 ${className}`}>
      
      
      <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
        {title}
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
        {subtitle}
      </p>
      
      
    </div>
  );
};

export default HeroSection;
