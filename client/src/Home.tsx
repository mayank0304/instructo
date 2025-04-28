import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "./lib/auth";

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

const Home: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<ParticleProps[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check if user is logged in using the auth utility
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Handle logout using the auth utility
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  // Handle get started click
  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/languages");
    } else {
      navigate("/sign");
    }
  };

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
    const particleCount = 150;
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

      {/* Navigation Bar */}
      <nav className="relative z-40 py-6 px-8 flex justify-between items-center">
        {/* Navigation Links (Center) */}
        <div className="flex space-x-8 order-1">
          <Link
            to="/code"
            className="text-white hover:text-[#fd8f58] transition-colors duration-300"
          >
            Code Editor
          </Link>
          <Link
            to="/languages"
            className="text-white hover:text-[#fd8f58] transition-colors duration-300"
          >
            Languages
          </Link>
          {isLoggedIn && (
            <Link
              to="/dashboard"
              className="text-white hover:text-[#fd8f58] transition-colors duration-300"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Sign Up Button or Logout Button based on login status */}
        <div className="order-3">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#f3535b] to-[#fd8f58] text-white font-medium shadow-md shadow-[rgba(243,83,91,0.3)] transition-all duration-300 hover:translate-y-[-2px]"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/sign"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#6766d0] to-[#2c3d95] text-white font-medium shadow-md shadow-[rgba(103,102,208,0.3)] transition-all duration-300 hover:translate-y-[-2px]"
            >
              Sign Up
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 z-30 mt-12 mb-24">
        <div className="flex gap-2 items-center">
        <img src="/logo.png" alt="Logo" className="h-32 m-2" />
        <img src="/title_dark.png" alt="Logo" className="h-12 m-2" />
        </div>
        <h1 className="text-5xl font-bold mb-8 py-3 text-center bg-gradient-to-r from-[#6766d0] via-[#5546ad] to-[#f3535b] bg-clip-text text-transparent max-w-3xl">
          AI Powered Coding Tutor
        </h1>
        <p className="text-xl text-center mb-12 max-w-2xl text-[rgba(255,255,255,0.8)]">
          Instructo revolutionizes coding education by using an AI mentor to
          guide learners through problem solving rathar than providing direct
          answers
        </p>

        <div className="flex gap-6 flex-wrap justify-center">
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#6766d0] via-[#5546ad] to-[#2c3d95] text-white font-semibold text-lg shadow-lg shadow-[rgba(103,102,208,0.3)] transition-all duration-300 hover:translate-y-[-2px] relative overflow-hidden after:content-[''] after:absolute after:top-0 after:-left-full after:w-[200%] after:h-full after:bg-gradient-to-r after:from-transparent after:via-[rgba(255,255,255,0.2)] after:to-transparent after:transition-all after:duration-500 hover:after:left-full"
          >
            Get Started
          </button>
          <a
            href="/Instructo.pdf"
            className="px-8 py-4 rounded-full border-2 border-[rgba(103,102,208,0.5)] text-white font-semibold text-lg transition-all duration-300 hover:bg-[rgba(103,102,208,0.1)] hover:border-[rgba(103,102,208,0.7)]"
          >
            Learn More
          </a>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-6 border border-[rgba(103,102,208,0.2)] w-64 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-[rgba(103,102,208,0.2)] rounded-full flex items-center justify-center mb-4">
              <span className="text-xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart AI Mentor</h3>
            <p className="text-[rgba(255,255,255,0.7)]">
              Our AI never provides direct code, instead, it guides users with
              logical explanations, enhancing problem- solving skills and
              reducing copy- pasting habits.
            </p>
          </div>

          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-6 border border-[rgba(103,102,208,0.2)] w-64 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-[rgba(103,102,208,0.2)] rounded-full flex items-center justify-center mb-4">
              <span className="text-xl">🌐</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Intelligent Code Validation
            </h3>
            <p className="text-[rgba(255,255,255,0.7)]">
              Beyond runtime, AI validates code logic, detecting and rejecting
              incorrect approaches such as hardcoded patterns.
            </p>
          </div>

          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-6 border border-[rgba(103,102,208,0.2)] w-64 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-[rgba(103,102,208,0.2)] rounded-full flex items-center justify-center mb-4">
              <span className="text-xl">💡</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Interactive Challenge Modes
            </h3>
            <p className="text-[rgba(255,255,255,0.7)]">
              Output-Based Coding – Write the code to match an AI given output.
              Complete the Code – Users fix and finish an incomplete code
              snippet.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-30 text-center text-sm text-[rgba(255,255,255,0.5)] py-6">
        <div className="mb-2">
          <a
            href="#"
            className="text-[rgba(255,255,255,0.5)] hover:text-white mx-3 transition-colors duration-300"
          >
            About
          </a>
          <a
            href="#"
            className="text-[rgba(255,255,255,0.5)] hover:text-white mx-3 transition-colors duration-300"
          >
            Features
          </a>
          <a
            href="#"
            className="text-[rgba(255,255,255,0.5)] hover:text-white mx-3 transition-colors duration-300"
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-[rgba(255,255,255,0.5)] hover:text-white mx-3 transition-colors duration-300"
          >
            Support
          </a>
        </div>
        <div>© 2025 X Platform. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Home;
