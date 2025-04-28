import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../lib/utils";

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

const Sign: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the intended destination from location state or default to /languages
  const from = (location.state as { from?: string })?.from || "/languages";

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<ParticleProps[]>([]);

  // Toggle between login and signup forms
  const toggleForm = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLoginForm((prev) => !prev);
    setError(null);
  };

  // Handle signup form input changes
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSignupForm({
      ...signupForm,
      [id === "signup-email"
        ? "email"
        : id === "signup-username"
          ? "username"
          : "password"]: value,
    });
  };

  // Handle login form input changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginForm({
      ...loginForm,
      [id === "login-username" ? "username" : "password"]: value,
    });
  };

  // Handle signup form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          username: signupForm.username,
          email: signupForm.email,
          password: signupForm.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      // If signup successful, show login form
      setShowLoginForm(true);
      setError("Account created successfully. Please log in.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during signup",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const jwt = await response.text();

      // Save JWT to localStorage
      localStorage.setItem("jwt", jwt);

      // Redirect to the original destination or languages page
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login",
      );
    } finally {
      setIsLoading(false);
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
    <div className="font-sans bg-[#121228] text-white h-screen flex items-center justify-center relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-10"
      ></canvas>
      <div
        ref={glowRef}
        className="absolute w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(103,102,208,0.4)_0%,rgba(85,70,173,0.3)_30%,rgba(44,61,149,0.2)_60%,rgba(18,18,40,0)_80%)] z-20 pointer-events-none blur-3xl animate-pulse"
      ></div>

      <div className="w-full max-w-md z-30 relative">
        <a
          href="/#"
          className="absolute -top-10 left-0 text-white no-underline flex items-center gap-2 text-sm transition-all duration-300 hover:text-[#fd8f58]"
        >
          ← Home
        </a>

        <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-2xl p-10 shadow-lg border border-[rgba(103,102,208,0.2)] relative overflow-hidden">
          <div className="before:content-[''] before:absolute before:w-[150%] before:h-[150%] before:bg-[radial-gradient(circle,rgba(103,102,208,0.1)_0%,rgba(85,70,173,0.08)_30%,rgba(44,61,149,0.05)_60%,transparent_80%)] before:-top-1/4 before:-left-1/4 before:pointer-events-none">
            <img src="/logo.png" alt="Logo" className="w-16 mb-4 mx-auto" />

            {error && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${error.includes("successfully") ? "bg-[rgba(103,102,208,0.2)] text-[#6766d0]" : "bg-[rgba(243,83,91,0.2)] text-[#f3535b]"}`}
              >
                {error}
              </div>
            )}

            {/* Signup Form */}
            <div
              className={`transition-all duration-500 ${showLoginForm ? "hidden" : "block"}`}
            >
              <h1 className="text-2xl mb-8 font-semibold">
                Create new account
              </h1>

              <form onSubmit={handleSignup} className="form">
                <label htmlFor="signup-username" className="block mb-2 text-sm">
                  Username
                </label>
                <input
                  type="text"
                  id="signup-username"
                  value={signupForm.username}
                  onChange={handleSignupChange}
                  placeholder="Enter username"
                  className="w-full py-3.5 px-4.5 rounded-lg border border-[rgba(103,102,208,0.3)] bg-[rgba(18,18,40,0.5)] text-white text-base mb-1 transition-all duration-300 focus:outline-none focus:border-[#6766d0] focus:shadow-[0_0_0_2px_rgba(103,102,208,0.2)]"
                  required
                />
                <div className="text-xs text-[rgba(255,255,255,0.6)] mb-6">
                  Enter your username
                </div>

                <label htmlFor="signup-email" className="block mb-2 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  id="signup-email"
                  value={signupForm.email}
                  onChange={handleSignupChange}
                  placeholder="name@work-email.com"
                  className="w-full py-3.5 px-4.5 rounded-lg border border-[rgba(103,102,208,0.3)] bg-[rgba(18,18,40,0.5)] text-white text-base mb-1 transition-all duration-300 focus:outline-none focus:border-[#6766d0] focus:shadow-[0_0_0_2px_rgba(103,102,208,0.2)]"
                  required
                />
                <div className="text-xs text-[rgba(255,255,255,0.6)] mb-6">
                  Enter email address
                </div>

                <label htmlFor="signup-password" className="block mb-2 text-sm">
                  Password
                </label>
                <input
                  type="password"
                  id="signup-password"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                  placeholder="Enter your password"
                  className="w-full py-3.5 px-4.5 rounded-lg border border-[rgba(103,102,208,0.3)] bg-[rgba(18,18,40,0.5)] text-white text-base mb-1 transition-all duration-300 focus:outline-none focus:border-[#6766d0] focus:shadow-[0_0_0_2px_rgba(103,102,208,0.2)]"
                  minLength={8}
                  required
                />
                <div className="text-xs text-[rgba(255,255,255,0.6)] mb-6">
                  Minimum 8 characters
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-full border-none bg-gradient-to-r from-[#6766d0] via-[#5546ad] to-[#2c3d95] shadow-md shadow-[rgba(103,102,208,0.5)] text-white text-base font-semibold cursor-pointer transition-all duration-300 mb-6 relative overflow-hidden hover:translate-y-[-2px] after:content-[''] after:absolute after:top-0 after:-left-full after:w-[200%] after:h-full after:bg-gradient-to-r after:from-transparent after:via-[rgba(255,255,255,0.2)] after:to-transparent after:transition-all after:duration-500 hover:after:left-full disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                </button>

                <div className="text-center text-sm text-[rgba(255,255,255,0.7)]">
                  Already have an account?{" "}
                  <a
                    href="#"
                    onClick={toggleForm}
                    className="text-[#fd8f58] no-underline transition-all duration-300 font-semibold hover:text-[#f3535b] hover:underline"
                  >
                    Sign in
                  </a>
                </div>
              </form>
            </div>

            {/* Login Form */}
            <div
              className={`transition-all duration-500 ${showLoginForm ? "block" : "hidden"}`}
            >
              <h1 className="text-2xl mb-8 font-semibold">
                Sign in to account
              </h1>

              <form onSubmit={handleLogin} className="form">
                <label htmlFor="login-username" className="block mb-2 text-sm">
                  Username
                </label>
                <input
                  type="text"
                  id="login-username"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  placeholder="Enter username"
                  className="w-full py-3.5 px-4.5 rounded-lg border border-[rgba(103,102,208,0.3)] bg-[rgba(18,18,40,0.5)] text-white text-base mb-1 transition-all duration-300 focus:outline-none focus:border-[#6766d0] focus:shadow-[0_0_0_2px_rgba(103,102,208,0.2)]"
                  required
                />
                <div className="text-xs text-[rgba(255,255,255,0.6)] mb-6">
                  Enter your username
                </div>

                <label htmlFor="login-password" className="block mb-2 text-sm">
                  Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  className="w-full py-3.5 px-4.5 rounded-lg border border-[rgba(103,102,208,0.3)] bg-[rgba(18,18,40,0.5)] text-white text-base mb-1 transition-all duration-300 focus:outline-none focus:border-[#6766d0] focus:shadow-[0_0_0_2px_rgba(103,102,208,0.2)]"
                  required
                />
                <div className="text-xs text-[rgba(255,255,255,0.6)] mb-6">
                  Enter your password
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-full border-none bg-gradient-to-r from-[#6766d0] via-[#5546ad] to-[#2c3d95] shadow-md shadow-[rgba(103,102,208,0.5)] text-white text-base font-semibold cursor-pointer transition-all duration-300 mb-6 relative overflow-hidden hover:translate-y-[-2px] after:content-[''] after:absolute after:top-0 after:-left-full after:w-[200%] after:h-full after:bg-gradient-to-r after:from-transparent after:via-[rgba(255,255,255,0.2)] after:to-transparent after:transition-all after:duration-500 hover:after:left-full disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "SIGNING IN..." : "SIGN IN"}
                </button>

                <div className="text-center text-sm text-[rgba(255,255,255,0.7)]">
                  Don't have an account?{" "}
                  <a
                    href="#"
                    onClick={toggleForm}
                    className="text-[#fd8f58] no-underline transition-all duration-300 font-semibold hover:text-[#f3535b] hover:underline"
                  >
                    Sign up
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="text-center mt-10 text-xs text-[rgba(255,255,255,0.5)]">
          <a
            href="#"
            className="text-[rgba(255,255,255,0.5)] no-underline mx-2 hover:underline"
          >
            Terms of Use
          </a>{" "}
          |{" "}
          <a
            href="#"
            className="text-[rgba(255,255,255,0.5)] no-underline mx-2 hover:underline"
          >
            Privacy policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sign;
