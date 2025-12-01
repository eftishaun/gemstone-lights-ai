export default function IPhoneFrame({ children }) {
  return (
    <div className="relative inline-block">
      {/* iPhone Frame Container */}
      <div className="relative w-[450px] h-[920px]">
        {/* iPhone Frame Image */}
        <img 
          src="/images/apple-iphone-15-pro.png" 
          alt="iPhone Frame" 
          className="absolute inset-0 w-full h-full pointer-events-none select-none object-contain"
          style={{ zIndex: 10 }}
        />
        
        {/* Screen Content Area */}
        <div 
          className="absolute bg-white overflow-hidden"
          style={{
            top: '54px',
            left: '34px',
            width: '382px',
            height: '806px',
            borderRadius: '50px',
            zIndex: 1
          }}
        >
          {/* iOS Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-11 z-50">
            <img 
              src="/images/Status Bar.svg" 
              alt="Status Bar" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="pt-11 h-full">
            {children}
          </div>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full" />
        </div>
      </div>
    </div>
  )
}
