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

interface Course {
  id: string;
  name: string;
  progress: number;
  icon: string;
}

const Dashboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<ParticleProps[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    joinDate: "January 2023"
  });
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "JavaScript", progress: 0, icon: "📜" },
    { id: "2", name: "C++", progress: 0, icon: "⚙️" },
    { id: "3", name: "Python", progress: 0, icon: "🐍" },
    { id: "4", name: "C", progress: 0, icon: "🔧" }
  ]);
  const navigate = useNavigate();

  // Check if user is logged in using the auth utility
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    // Using mock data already set in state
  }, []);

  // Handle logout using the auth utility
  const handleLogout = () => {
    logout();
    navigate("/");
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
        {/* Logo on right */}
        <div className="order-2">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="aspect-squre w-12 mr-2"
            />
            <img src="/title_dark.png" alt="Logo" className="h-6 mr-2" />
          </div>
        </div>

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
          <Link
            to="/"
            className="text-white hover:text-[#fd8f58] transition-colors duration-300"
          >
            Home
          </Link>
        </div>

        {/* Logout Button */}
        <div className="order-3">
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#f3535b] to-[#fd8f58] text-white font-medium shadow-md shadow-[rgba(243,83,91,0.3)] transition-all duration-300 hover:translate-y-[-2px]"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center px-4 z-30 mt-12 mb-24">
        <div className="w-full max-w-6xl">
          {/* User Profile Section */}
          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-8 border border-[rgba(103,102,208,0.2)] mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-32 h-32 bg-gradient-to-r from-[#6766d0] to-[#2c3d95] rounded-full flex items-center justify-center text-4xl font-bold">
                {userData.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{userData.name}</h2>
                <p className="text-[rgba(255,255,255,0.7)] mb-4">{userData.email}</p>
                <p className="text-[rgba(255,255,255,0.5)]">Member since {userData.joinDate}</p>
                
                <div className="mt-6 flex gap-4">
                  <button className="px-6 py-2 rounded-full bg-gradient-to-r from-[#6766d0] to-[#2c3d95] text-white font-medium shadow-md shadow-[rgba(103,102,208,0.3)] transition-all duration-300 hover:translate-y-[-2px]">
                    Edit Profile
                  </button>
                  <button className="px-6 py-2 rounded-full border-2 border-[rgba(103,102,208,0.5)] text-white font-medium transition-all duration-300 hover:bg-[rgba(103,102,208,0.1)] hover:border-[rgba(103,102,208,0.7)]">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Ongoing Courses Section */}
          <h2 className="text-2xl font-bold mb-6">Your Ongoing Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-6 border border-[rgba(103,102,208,0.2)] transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-[rgba(103,102,208,0.2)] rounded-full flex items-center justify-center mb-4 text-2xl">
                  <span>{course.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
                <div className="w-full bg-[rgba(255,255,255,0.1)] h-2 rounded-full mb-2">
                  <div 
                    className="bg-gradient-to-r from-[#6766d0] to-[#2c3d95] h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="text-[rgba(255,255,255,0.7)]">{course.progress}% completed</p>
                <button className="mt-4 w-full py-2 rounded-lg bg-[rgba(103,102,208,0.2)] text-white font-medium transition-all duration-300 hover:bg-[rgba(103,102,208,0.3)]">
                  Continue
                </button>
              </div>
            ))}
          </div>

          {/* Recent Activity Section */}
          <h2 className="text-2xl font-bold mt-12 mb-6">Recent Activity</h2>
          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-6 border border-[rgba(103,102,208,0.2)]">
            <div className="space-y-4">
              <div className="flex items-center p-3 hover:bg-[rgba(103,102,208,0.1)] rounded-lg transition-colors duration-300">
                <div className="w-10 h-10 bg-[rgba(103,102,208,0.2)] rounded-full flex items-center justify-center mr-4 text-xl">
                  🏆
                </div>
                <div>
                  <p className="font-medium">Completed JavaScript Challenge: Functions</p>
                  <p className="text-sm text-[rgba(255,255,255,0.5)]">Yesterday, 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-center p-3 hover:bg-[rgba(103,102,208,0.1)] rounded-lg transition-colors duration-300">
                <div className="w-10 h-10 bg-[rgba(103,102,208,0.2)] rounded-full flex items-center justify-center mr-4 text-xl">
                  📝
                </div>
                <div>
                  <p className="font-medium">Started C++ Module: Pointers</p>
                  <p className="text-sm text-[rgba(255,255,255,0.5)]">3 days ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 hover:bg-[rgba(103,102,208,0.1)] rounded-lg transition-colors duration-300">
                <div className="w-10 h-10 bg-[rgba(103,102,208,0.2)] rounded-full flex items-center justify-center mr-4 text-xl">
                  ✅
                </div>
                <div>
                  <p className="font-medium">Completed Python Lesson: List Comprehensions</p>
                  <p className="text-sm text-[rgba(255,255,255,0.5)]">Last week</p>
                </div>
              </div>
            </div>
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

export default Dashboard; 