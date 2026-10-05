"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 深色背景 */}
      <div className="absolute inset-0 bg-[#0A0A0F]" />
      
      {/* TRON 风格网格线 */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* 霓虹光带 - 青色 */}
      <div 
        className="absolute w-[600px] h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-30"
        style={{
          top: '20%',
          left: '-10%',
          animation: 'float-horizontal 25s ease-in-out infinite',
          filter: 'blur(1px)'
        }}
      />
      
      {/* 霓虹光带 - 紫色 */}
      <div 
        className="absolute w-[500px] h-[2px] bg-gradient-to-r from-transparent via-[#BF00FF] to-transparent opacity-25"
        style={{
          top: '40%',
          right: '-10%',
          animation: 'float-horizontal-reverse 30s ease-in-out infinite',
          filter: 'blur(1px)'
        }}
      />
      
      {/* 霓虹光带 - 粉色 */}
      <div 
        className="absolute w-[400px] h-[2px] bg-gradient-to-r from-transparent via-[#FF00FF] to-transparent opacity-20"
        style={{
          top: '60%',
          left: '20%',
          animation: 'float-horizontal 35s ease-in-out infinite',
          filter: 'blur(1px)'
        }}
      />
      
      {/* 霓虹光球 - 青色 */}
      <div 
        className="absolute w-[300px] h-[300px] rounded-full bg-[#00F0FF] opacity-[0.03]"
        style={{
          top: '10%',
          left: '10%',
          animation: 'float-diagonal 20s ease-in-out infinite',
          filter: 'blur(60px)'
        }}
      />
      
      {/* 霓虹光球 - 紫色 */}
      <div 
        className="absolute w-[250px] h-[250px] rounded-full bg-[#BF00FF] opacity-[0.03]"
        style={{
          bottom: '20%',
          right: '15%',
          animation: 'float-diagonal-reverse 25s ease-in-out infinite',
          filter: 'blur(60px)'
        }}
      />
      
      {/* 霓虹光球 - 粉色 */}
      <div 
        className="absolute w-[200px] h-[200px] rounded-full bg-[#FF00FF] opacity-[0.02]"
        style={{
          top: '50%',
          left: '50%',
          animation: 'float-random 30s ease-in-out infinite',
          filter: 'blur(50px)'
        }}
      />
      
      {/* 背景大字水印 - 霓虹色 */}
      <div className="absolute top-[8%] left-[5%] text-[120px] font-black text-[#00F0FF]/[0.02] select-none pointer-events-none"
        style={{ fontFamily: 'Orbitron, sans-serif' }}>
        CYBER
      </div>
      <div className="absolute bottom-[10%] right-[5%] text-[100px] font-black text-[#FF00FF]/[0.02] select-none pointer-events-none"
        style={{ fontFamily: 'Orbitron, sans-serif' }}>
        PUNK
      </div>
      <div className="absolute top-[45%] left-[50%] text-[80px] font-black text-[#BF00FF]/[0.015] select-none pointer-events-none"
        style={{ fontFamily: 'Orbitron, sans-serif' }}>
        2077
      </div>
      
      {/* 扫描线效果 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />
      
      {/* CSS 动画定义 */}
      <style jsx>{`
        @keyframes float-horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(calc(100vw + 100%)); }
        }
        
        @keyframes float-horizontal-reverse {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(calc(-100vw - 100%)); }
        }
        
        @keyframes float-diagonal {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(100px, 50px); }
          50% { transform: translate(200px, 0); }
          75% { transform: translate(100px, -50px); }
        }
        
        @keyframes float-diagonal-reverse {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-80px, -40px); }
          50% { transform: translate(-160px, 0); }
          75% { transform: translate(-80px, 40px); }
        }
        
        @keyframes float-random {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(150px, -100px); }
          66% { transform: translate(-100px, 150px); }
        }
      `}</style>
    </div>
  );
}
