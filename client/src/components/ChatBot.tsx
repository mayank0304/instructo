import React, { useState, useRef, useEffect } from 'react';

interface ParticleProps {
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number;
  color: string;
  alpha: number;
  pulse: number;
  pulseFactor: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  code?: string;
}

interface ChatBotProps {
  selectedLanguage?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ selectedLanguage = 'javascript' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Welcome to Instructo! I'm your coding assistant for ${selectedLanguage}. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [code, setCode] = useState(`// ${selectedLanguage} Code Editor\n// Type your code here...\n\n`);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<ParticleProps[]>([]);
  
  const suggestedQuestions = [
    "How do I declare variables?",
    "Explain functions",
    "Fix my code"
  ];

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle mouse movement for glow effect
  const handleMouseMove = (e: MouseEvent) => {
    if (glowRef.current) {
      glowRef.current.style.left = `${e.clientX - 350}px`;
      glowRef.current.style.top = `${e.clientY - 350}px`;
    }
  };

  // Create a new particle
  const createParticle = (): ParticleProps => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as ParticleProps;

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      direction: Math.random() * Math.PI * 2,
      color: getRandomColor(),
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * 0.02 + 0.01,
      pulseFactor: 0,
    };
  };

  // Get random color for particle
  const getRandomColor = (): string => {
    const colors = ['#6766d0', '#5546ad', '#fd8f58', '#f3535b', '#2c3d95'];
    const idx = Math.floor(Math.random() * (Math.random() < 0.7 ? 3 : 5));
    return colors[idx];
  };

  // Initialize canvas and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    document.addEventListener('mousemove', handleMouseMove);

    // Create particles
    const particleCount = 50; // Fewer particles for better performance
    particlesRef.current = Array.from({ length: particleCount }, createParticle);

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        // Move particle
        particle.x += Math.cos(particle.direction) * particle.speed;
        particle.y += Math.sin(particle.direction) * particle.speed;
        
        // Pulse size effect
        particle.pulseFactor += particle.pulse;
        const sizeModifier = Math.sin(particle.pulseFactor) * 0.5 + 1;
        
        // Change direction slightly for more organic movement
        particle.direction += (Math.random() - 0.5) * 0.1;
        
        // If particle goes off-screen, reset it
        if (particle.x < 0 || particle.x > canvas.width || 
            particle.y < 0 || particle.y > canvas.height) {
          const newParticle = createParticle();
          Object.assign(particle, newParticle);
        }
        
        // Draw particle
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * sizeModifier, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date(),
        code: inputText.toLowerCase().includes('example') ? 
          `// Example ${selectedLanguage} code\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\n// Call the function\ngreet("Coder");` : 
          undefined
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };
  
  const generateBotResponse = (query: string): string => {
    // Simple response generation based on keywords
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      return "Hello! How can I help you with your coding questions today?";
    } else if (lowerQuery.includes('variable') || lowerQuery.includes('declare')) {
      return `In ${selectedLanguage}, you can declare variables using 'let', 'const', or 'var' keywords. Example: const name = 'value';`;
    } else if (lowerQuery.includes('function') || lowerQuery.includes('method')) {
      return `Functions in ${selectedLanguage} can be declared using the 'function' keyword or as arrow functions. Example: const add = (a, b) => a + b;`;
    } else if (lowerQuery.includes('fix') || lowerQuery.includes('error')) {
      return `I've analyzed your code. There appears to be a syntax error. Try adding a semicolon at the end of line 3 and check your bracket on line 5.`;
    } else {
      return `Thanks for your question about ${selectedLanguage}. I'll help you find the information you need. Could you provide more details or specify your question?`;
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
    // Focus on the input field
    const inputElement = document.getElementById('chat-input');
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  // Format timestamp
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="font-sans bg-[#121228] text-white min-h-screen flex flex-col relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-10"></canvas>
      <div ref={glowRef} className="absolute w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(103,102,208,0.4)_0%,rgba(85,70,173,0.3)_30%,rgba(44,61,149,0.2)_60%,rgba(18,18,40,0)_80%)] z-20 pointer-events-none blur-3xl animate-pulse"></div>
      
      <div className="z-30 py-4 px-4 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6766d0] via-[#5546ad] to-[#f3535b] bg-clip-text text-transparent">
          Instructo AI Coding Assistant
        </h1>
      </div>
      
      <div className="flex-grow flex flex-col md:flex-row z-30 px-4 pb-4 max-w-7xl mx-auto w-full gap-4">
        {/* Code Editor - 65% */}
        <div className="w-full md:w-[65%] flex flex-col">
          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl border border-[rgba(103,102,208,0.2)] flex-grow flex flex-col overflow-hidden">
            <div className="flex items-center px-4 py-2 border-b border-[rgba(103,102,208,0.2)] bg-[rgba(18,18,40,0.7)]">
              <div className="flex space-x-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-[#f3535b]"></div>
                <div className="w-3 h-3 rounded-full bg-[#fd8f58]"></div>
                <div className="w-3 h-3 rounded-full bg-[#6766d0]"></div>
              </div>
              <span className="text-sm text-[rgba(255,255,255,0.7)]">{selectedLanguage} Code Editor</span>
            </div>
            
            <textarea 
              className="flex-grow resize-none bg-[rgba(18,18,40,0.7)] text-[rgba(255,255,255,0.9)] p-4 font-mono text-sm outline-none"
              value={code}
              onChange={handleCodeChange}
              spellCheck="false"
            ></textarea>
            
            <div className="flex items-center justify-between px-4 py-2 border-t border-[rgba(103,102,208,0.2)] bg-[rgba(18,18,40,0.7)]">
              <span className="text-xs text-[rgba(255,255,255,0.5)]">Press Ctrl+Enter to run code</span>
              <button className="px-4 py-1 rounded-md bg-gradient-to-r from-[#6766d0] to-[#2c3d95] text-white text-sm font-medium transition-all duration-300 hover:opacity-90">
                Run Code
              </button>
            </div>
          </div>
          
          <div className="mt-3 bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-4 border border-[rgba(103,102,208,0.2)]">
            <h3 className="text-sm font-medium text-[rgba(255,255,255,0.9)] mb-2">Console Output</h3>
            <div className="bg-[rgba(18,18,40,0.7)] rounded-md p-3 font-mono text-sm text-[rgba(255,255,255,0.7)] h-24 overflow-y-auto">
              {'> Ready to execute code...'}
            </div>
          </div>
        </div>
        
        {/* Chat Interface - 35% */}
        <div className="w-full md:w-[35%] flex flex-col">
          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl border border-[rgba(103,102,208,0.2)] flex-grow flex flex-col">
            {/* Chat messages container */}
            <div className="flex-grow p-4 overflow-y-auto max-h-[calc(100vh-250px)]">
              <div className="flex flex-col gap-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[90%] rounded-xl px-4 py-3 ${
                        message.sender === 'user' 
                          ? 'bg-[rgba(103,102,208,0.4)] rounded-tr-none' 
                          : 'bg-[rgba(44,61,149,0.4)] rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <span className="text-xs text-[rgba(255,255,255,0.6)]">
                          {message.sender === 'user' ? 'You' : 'AI'} • {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-[rgba(255,255,255,0.9)]">{message.text}</p>
                      
                      {message.code && (
                        <div className="mt-2 bg-[rgba(18,18,40,0.9)] rounded-md p-2 font-mono text-xs text-[rgba(255,255,255,0.8)] overflow-x-auto">
                          <pre>{message.code}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
            </div>
            
            {/* Suggested questions */}
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="bg-[rgba(103,102,208,0.2)] hover:bg-[rgba(103,102,208,0.3)] rounded-full px-3 py-1 text-xs text-[rgba(255,255,255,0.9)] transition-all duration-300"
                >
                  {question}
                </button>
              ))}
            </div>
            
            {/* Input area */}
            <div className="p-4 border-t border-[rgba(103,102,208,0.2)]">
              <div className="relative">
                <textarea
                  id="chat-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about coding..."
                  className="w-full bg-[rgba(18,18,40,0.7)] backdrop-blur-md rounded-xl p-3 pr-11 border border-[rgba(103,102,208,0.2)] focus:border-[rgba(103,102,208,0.4)] focus:outline-none text-sm text-white resize-none h-[60px]"
                  rows={2}
                ></textarea>
                <button
                  onClick={handleSendMessage}
                  className="absolute right-3 bottom-3 bg-gradient-to-r from-[#6766d0] to-[#2c3d95] p-1.5 rounded-full transition-all duration-300 hover:opacity-90"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <div className="mt-1 text-xs text-center text-[rgba(255,255,255,0.5)]">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 