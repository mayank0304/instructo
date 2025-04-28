import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  icon: string;
  objective: string;
}

interface RoadmapProps {
  selectedLanguage: string;
  steps?: RoadmapStep[];
  onStepClick?: (stepId: number) => void;
}

const Roadmap: React.FC<RoadmapProps> = ({
  selectedLanguage,
  steps: propSteps,
  onStepClick,
}) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<ParticleProps[]>([]);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Default steps if none provided
  const defaultSteps: RoadmapStep[] = [
    {
      id: 1,
      title: "Variables & Data Types",
      description:
        "Learn how to declare variables and understand different data types in programming.",
      status: "completed",
      icon: "🚀",
      objective: "Foundation of Programming",
    },
    {
      id: 2,
      title: "Control Structures",
      description:
        "Master if/else statements, loops, and control flow patterns to create dynamic programs.",
      status: "current",
      icon: "🔄",
      objective: "Program Flow Control",
    },
    {
      id: 3,
      title: "Functions & Methods",
      description:
        "Learn how to create reusable code through functions and methods to improve code organization.",
      status: "upcoming",
      icon: "📦",
      objective: "Code Reusability",
    },
    {
      id: 4,
      title: "Data Structures",
      description:
        "Understand arrays, objects, maps and sets to efficiently organize and manipulate data.",
      status: "upcoming",
      icon: "🏗️",
      objective: "Data Organization",
    },
    {
      id: 5,
      title: "Object-Oriented Programming",
      description:
        "Learn to design programs using classes, objects, inheritance, and polymorphism.",
      status: "upcoming",
      icon: "🧠",
      objective: "OOP Concepts",
    },
    {
      id: 6,
      title: "Advanced Concepts",
      description:
        "Dive into advanced topics like error handling, asynchronous programming, and design patterns.",
      status: "upcoming",
      icon: "🛠️",
      objective: "Professional Development",
    },
  ];

  const steps = propSteps || defaultSteps;

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
    const particleCount = 80;
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

  const handleStepSelection = (stepId: number) => {
    setActiveStep(stepId);

    if (onStepClick) {
      onStepClick(stepId);
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-[#6766d0]";
      case "current":
        return "bg-[#f3535b]";
      default:
        return "bg-[rgba(103,102,208,0.2)]";
    }
  };

  // Get status text
  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed":
        return "Completed";
      case "current":
        return "In Progress";
      default:
        return "Upcoming";
    }
  };

  // Navigate to different coding challenges
  const navigateToChallenge = (
    type: "complete" | "output" | "problem" | "practice",
  ) => {
    const currentStep = steps.find((step) => step.id === activeStep);
    if (!currentStep) return;

    const state = {
      language: selectedLanguage,
      objective: currentStep.objective,
      description: currentStep.description,
      title: currentStep.title,
    };

    navigate(`/${type}`, { state });
  };

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

      <div className="flex-grow flex flex-col items-center z-30 py-8 px-4 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-8 py-3 text-center bg-gradient-to-r from-[#6766d0] via-[#5546ad] to-[#f3535b] bg-clip-text text-transparent">
          Your {selectedLanguage} Learning Roadmap
        </h1>

        <p className="text-lg text-center text-[rgba(255,255,255,0.7)] mb-10 max-w-2xl">
          Follow this step-by-step roadmap to master {selectedLanguage}. Click
          on any step to view details and resources.
        </p>

        {/* Horizontal timeline for larger screens */}
        <div className="hidden md:flex w-full justify-between items-center mb-16 relative max-w-5xl">
          {/* Connecting line */}
          <div className="absolute h-1 bg-[rgba(103,102,208,0.3)] top-1/2 left-0 transform -translate-y-1/2 w-full z-0"></div>

          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
              onClick={() => handleStepSelection(step.id)}
            >
              {/* Step number circle */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 cursor-pointer transition-all duration-300 ${
                  activeStep === step.id
                    ? "transform scale-110 shadow-lg shadow-[rgba(103,102,208,0.4)]"
                    : ""
                } ${getStatusColor(step.status)}`}
              >
                <span className="text-2xl">{step.icon}</span>
              </div>

              {/* Step title */}
              <h3
                className={`text-sm font-medium mb-1 text-center max-w-[120px] ${
                  activeStep === step.id
                    ? "text-white"
                    : "text-[rgba(255,255,255,0.7)]"
                }`}
              >
                {step.title}
              </h3>

              {/* Status dot */}
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(step.status)}`}
              ></div>
            </div>
          ))}
        </div>

        {/* Vertical timeline for mobile */}
        <div className="flex flex-col md:hidden w-full mb-8 relative">
          {/* Connecting line */}
          <div className="absolute w-1 bg-[rgba(103,102,208,0.3)] top-0 bottom-0 left-6 z-0"></div>

          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start mb-8 relative z-10 ${
                index === steps.length - 1 ? "mb-0" : ""
              }`}
              onClick={() => handleStepSelection(step.id)}
            >
              {/* Step number circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 cursor-pointer transition-all duration-300 ${
                  activeStep === step.id
                    ? "transform scale-110 shadow-lg shadow-[rgba(103,102,208,0.4)]"
                    : ""
                } ${getStatusColor(step.status)}`}
              >
                <span className="text-xl">{step.icon}</span>
              </div>

              <div>
                {/* Step title */}
                <h3
                  className={`text-base font-medium mb-1 ${
                    activeStep === step.id
                      ? "text-white"
                      : "text-[rgba(255,255,255,0.7)]"
                  }`}
                >
                  {step.title}
                </h3>

                {/* Status */}
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(step.status)}`}
                  ></div>
                  <span className="text-xs text-[rgba(255,255,255,0.5)]">
                    {getStatusText(step.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active step details */}
        {steps.map(
          (step) =>
            step.id === activeStep && (
              <div
                key={`detail-${step.id}`}
                className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-6 border border-[rgba(103,102,208,0.2)] w-full max-w-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${getStatusColor(step.status)}`}
                    >
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-medium text-[rgba(255,255,255,0.9)]">
                        {step.title}
                      </h2>
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(step.status)}`}
                        ></div>
                        <span className="text-sm text-[rgba(255,255,255,0.6)]">
                          {getStatusText(step.status)}
                        </span>
                        <span className="text-sm text-[rgba(255,255,255,0.4)] mx-2">
                          •
                        </span>
                        <span className="text-sm text-[rgba(255,255,255,0.6)]">
                          Step {step.id} of {steps.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateToChallenge("practice")}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#fd8f58] to-[#f3535b] text-white font-medium shadow-md shadow-[rgba(243,83,91,0.3)] transition-all duration-300 hover:translate-y-[-2px] cursor-pointer"
                    disabled={step.status === "upcoming"}
                  >
                    Practice
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2 text-[#6766d0]">Objective</h3>
                  <p className="text-[rgba(255,255,255,0.9)] mb-4">
                    {step.objective}
                  </p>

                  <h3 className="font-medium mb-2 text-[#6766d0]">
                    Description
                  </h3>
                  <p className="text-[rgba(255,255,255,0.8)]">
                    {step.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
                  <button
                    onClick={() => navigateToChallenge("complete")}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-[#6766d0] to-[#2c3d95] text-white font-medium shadow-md shadow-[rgba(103,102,208,0.3)] transition-all duration-300 hover:translate-y-[-2px] text-center cursor-pointer"
                    disabled={step.status === "upcoming"}
                  >
                    Complete the Code
                  </button>

                  <button
                    onClick={() => navigateToChallenge("output")}
                    className="px-6 py-2 rounded-full bg-[rgba(243,83,91,0.8)] text-white font-medium shadow-md shadow-[rgba(243,83,91,0.3)] transition-all duration-300 hover:translate-y-[-2px] text-center cursor-pointer"
                    disabled={step.status === "upcoming"}
                  >
                    Output Based Challenge
                  </button>

                  <button
                    onClick={() => navigateToChallenge("problem")}
                    className="px-6 py-2 rounded-full bg-[rgba(103,102,208,0.2)] text-white font-medium transition-all duration-300 hover:bg-[rgba(103,102,208,0.4)] text-center cursor-pointer"
                    disabled={step.status === "upcoming"}
                  >
                    Problem Based Challenge
                  </button>
                </div>

                <div className="flex justify-between flex-wrap gap-3">
                  {step.id > 1 && (
                    <button
                      onClick={() => handleStepSelection(step.id - 1)}
                      className="px-4 py-2 rounded-full bg-[rgba(103,102,208,0.2)] text-white font-medium transition-all duration-300 hover:bg-[rgba(103,102,208,0.4)] text-sm cursor-pointer"
                    >
                      Previous Step
                    </button>
                  )}

                  {step.id < steps.length && (
                    <button
                      onClick={() => handleStepSelection(step.id + 1)}
                      className="px-4 py-2 rounded-full bg-[rgba(103,102,208,0.2)] text-white font-medium transition-all duration-300 hover:bg-[rgba(103,102,208,0.4)] text-sm cursor-pointer"
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </div>
            ),
        )}
      </div>

      <footer className="relative z-30 text-center text-xs text-[rgba(255,255,255,0.5)] py-4">
        <div>
          © 2025 Instructo Platform • Learning Paths for All Skill Levels
        </div>
      </footer>
    </div>
  );
};

export default Roadmap;
