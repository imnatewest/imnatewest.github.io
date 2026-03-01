import React, { useState } from 'react';

const NotepadWindow = () => {
  const [text, setText] = useState(() => {
    return localStorage.getItem('nateos-notepad') || 'Welcome to Notepad.\n\nType your notes here. They will be saved automatically across visits.';
  });

  const handleChange = (e) => {
    setText(e.target.value);
    localStorage.setItem('nateos-notepad', e.target.value);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white text-black font-sans">
      <div className="flex gap-4 px-2 py-0.5 border-b border-[#dfdfdf] bg-[#f0f0f0] text-sm select-none">
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-pointer">File</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-pointer">Edit</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-pointer">Format</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-pointer">View</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-pointer">Help</span>
      </div>
      <textarea
        className="flex-1 w-full p-2 resize-none outline-none shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
        style={{ fontFamily: "'Consolas', 'Courier New', monospace" }}
        value={text}
        onChange={handleChange}
        spellCheck="false"
      />
    </div>
  );
};

export default NotepadWindow;
