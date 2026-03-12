const BackgroundDecorations = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Floating decorative squares */}
      <div 
        className="bg-decoration w-32 h-32 top-[10%] left-[5%] animate-float"
        style={{ animationDelay: '0s' }}
      />
      <div 
        className="bg-decoration w-24 h-24 top-[20%] right-[10%] animate-float"
        style={{ animationDelay: '1s' }}
      />
      <div 
        className="bg-decoration w-40 h-40 bottom-[15%] left-[8%] animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div 
        className="bg-decoration w-28 h-28 bottom-[25%] right-[5%] animate-float"
        style={{ animationDelay: '0.5s' }}
      />
      <div 
        className="bg-decoration w-20 h-20 top-[50%] left-[15%] animate-float"
        style={{ animationDelay: '1.5s' }}
      />
      <div 
        className="bg-decoration w-36 h-36 top-[5%] right-[25%] animate-float"
        style={{ animationDelay: '2.5s' }}
      />
      <div 
        className="bg-decoration w-16 h-16 bottom-[40%] right-[20%] animate-float"
        style={{ animationDelay: '3s' }}
      />
      <div 
        className="bg-decoration w-24 h-24 bottom-[10%] left-[30%] animate-float"
        style={{ animationDelay: '1.2s' }}
      />
      <div 
        className="bg-decoration w-20 h-20 top-[35%] right-[35%] animate-float"
        style={{ animationDelay: '2.2s' }}
      />
    </div>
  );
};

export default BackgroundDecorations;
