import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

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

interface LanguageSelectorProps {
  onLanguageChange?: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
}) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("javascript");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<ParticleProps[]>([]);

  const languages = [
    { value: "javascript", label: "JavaScript", icon: "📜" },
    { value: "typescript", label: "TypeScript", icon: "🔷" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "java", label: "Java", icon: "☕" },
    { value: "cpp", label: "C++", icon: "⚙️" },
    { value: "c", label: "C", icon: "🎯" },
    { value: "go", label: "Go", icon: "GO" },
    { value: "rust", label: "Rust", icon: "🦀" },
  ];

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
    const colors = ["#6766d0", "#5546ad", "#fd8f58", "#f3535b", "#2c3d95"];
    const idx = Math.floor(Math.random() * (Math.random() < 0.7 ? 3 : 5));
    return colors[idx];
  };

  const handleLanguageSelect = (langValue: string) => {
    setSelectedLanguage(langValue);
    if (onLanguageChange) {
      onLanguageChange(langValue);
    }
  };

  // Initialize canvas and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);
    document.addEventListener("mousemove", handleMouseMove);

    // Create particles
    const particleCount = 100;
    particlesRef.current = Array.from(
      { length: particleCount },
      createParticle,
    );

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Move particle
        particle.x += Math.cos(particle.direction) * particle.speed;
        particle.y += Math.sin(particle.direction) * particle.speed;

        // Pulse size effect
        particle.pulseFactor += particle.pulse;
        const sizeModifier = Math.sin(particle.pulseFactor) * 0.5 + 1;

        // Change direction slightly for more organic movement
        particle.direction += (Math.random() - 0.5) * 0.1;

        // If particle goes off-screen, reset it
        if (
          particle.x < 0 ||
          particle.x > canvas.width ||
          particle.y < 0 ||
          particle.y > canvas.height
        ) {
          const newParticle = createParticle();
          Object.assign(particle, newParticle);
        }

        // Draw particle
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.size * sizeModifier,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasSize);
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const selectedLang = languages.find(
    (lang) => lang.value === selectedLanguage,
  );

  return (
    <div className="font-sans bg-[#121228] text-white min-h-screen flex flex-col relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-10"
      ></canvas>
      <div
        ref={glowRef}
        className="absolute w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(103,102,208,0.4)_0%,rgba(85,70,173,0.3)_30%,rgba(44,61,149,0.2)_60%,rgba(18,18,40,0)_80%)] z-20 pointer-events-none blur-3xl animate-pulse"
      ></div>

      <div className="flex-grow flex flex-col items-center justify-center px-4 z-30 py-12">
        <h1 className="text-4xl font-bold mb-8 py-3 text-center bg-gradient-to-r from-[#6766d0] via-[#5546ad] to-[#f3535b] bg-clip-text text-transparent">
          Select Your Programming Language
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12 max-w-6xl mx-auto">
          {languages.map((lang) => (
            <div
              key={lang.value}
              onClick={() => handleLanguageSelect(lang.value)}
              className={`bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-6 border cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col items-center ${
                selectedLanguage === lang.value
                  ? "border-[#6766d0] bg-[rgba(103,102,208,0.1)] shadow-lg shadow-[rgba(103,102,208,0.2)] hover:border-[#6766d0] hover:bg-[rgba(103,102,208,0.1)]"
                  : "border-[rgba(103,102,208,0.2)] hover:border-[rgba(103,102,208,0.4)]"
              }`}
            >
              <div className="w-16 h-16 bg-[rgba(103,102,208,0.2)] rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">{lang.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-center">
                {lang.label}
              </h3>
            </div>
          ))}
        </div>

        {selectedLang && (
          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-8 border border-[rgba(103,102,208,0.2)] w-full max-w-md transition-all duration-300 hover:border-[rgba(103,102,208,0.4)]">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-[rgba(103,102,208,0.2)] rounded-full flex items-center justify-center mr-5">
                <span className="text-3xl">{selectedLang.icon || "🔮"}</span>
              </div>
              <h2 className="text-3xl font-medium text-[rgba(255,255,255,0.9)]">
                {selectedLang.label}
              </h2>
            </div>

            <div className="flex items-center justify-between mb-6">
              <Link
                to={`/roadmap/${selectedLanguage}/beginner`}
                className="px-4 py-2 rounded-full bg-[rgba(103,102,208,0.2)] text-white font-medium transition-all duration-300 hover:bg-[rgba(103,102,208,0.4)] flex-1 mx-2 first:ml-0 last:mr-0 text-center"
              >
                Beginner
              </Link>
              <Link
                to={`/roadmap/${selectedLanguage}/intermediate`}
                className="px-4 py-2 rounded-full bg-[rgba(103,102,208,0.2)] text-white font-medium transition-all duration-300 hover:bg-[rgba(103,102,208,0.4)] flex-1 mx-2 text-center"
              >
                Intermediate
              </Link>
              <Link
                to={`/roadmap/${selectedLanguage}/advanced`}
                className="px-4 py-2 rounded-full bg-[rgba(103,102,208,0.2)] text-white font-medium transition-all duration-300 hover:bg-[rgba(103,102,208,0.4)] flex-1 mx-2 first:ml-0 last:mr-0 text-center"
              >
                Advanced
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <Link
                to={`/quiz/${selectedLanguage}`}
                className="px-6 py-2 rounded-full bg-[rgba(103,102,208,0.2)] text-white font-medium transition-all duration-300 hover:bg-[rgba(103,102,208,0.4)] mx-2 text-center w-40"
              >
                Take Quiz
              </Link>
            </div>
          </div>
        )}
      </div>

      <footer className="relative z-30 text-center text-sm text-[rgba(255,255,255,0.5)] py-6">
        <div>
          © 2025 Instructo Platform. All programming languages and related
          trademarks belong to their respective owners.
        </div>
      </footer>
    </div>
  );
};

export default LanguageSelector;
