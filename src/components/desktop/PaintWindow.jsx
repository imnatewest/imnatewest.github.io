// src/components/desktop/PaintWindow.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Save, Trash2, Pencil, Eraser } from 'lucide-react';

const COLORS = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'
];

const STROKE_SIZES = [1, 3, 5, 8];

const PaintWindow = ({ isDark }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('pencil'); // 'pencil' | 'eraser'
  const [strokeSize, setStrokeSize] = useState(3);
  const [ctx, setCtx] = useState(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    
    // Fill background with white initially
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.lineCap = 'round';
    context.lineJoin = 'round';
    setCtx(context);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Handle touch events
    if (e.touches && e.touches.length > 0) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    
    // Handle mouse events
    return {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    const { offsetX, offsetY } = getCoordinates(e);
    
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = strokeSize;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (ctx && isDrawing) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'untitled.png';
      a.click();
    }
  };

  return (
    <div className="flex flex-col h-full w-full select-none" style={{ backgroundColor: '#c0c0c0', color: '#000' }}>
      {/* Menu Bar */}
      <div className="flex items-center px-1 py-0.5 border-b border-[#808080] text-[11px]" style={{ fontFamily: 'Tahoma, sans-serif' }}>
        <button className="px-1.5 hover:bg-[#000080] hover:text-white">File</button>
        <button className="px-1.5 hover:bg-[#000080] hover:text-white">Edit</button>
        <button className="px-1.5 hover:bg-[#000080] hover:text-white">View</button>
        <button className="px-1.5 hover:bg-[#000080] hover:text-white">Image</button>
        <button className="px-1.5 hover:bg-[#000080] hover:text-white">Colors</button>
        <button className="px-1.5 hover:bg-[#000080] hover:text-white">Help</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="w-[50px] shrink-0 border-r border-t border-r-[#808080] border-t-white bg-[#c0c0c0] p-1 flex flex-col gap-1 items-center">
          <div className="flex flex-wrap justify-between gap-0.5 w-[36px]">
            <button 
              className={`w-4 h-4 flex items-center justify-center border ${tool === 'pencil' ? 'border-[#808080] border-t-[#000] border-l-[#000] bg-[#e0e0e0]' : 'border-white border-b-[#808080] border-r-[#808080]'} active:bg-[#e0e0e0] active:border-[#808080] active:border-t-[#000] active:border-l-[#000]`}
              onClick={() => setTool('pencil')}
              title="Pencil"
            >
              <Pencil size={12} color="#000" />
            </button>
            <button 
              className={`w-4 h-4 flex items-center justify-center border ${tool === 'eraser' ? 'border-[#808080] border-t-[#000] border-l-[#000] bg-[#e0e0e0]' : 'border-white border-b-[#808080] border-r-[#808080]'} active:bg-[#e0e0e0] active:border-[#808080] active:border-t-[#000] active:border-l-[#000]`}
              onClick={() => setTool('eraser')}
              title="Eraser"
            >
              <Eraser size={12} color="#000" />
            </button>
          </div>
          
          <div className="mt-2 text-[10px] w-full text-center mb-1" style={{ fontFamily: 'Tahoma, sans-serif' }}>Size</div>
          <div className="flex flex-col border border-[#808080] border-t-[#000] border-l-[#000] bg-white w-[36px] py-1">
            {STROKE_SIZES.map(s => (
              <div 
                key={s} 
                className={`py-1 flex justify-center cursor-pointer ${strokeSize === s ? 'bg-[#000080]' : 'hover:bg-[#e0e0e0]'}`}
                onClick={() => setStrokeSize(s)}
              >
                <div className="bg-black shrink-0 rounded-full" style={{ width: s, height: s, backgroundColor: strokeSize === s ? 'white' : 'black' }} />
              </div>
            ))}
          </div>
          
          <button 
            className="mt-2 w-[36px] h-6 flex items-center justify-center border border-white border-b-[#808080] border-r-[#808080] active:border-[#808080] active:border-t-[#000] active:border-l-[#000]"
            onClick={clearCanvas}
            title="Clear Canvas"
          >
            <Trash2 size={12} color="#000" />
          </button>
          
          <button 
            className="mt-1 w-[36px] h-6 flex items-center justify-center border border-white border-b-[#808080] border-r-[#808080] active:border-[#808080] active:border-t-[#000] active:border-l-[#000]"
            onClick={saveImage}
            title="Save Image"
          >
            <Save size={12} color="#000" />
          </button>
        </div>

        {/* Canvas Area */}
        <div 
            ref={containerRef}
            className="flex-1 bg-[#808080] overflow-auto p-1 inset-outline"
        >
          <div className="border border-[#808080] border-t-black border-l-black border-r-white border-b-white bg-white w-fit shadow-sm relative">
             <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="cursor-crosshair block touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {/* Resize handles */}
              <div className="w-[5px] h-[5px] bg-[#000080] absolute -right-1.5 top-1/2 -translate-y-1/2" />
              <div className="w-[5px] h-[5px] bg-[#000080] absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
              <div className="w-[5px] h-[5px] bg-[#000080] absolute -bottom-1.5 -right-1.5" />
          </div>
        </div>
      </div>

      {/* Footer / Colors */}
      <div className="h-[64px] shrink-0 border-t border-t-white bg-[#c0c0c0] p-1 flex gap-2">
        <div className="w-[48px] h-[48px] border border-[#808080] border-t-[#000] border-l-[#000] bg-[#c0c0c0] relative shrink-0">
           {/* Secondary background color visually (always white for simplicity) */}
           <div className="w-[20px] h-[20px] bg-white border border-[#808080] border-b-white border-r-white absolute bottom-[6px] right-[6px] z-0"></div>
           {/* Primary color visually */}
           <div className="w-[20px] h-[20px] border border-[#808080] border-b-white border-r-white absolute top-[6px] left-[6px] z-10" style={{ backgroundColor: color }}></div>
        </div>
        
        <div className="grid grid-cols-8 grid-rows-2 gap-[1px] border border-[#808080] border-t-black border-l-black border-r-white border-b-white w-fit h-fit p-px bg-[#c0c0c0]">
          {COLORS.map((c, i) => (
            <div 
              key={i} 
              className={`w-[20px] h-[20px] border border-[#c0c0c0] border-b-[#808080] border-r-[#808080] cursor-pointer hover:border-[#000080] ${color === c ? 'border-[#000080]' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaintWindow;
