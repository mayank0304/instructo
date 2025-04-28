import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { API_BASE_URL } from "../lib/utils";

interface QuizQuestion {
  text: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  explanation: string;
  id?: number;
}

interface QuizResponse {
  language: string;
  questions: QuizQuestion[];
  total_questions: number;
}

interface QuizEvaluationRequest {
  language: string;
  responses: {
    question_id: number;
    selected_option: string;
  }[];
}

interface QuizFeedbackItem {
  question: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

interface QuizEvaluationResponse {
  correct_answers: number;
  detailed_feedback: QuizFeedbackItem[];
  score_percentage: number;
  skill_level: string;
  total_questions: number;
}

export function QuizPage() {
  const { language } = useParams<{ language: string }>();
  const navigate = useNavigate();
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizEvaluationResponse | null>(
    null,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Canvas animation setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speed: number;
      direction: number;
      color: string;
      alpha: number;
      pulse: number;
      pulseFactor: number;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.5 + 0.1;
        this.direction = Math.random() * Math.PI * 2;
        this.color = this.getRandomColor();
        this.alpha = Math.random() * 0.6 + 0.2;
        this.pulse = Math.random() * 0.02 + 0.01;
        this.pulseFactor = 0;
      }

      getRandomColor() {
        const colors = ["#6766d0", "#5546ad", "#fd8f58", "#f3535b", "#2c3d95"];
        const idx = Math.floor(Math.random() * (Math.random() < 0.7 ? 3 : 5));
        return colors[idx];
      }

      update() {
        // Move particle
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        // Pulse size effect
        this.pulseFactor += this.pulse;
        const sizeModifier = Math.sin(this.pulseFactor) * 0.5 + 1;

        // Change direction slightly for more organic movement
        this.direction += (Math.random() - 0.5) * 0.1;

        // If particle goes off-screen, reset it
        if (
          this.x < 0 ||
          this.x > canvas.width ||
          this.y < 0 ||
          this.y > canvas.height
        ) {
          this.reset();
        }

        // Draw particle
        if (ctx) {
          ctx.globalAlpha = this.alpha;
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * sizeModifier, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }

    // Create particles
    const particles: Particle[] = [];
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationId: number;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => particle.update());

      animationId = requestAnimationFrame(animate);
    }

    animate();

    // Mouse movement for glow effect
    const handleMouseMove = (e: MouseEvent) => {
      const glow = glowRef.current;
      if (glow) {
        glow.style.left = `${e.clientX - 350}px`;
        glow.style.top = `${e.clientY - 350}px`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", setCanvasSize);
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const {
    data: quizData,
    isLoading,
    error,
  } = useQuery<QuizResponse>({
    queryKey: ["quiz", language],
    queryFn: async () => {
      const response = await fetch(
        API_BASE_URL + `/api/langchain/quiz/generate?language=${language}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch quiz");
      }
      return response.json();
    },
  });

  const evaluateQuizMutation = useMutation({
    mutationFn: async (requestData: QuizEvaluationRequest) => {
      const response = await fetch(
        `${API_BASE_URL}/api/langchain/quiz/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
          body: JSON.stringify(requestData),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to evaluate quiz");
      }

      return response.json() as Promise<QuizEvaluationResponse>;
    },
    onSuccess: (data) => {
      setQuizResults(data);
    },
  });

  const handleOptionSelect = (questionIndex: number, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!quizData) return;

    // Prepare the evaluation request
    const responses = Object.entries(selectedAnswers).map(
      ([index, option]) => ({
        question_id: Number(index) + 1, // Assuming question_id starts from 1
        selected_option: option,
      }),
    );

    // Send evaluation request
    evaluateQuizMutation.mutate({
      language: quizData.language,
      responses,
    });
  };

  const handleNext = () => {
    if (language && quizResults) {
      navigate(`/roadmap/${language}/${quizResults.skill_level}`);
    }
  };

  // Add global styles for animations
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(1); opacity: 0.8; }
      }

      @keyframes shine {
        0% { left: -100%; }
        100% { left: 100%; }
      }

      .option-hover:hover {
        background: rgba(103, 102, 208, 0.1);
        border-color: rgba(103, 102, 208, 0.3);
      }
    `;

    // Append it to the document head
    document.head.appendChild(styleElement);

    // Clean up on component unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Loading state
  if (isLoading)
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ background: "#121228" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-10"
        ></canvas>
        <div
          ref={glowRef}
          className="absolute w-[700px] h-[700px] z-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(103, 102, 208, 0.4) 0%, rgba(85, 70, 173, 0.3) 30%, rgba(44, 61, 149, 0.2) 60%, rgba(18, 18, 40, 0) 80%)",
            filter: "blur(40px)",
            animation: "pulse 8s infinite alternate",
          }}
        ></div>
        <div className="z-30 text-white animate-pulse text-xl font-semibold">
          Loading quiz questions...
        </div>
      </div>
    );

  // Error state
  if (error)
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ background: "#121228" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-10"
        ></canvas>
        <div
          ref={glowRef}
          className="absolute w-[700px] h-[700px] z-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(103, 102, 208, 0.4) 0%, rgba(85, 70, 173, 0.3) 30%, rgba(44, 61, 149, 0.2) 60%, rgba(18, 18, 40, 0) 80%)",
            filter: "blur(40px)",
            animation: "pulse 8s infinite alternate",
          }}
        ></div>
        <div
          className="z-30 p-6 max-w-md rounded-lg shadow-md"
          style={{
            background: "rgba(25, 25, 50, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(103, 102, 208, 0.2)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Error loading quiz
          </h2>
          <p className="text-gray-300">{(error as Error).message}</p>
        </div>
      </div>
    );

  // No data state
  if (!quizData)
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ background: "#121228" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-10"
        ></canvas>
        <div
          ref={glowRef}
          className="absolute w-[700px] h-[700px] z-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(103, 102, 208, 0.4) 0%, rgba(85, 70, 173, 0.3) 30%, rgba(44, 61, 149, 0.2) 60%, rgba(18, 18, 40, 0) 80%)",
            filter: "blur(40px)",
            animation: "pulse 8s infinite alternate",
          }}
        ></div>
        <div
          className="z-30 p-6 max-w-md rounded-lg shadow-md"
          style={{
            background: "rgba(25, 25, 50, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(103, 102, 208, 0.2)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          <p className="text-gray-300">No quiz data available</p>
        </div>
      </div>
    );

  // Main content
  return (
    <div
      className="min-h-screen font-sans text-white relative"
      style={{ background: "#121228" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-10"
      ></canvas>
      <div
        ref={glowRef}
        className="absolute w-[700px] h-[700px] z-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(103, 102, 208, 0.4) 0%, rgba(85, 70, 173, 0.3) 30%, rgba(44, 61, 149, 0.2) 60%, rgba(18, 18, 40, 0) 80%)",
          filter: "blur(40px)",
          animation: "pulse 8s infinite alternate",
        }}
      ></div>

      {/* Main content container */}
      <div className="relative z-30 max-w-4xl mx-auto p-6 min-h-screen flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-white mb-8 text-center py-3">
          <span
            style={{
              backgroundImage: "linear-gradient(to right, #fd8f58, #f3535b)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {quizData.language} Quiz
          </span>
        </h1>

        <div className="space-y-6">
          {quizData.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="rounded-lg p-6 transition-all duration-200"
              style={{
                background: "rgba(25, 25, 50, 0.7)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(103, 102, 208, 0.2)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Card inner glow effect */}
              <div
                className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(103, 102, 208, 0.1) 0%, rgba(85, 70, 173, 0.08) 30%, rgba(44, 61, 149, 0.05) 60%, transparent 80%)",
                }}
              />

              <h3 className="text-xl font-semibold text-white mb-3 relative">
                Question {questionIndex + 1}
              </h3>
              <p className="text-gray-200 mb-4 relative">{question.text}</p>

              <div className="space-y-3 relative">
                {question.options.map((option, optionIndex) => {
                  const feedback =
                    quizResults?.detailed_feedback[questionIndex];
                  const isCorrectAnswer =
                    feedback &&
                    option === feedback.correct_answer.split(" ")[0];
                  const isUserSelectedOption =
                    selectedAnswers[questionIndex] === option;

                  return (
                    <label
                      key={optionIndex}
                      className={`p-4 rounded-md border transition-colors duration-200 flex items-center cursor-pointer w-full
                        ${submitted && isCorrectAnswer ? "bg-green-900/30 border-green-500/50" : ""}
                        ${submitted && isUserSelectedOption && !feedback?.is_correct ? "bg-red-900/30 border-red-500/50" : ""}
                        ${!submitted && isUserSelectedOption ? "bg-blue-900/20 border-blue-500/30" : ""}
                        ${!submitted && !isUserSelectedOption ? "option-hover border-gray-600/30" : ""}
                      `}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={option}
                        checked={isUserSelectedOption}
                        onChange={() =>
                          handleOptionSelect(questionIndex, option)
                        }
                        disabled={submitted}
                        className={`form-radio h-5 w-5 mr-3 ${
                          isUserSelectedOption
                            ? "accent-[#fd8f58]"
                            : "accent-[#6766d0]"
                        }`}
                      />
                      <span className="text-gray-200">{option}</span>

                      {submitted && quizResults && isCorrectAnswer && (
                        <span className="ml-2 text-green-400 font-medium">
                          ✓ Correct
                        </span>
                      )}

                      {submitted &&
                        quizResults &&
                        isUserSelectedOption &&
                        !feedback?.is_correct && (
                          <span className="ml-2 text-red-400 font-medium">
                            ✗ Incorrect
                          </span>
                        )}
                    </label>
                  );
                })}
              </div>

              {submitted && quizResults && (
                <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded-md text-blue-200 text-sm relative">
                  <strong className="font-medium">Explanation:</strong>{" "}
                  {quizResults.detailed_feedback[questionIndex]?.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={
              submitted ||
              Object.keys(selectedAnswers).length !== quizData.total_questions
            }
            className="relative overflow-hidden px-8 py-4 rounded-full font-medium text-white shadow-md transition-all"
            style={{
              background: "linear-gradient(135deg, #6766d0, #5546ad, #2c3d95)",
              boxShadow: "0 2px 10px rgba(103, 102, 208, 0.5)",
              transform: "translateY(0)",
              transition: "all 0.3s ease",
              opacity:
                submitted ||
                Object.keys(selectedAnswers).length !== quizData.total_questions
                  ? 0.6
                  : 1,
            }}
            onMouseOver={(e) => {
              if (
                !submitted &&
                Object.keys(selectedAnswers).length === quizData.total_questions
              ) {
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Button shine effect */}
            <span
              className="absolute top-0 left-[-100%] w-[200%] h-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                animation:
                  !submitted &&
                  Object.keys(selectedAnswers).length ===
                    quizData.total_questions
                    ? "shine 2s infinite"
                    : "none",
              }}
            ></span>
            SUBMIT QUIZ
          </button>
        </div>

        {submitted && quizResults && (
          <div
            className="mt-10 rounded-lg p-6 max-w-2xl mx-auto relative"
            style={{
              background: "rgba(25, 25, 50, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(103, 102, 208, 0.2)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-4 text-center relative">
              Results
            </h2>
            <div className="flex justify-center mb-4 relative">
              <div className="text-center">
                <div
                  className="text-5xl font-bold mb-2"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #6766d0, #fd8f58)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {quizResults.score_percentage}%
                </div>
                <p className="text-gray-300">
                  {quizResults.correct_answers} / {quizResults.total_questions}{" "}
                  correct
                </p>
              </div>
            </div>
            <p className="text-center text-lg mb-6 relative">
              Skill Level:{" "}
              <span className="font-bold text-[#fd8f58]">
                {quizResults.skill_level}
              </span>
            </p>
            <div className="flex justify-center relative">
              <button
                onClick={handleNext}
                className="relative overflow-hidden px-8 py-4 rounded-full font-medium text-white shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #6766d0, #5546ad, #2c3d95)",
                  boxShadow: "0 2px 10px rgba(103, 102, 208, 0.5)",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Button shine effect */}
                <span
                  className="absolute top-0 left-[-100%] w-[200%] h-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                    animation: "shine 2s infinite",
                  }}
                ></span>
                CONTINUE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
