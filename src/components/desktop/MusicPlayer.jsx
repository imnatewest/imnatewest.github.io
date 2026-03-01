import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, SkipForward } from 'lucide-react';

const TRACKS = [
  { name: "Lofi_by_Caden_Currie.mp3", url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Lofi_by_Caden_Currie.mp3" },
  { name: "Raspberrymusic_Upbeat.ogg", url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg" },
  { name: "Sappheiros_Perspective.ogg", url: "https://upload.wikimedia.org/wikipedia/commons/0/09/Sappheiros_-_Perspective_%28Lofi_Hip_Hop%29.ogg" },
  { name: "Chill_Elevator.mp3", url: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Chill_Elevator_%28Antti_Luode%29.mp3" }
];

const MusicPlayer = ({ isDark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackIndex, setTrackIndex] = useState(Math.floor(Math.random() * TRACKS.length));
  const audioRef = useRef(null);

  const currentTrack = TRACKS[trackIndex];

  useEffect(() => {
    // When track changes, auto-play it if the player is currently active
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [trackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopAudio = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100 || 0);
    }
  };

  // Convert percentage to a visual "EQ" style block representation
  const renderProgressBlocks = () => {
    const totalBlocks = 20;
    const filledBlocks = Math.floor((progress / 100) * totalBlocks);
    return Array.from({ length: totalBlocks }).map((_, i) => (
      <div 
        key={i} 
        className={`w-2 h-4 ${i < filledBlocks ? 'bg-[#00ff00]' : 'bg-[#003300]'}`}
        style={{ border: '1px solid #000' }}
      />
    ));
  };

  const buttonStyle = {
    background: '#333',
    borderTop: '2px solid #666',
    borderLeft: '2px solid #666',
    borderRight: '2px solid #111',
    borderBottom: '2px solid #111',
    color: '#00ff00',
  };

  const activeButtonStyle = {
    background: '#222',
    borderTop: '2px solid #111',
    borderLeft: '2px solid #111',
    borderRight: '2px solid #666',
    borderBottom: '2px solid #666',
    color: '#00cc00',
  };

  return (
    <div className="w-full h-full bg-[#111] text-[#00ff00] p-4 flex flex-col font-mono selection:bg-[#00ff00] selection:text-black" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={() => { setTrackIndex((prev) => (prev + 1) % TRACKS.length); setProgress(0); }}
        onTimeUpdate={handleTimeUpdate}
      />
      
      {/* Visualizer Display */}
      <div className="bg-black border border-[#333] p-3 mb-4 rounded flex flex-col items-center shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
        <div className="text-[10px] uppercase tracking-widest text-[#00aa00] mb-2 font-bold w-full flex justify-between">
          <span>{isPlaying ? '▶ PLAYING' : '■ STOPPED'}</span>
          <span>128 kbps 44kHz</span>
        </div>
        
        {/* Fake EQ / Song Title */}
        <div className="w-full flex justify-between items-end h-10 mb-2 overflow-hidden gap-4">
           {/* Animated EQ Bars */}
           <div className="flex gap-1 items-end h-full">
             {[
               { id: 1, dur: '0.6s', delay: '0.0s' },
               { id: 2, dur: '1.1s', delay: '0.2s' },
               { id: 3, dur: '0.8s', delay: '0.4s' },
               { id: 4, dur: '1.2s', delay: '0.1s' },
               { id: 5, dur: '0.9s', delay: '0.5s' },
               { id: 6, dur: '1.0s', delay: '0.3s' },
               { id: 7, dur: '0.7s', delay: '0.2s' },
               { id: 8, dur: '1.3s', delay: '0.6s' }
             ].map((anim) => (
               <div 
                 key={anim.id} 
                 className="w-3 bg-[#00ff00] origin-bottom shadow-[0_0_5px_#00ff00]" 
                 style={{ 
                   height: isPlaying ? '90%' : '5%', 
                   animation: isPlaying ? `eqBounce ${anim.dur} ease-in-out ${anim.delay} infinite alternate` : 'none',
                   transition: 'height 0.3s ease-out'
                 }} 
               />
             ))}
           </div>
           
           {/* Scrolling Marquee Title */}
           <div className="flex-1 overflow-hidden relative h-full flex items-center bg-[#001100] border border-[#004400] shadow-[inset_0_0_8px_rgba(0,0,0,1)]">
             <div 
                className="text-[13px] font-bold whitespace-nowrap absolute"
                style={{ 
                  animation: isPlaying ? "marquee 7s linear infinite" : "none",
                  left: isPlaying ? '100%' : '8px',
                }}
             >
                ▶ {currentTrack.name} [128kbps]
             </div>
           </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1 mb-4 justify-between bg-black p-2 border border-[#333]">
        {renderProgressBlocks()}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-auto">
        <div className="flex gap-2">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center active:scale-95"
            style={isPlaying ? activeButtonStyle : buttonStyle}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          <button 
            onClick={stopAudio}
            className="w-10 h-10 flex items-center justify-center active:scale-95"
            style={buttonStyle}
          >
            <Square className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setTrackIndex((prev) => (prev + 1) % TRACKS.length); setProgress(0); }}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-all"
            style={buttonStyle}
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 ml-0.5 text-[#00ff00]" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="text-[#00aa00] hover:text-[#00ff00]"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-24 accent-[#00ff00]"
          />
        </div>
      </div>

      <style>{`
        @keyframes eqBounce {
          0% { height: 10%; }
          50% { filter: hue-rotate(30deg); }
          100% { height: 100%; filter: hue-rotate(-20deg) brightness(1.5); }
        }
        @keyframes marquee {
          0% { left: 100%; transform: translateX(0); }
          100% { left: 0%; transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer;
