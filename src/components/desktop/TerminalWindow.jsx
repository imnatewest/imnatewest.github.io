import React, { useState, useRef, useEffect } from 'react';

const TerminalWindow = ({ onOpenApp }) => {
  const [history, setHistory] = useState([
    { type: 'system', text: 'NateOS Command Prompt [Version 1.0.0]' },
    { type: 'system', text: '(c) 2026 Nathan West. All rights reserved.' },
    { type: 'system', text: '' },
    { type: 'system', text: 'Type "help" for a list of available commands.' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  // Focus input automatically when chatting in terminal
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const executeCommand = (cmd) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) {
      setHistory(prev => [...prev, { type: 'input', text: `C:\\USERS\\GUEST>` }]);
      return;
    }

    const newHistory = [...history, { type: 'input', text: `C:\\USERS\\GUEST> ${trimmedCmd}` }];
    const args = trimmedCmd.toLowerCase().split(' ');
    const mainCmd = args[0];

    let response = '';

    switch (mainCmd) {
      case 'help':
        response = 'Available commands: \n' +
                   '  help      - Show this help message\n' +
                   '  whoami    - Display current user info\n' +
                   '  date      - Display current date and time\n' +
                   '  clear     - Clear the terminal screen\n' +
                   '  open      - Open an application (e.g. "open resume", "open music")';
        break;
      case 'whoami':
        response = 'guest_user\nAccess Level: VISITOR';
        break;
      case 'date':
        response = new Date().toString();
        break;
      case 'clear':
        setHistory([]);
        return; // Early return to avoid adding the input/response
      case 'open':
        const appToOpen = args[1];
        if (appToOpen) {
          if (onOpenApp(appToOpen)) {
             response = `Opening ${appToOpen}.exe...`;
          } else {
             response = `Error: Application '${appToOpen}' not found. Try 'open projects' or 'open music'.`;
          }
        } else {
          response = 'Usage: open [application_name]';
        }
        break;
      default:
        response = `'${mainCmd}' is not recognized as an internal or external command,\noperable program or batch file.`;
    }

    if (response) {
      response.split('\n').forEach(line => {
        newHistory.push({ type: 'output', text: line });
      });
    }

    setHistory(newHistory);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    }
  };

  return (
    <div 
      className="w-full h-full bg-black text-[#00ff00] p-2 overflow-y-auto selection:bg-[#00ff00] selection:text-black cursor-text shadow-[inset_0_0_20px_rgba(0,0,0,1)]" 
      style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '14px' }}
      onClick={handleTerminalClick}
    >
      <div className="flex flex-col gap-0.5">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {line.text}
          </div>
        ))}
        {/* Active Input Line */}
        <div className="flex items-center">
          <span className="mr-2">C:\USERS\GUEST&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[#00ff00] outline-none border-none shadow-none"
            spellCheck="false"
            autoComplete="off"
            autoFocus
          />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default TerminalWindow;
