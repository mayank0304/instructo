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
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<ParticleProps[]>([]);
  
  const suggestedQuestions = [
    "How do I declare variables?",
    "Explain functions and methods",
    "What are the best practices for error handling?",
    "How do I work with arrays and loops?"
  ];

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create a new particle
  const createParticle = (): ParticleProps => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as ParticleProps;

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      direction: Math.random() * Math.PI * 2,
      color: getRandomColor(),
      alpha: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * 0.02 + 0.01,
      pulseFactor: 0,
    };
  };

  // Get random color for particle
  const getRandomColor = (): string => {
    const colors = ['#6766d0', '#5546ad', '#fd8f58', '#f3535b', '#2c3d95'];
    const idx = Math.floor(Math.random() * colors.length);
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
    } else if (lowerQuery.includes('array') || lowerQuery.includes('loop')) {
      return `Arrays in ${selectedLanguage} can be created using square brackets []. You can loop through them using for, forEach, map, etc.`;
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
    <div className="flex h-screen bg-[#0b0b1a] text-white">
      {/* Background particles */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 opacity-70"></canvas>
      
      {/* Code Editor Section - 65% */}
      <div className="flex-grow" style={{ maxWidth: '65%' }}>
        <div className="h-full flex flex-col">
          <textarea 
            className="flex-grow h-full w-full bg-[#0e0e25] text-[rgba(255,255,255,0.9)] p-5 font-mono text-sm outline-none resize-none border-none"
            value={code}
            onChange={handleCodeChange}
            spellCheck="false"
          ></textarea>
        </div>
      </div>
      
      {/* Chat Interface - 35% */}
      <div className="w-[35%] flex flex-col bg-[#0b0b1a] border-l border-[#252552]">
        {/* Header */}
        <div className="p-4 border-b border-[#252552] bg-[#0b0b1a] text-center">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-[#6766d0] via-[#5546ad] to-[#f3535b] bg-clip-text text-transparent">
            Instructo AI Assistant
          </h1>
          <p className="text-[rgba(255,255,255,0.7)] text-sm mt-1">
            Get help with your coding questions in {selectedLanguage}
          </p>
        </div>
        
        {/* Chat messages */}
        <div className="flex-grow overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[95%] rounded-lg px-4 py-3 ${
                    message.sender === 'user' 
                      ? 'bg-[rgba(80,80,120,0.4)]' 
                      : 'bg-[rgba(45,45,80,0.6)]'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-xs text-[rgba(255,255,255,0.6)]">
                      {message.sender === 'user' ? 'You' : 'Instructo AI'} • {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-[rgba(255,255,255,0.9)]">{message.text}</p>
                  
                  {message.code && (
                    <div className="mt-2 bg-[rgba(15,15,35,0.9)] rounded-md p-2 font-mono text-xs text-[rgba(255,255,255,0.8)] overflow-x-auto">
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
        <div className="p-4 border-t border-[#252552] flex flex-wrap gap-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedQuestion(question)}
              className="bg-[rgba(50,50,100,0.3)] hover:bg-[rgba(70,70,120,0.4)] rounded-full px-3 py-1 text-xs text-[rgba(255,255,255,0.9)] transition-all duration-300"
            >
              {question}
            </button>
          ))}
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-[#252552]">
          <div className="relative">
            <textarea
              id="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full bg-[rgba(30,30,60,0.4)] rounded-lg p-3 pr-10 border border-[#252552] focus:border-[rgba(103,102,208,0.6)] focus:outline-none text-white resize-none h-[60px]"
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
            Powered by Instructo AI • Optimized for {selectedLanguage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 