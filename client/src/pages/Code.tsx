import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { API_BASE_URL, JUDGE_API_URL } from "../lib/utils";
import { authFetch } from "../lib/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface CodeReviewCategory {
  category: string;
  observations: string[];
  suggestions: string[];
}

interface CodeReview {
  overall_assessment: {
    code_quality: string;
    potential_improvements: string[];
    complexity_score: number;
  };
  detailed_review: CodeReviewCategory[];
  learning_resources: {
    topic: string;
    url: string;
  }[];
}

interface CodePageProps {}

const CodePage: React.FC<CodePageProps> = () => {
  const location = useLocation();
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState<string>("");
  const [selectedText, setSelectedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [codeOutput, setCodeOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [codeReview, setCodeReview] = useState<CodeReview | null>(null);

  // Get data from location state or use defaults
  const objective = location.state?.objective || "Code Challenge";
  const description = location.state?.description || "";
  const language = location.state?.language || "javascript";
  const challengeType = location.state?.challengeType || "complete";
  const starterCode = location.state?.starterCode || "";
  const challenge = location.state?.challenge || {
    description: "",
    example_output: "",
  };
  const exampleOutput =
    location.state?.exampleOutput || challenge.example_output || "";
  const hints = location.state?.hints || [];
  const initialReview = location.state?.initialReview || null;
  const debug = location.state?.debug || "";
  const problemDetails = location.state?.problemDetails || null;

  useEffect(() => {
    // Debug log to console to see what data we're getting
    console.log("CodePage received state:", location.state);
    console.log("Challenge data:", challenge);
    console.log("Starter code:", starterCode);
    console.log("Example output:", exampleOutput);

    // Attempt to extract data from debug JSON if normal paths failed
    if ((!starterCode || starterCode === "") && debug) {
      try {
        const debugData = JSON.parse(debug);
        console.log("Parsed debug data:", debugData);

        if (challengeType === "complete" && debugData.incomplete_code?.code) {
          console.log(
            "Loading code from debug data:",
            debugData.incomplete_code.code,
          );
          setCode(debugData.incomplete_code.code);
        } else if (debugData.code) {
          console.log("Loading code from debug data root:", debugData.code);
          setCode(debugData.code);
        }
      } catch (err) {
        console.error("Failed to parse debug data:", err);
      }
    }
  }, [
    location.state,
    challenge,
    starterCode,
    exampleOutput,
    debug,
    challengeType,
  ]);

  // Set initial code from starter code if provided
  useEffect(() => {
    if (starterCode && starterCode.trim() !== "") {
      console.log("Setting initial code to:", starterCode);
      setCode(starterCode);
    }
  }, [starterCode]);

  // Set initial review from initial review if provided
  useEffect(() => {
    if (initialReview) {
      setCodeReview(initialReview);

      // Add system message about initial code review
      const systemMessage: ChatMessage = {
        role: "assistant",
        content:
          "I've analyzed the initial code structure. Here are some thoughts:\n\n" +
          formatCodeReview(initialReview),
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, systemMessage]);
    }
  }, [initialReview]);

  // Handle Monaco editor initialization
  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;

    // Listen for selection changes to track selected text
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getModel().getValueInRange(e.selection);
      setSelectedText(selection);
    });
  }

  // Handle code changes
  function handleEditorChange(value: string | undefined) {
    setCode(value || "");
  }

  // Run code and get output
  const runCode = async () => {
    if (!code || code.trim() === "") {
      setCodeOutput("Please enter code first");
      return;
    }

    setIsRunning(true);
    setShowOutput(true);
    setCodeOutput("Running code...");

    try {
      // Call the judge API to execute the code
      const executeResponse = await fetch(
        `${JUDGE_API_URL}/submit/${language}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        },
      );

      if (!executeResponse.ok) {
        throw new Error("Failed to execute code");
      }

      const executeResult = await executeResponse.json();
      setCodeOutput(executeResult.output || executeResult.error || "No output");

      // After running the code, request a code review
      await requestCodeReview();
    } catch (error) {
      console.error("Error running code:", error);
      setCodeOutput(
        `Error running code: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsRunning(false);
    }
  };

  // Request a code review from the API
  const requestCodeReview = async () => {
    try {
      const reviewResponse = await authFetch(
        `${API_BASE_URL}/api/langchain/code/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
          body: JSON.stringify({
            code,
            language,
          }),
        },
      );

      if (!reviewResponse.ok) {
        throw new Error("Failed to get code review");
      }

      const reviewData = await reviewResponse.json();
      setCodeReview(reviewData);

      // Add the code review to the chat
      const reviewMessage: ChatMessage = {
        role: "assistant",
        content: formatCodeReview(reviewData),
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, reviewMessage]);

      // Apply suggestions as comments if possible
      applyReviewComments(reviewData);
    } catch (error) {
      console.error("Error getting code review:", error);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Failed to get code review. Please try again.",
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Format code review data for display in chat
  const formatCodeReview = (review: CodeReview): string => {
    if (!review) return "No review available";

    let formattedReview = "# Code Review\n\n";

    // Overall assessment
    formattedReview += `## Overall Assessment\n`;
    formattedReview += `• Quality: ${review.overall_assessment.code_quality}\n`;
    formattedReview += `• Complexity: ${review.overall_assessment.complexity_score}/10\n\n`;

    if (review.overall_assessment.potential_improvements.length > 0) {
      formattedReview += "### Potential Improvements\n";
      review.overall_assessment.potential_improvements.forEach(
        (improvement) => {
          formattedReview += `• ${improvement}\n`;
        },
      );
      formattedReview += "\n";
    }

    // Detailed review
    formattedReview += "## Detailed Review\n\n";
    review.detailed_review.forEach((category) => {
      formattedReview += `### ${category.category}\n`;

      if (category.observations.length > 0) {
        formattedReview += "**Observations:**\n";
        category.observations.forEach((observation) => {
          formattedReview += `• ${observation}\n`;
        });
        formattedReview += "\n";
      }

      if (category.suggestions.length > 0) {
        formattedReview += "**Suggestions:**\n";
        category.suggestions.forEach((suggestion) => {
          formattedReview += `• ${suggestion}\n`;
        });
        formattedReview += "\n";
      }
    });

    // Learning resources
    if (review.learning_resources.length > 0) {
      formattedReview += "## Learning Resources\n";
      review.learning_resources.forEach((resource) => {
        formattedReview += `• [${resource.topic}](${resource.url})\n`;
      });
    }

    return formattedReview;
  };

  // Apply review comments to the code in the editor
  const applyReviewComments = (review: CodeReview) => {
    if (!editorRef.current || !review) return;

    const editor = editorRef.current;
    const model = editor.getModel();

    // Create decorations array for inline comments
    const decorations: Array<{
      range: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
      };
      options: {
        isWholeLine: boolean;
        className: string;
        glyphMarginClassName: string;
        hoverMessage: {
          value: string;
        };
      };
    }> = [];

    // Get all suggestions from all categories
    const allSuggestions = review.detailed_review.flatMap((category) =>
      category.suggestions.map((suggestion) => ({
        category: category.category,
        suggestion,
      })),
    );

    // Simple algorithm to distribute comments across the code
    // This is a simple approach; a more sophisticated approach would
    // analyze the code to place comments at relevant positions
    const lineCount = model.getLineCount();

    if (lineCount > 0 && allSuggestions.length > 0) {
      // Distribute comments throughout the code
      const linesPerSuggestion = Math.max(
        1,
        Math.floor(lineCount / (allSuggestions.length + 1)),
      );

      allSuggestions.forEach((item, index) => {
        const lineNumber = Math.min(
          lineCount,
          (index + 1) * linesPerSuggestion,
        );

        // Create the decoration for each comment
        decorations.push({
          range: {
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            className: "code-review-line-highlight",
            glyphMarginClassName: "code-review-glyph",
            hoverMessage: {
              value: `**${item.category}**: ${item.suggestion}`,
            },
          },
        });
      });
    }

    // Apply the decorations to the editor
    editor.deltaDecorations([], decorations);
  };

  // Scroll to bottom of chat container when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Send message to the LLM chat service
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      let promptMessage = chatInput;

      // Add challenge context if it exists
      if (challengeType !== "practice") {
        promptMessage += `\n\nThis is a ${challengeType} challenge where the user is trying to: ${objective}. ${description}`;

        if (challengeType === "output" && exampleOutput) {
          promptMessage += `\n\nThe expected output is:\n\`\`\`\n${exampleOutput}\n\`\`\``;
        }

        if (challengeType === "problem" && hints.length > 0) {
          promptMessage += `\n\nHints for this problem:\n`;
          hints.forEach((hint: string, index: number) => {
            promptMessage += `${index + 1}. ${hint}\n`;
          });
        }
      }

      const response = await authFetch(
        `${API_BASE_URL}/api/langchain/code/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
          body: JSON.stringify({ message: promptMessage }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const responseData = await response.json();

      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: formatLLMResponse(responseData),
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Sorry, there was an error processing your request. Please try again.",
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format the LLM response for display
  const formatLLMResponse = (data: any): string => {
    if (!data) return "Sorry, I couldn't process that request.";

    try {
      let formattedResponse = "";

      // Add main points as bullet points
      if (data.main_points && data.main_points.length > 0) {
        formattedResponse += "Key points:\n";
        data.main_points.forEach((point: string) => {
          formattedResponse += `• ${point}\n`;
        });
        formattedResponse += "\n";
      }

      // Add detailed explanation
      if (data.detailed_explanation) {
        formattedResponse += data.detailed_explanation + "\n\n";
      }

      // Add learning resources if available
      if (data.learning_resources && data.learning_resources.length > 0) {
        formattedResponse += "Resources:\n";
        data.learning_resources.forEach((resource: any) => {
          formattedResponse += `• ${resource.title}: ${resource.url}\n`;
        });
        formattedResponse += "\n";
      }

      // Add next steps if available
      if (
        data.recommended_next_steps &&
        data.recommended_next_steps.length > 0
      ) {
        formattedResponse += "Next steps:\n";
        data.recommended_next_steps.forEach((step: string) => {
          formattedResponse += `• ${step}\n`;
        });
      }

      return formattedResponse.trim();
    } catch (err) {
      console.error("Error formatting response:", err);
      return (
        data.detailed_explanation ||
        "Sorry, I couldn't format the response properly."
      );
    }
  };

  // Get challenge-specific UI elements
  const getChallengeSpecificUI = () => {
    switch (challengeType) {
      case "complete":
        return (
          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-4 mb-4 border border-[rgba(103,102,208,0.2)]">
            <h3 className="text-lg font-semibold mb-2 text-[#6766d0]">
              Code Completion Challenge
            </h3>
            <p className="text-[rgba(255,255,255,0.8)] mb-2">
              Your task is to complete the code by filling in the missing parts.
            </p>
            {challenge && challenge.example_output && (
              <div className="mt-3">
                <h4 className="font-medium text-[#6766d0]">Expected Output:</h4>
                <div className="bg-[rgba(0,0,0,0.3)] p-2 rounded-md font-mono text-sm whitespace-pre-wrap mt-1">
                  {challenge.example_output}
                </div>
              </div>
            )}
          </div>
        );

      case "output":
        return (
          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-4 mb-4 border border-[rgba(243,83,91,0.2)]">
            <h3 className="text-lg font-semibold mb-2 text-[#f3535b]">
              Output Based Challenge
            </h3>
            <p className="text-[rgba(255,255,255,0.8)] mb-2">
              Write code that produces exactly the expected output.
            </p>
            {exampleOutput ? (
              <div className="mt-3">
                <h4 className="font-medium text-[#f3535b]">Expected Output:</h4>
                <div className="bg-[rgba(0,0,0,0.3)] p-2 rounded-md font-mono text-sm whitespace-pre-wrap mt-1">
                  {exampleOutput}
                </div>
              </div>
            ) : challenge &&
              (challenge.expected_output || challenge.example_output) ? (
              <div className="mt-3">
                <h4 className="font-medium text-[#f3535b]">Expected Output:</h4>
                <div className="bg-[rgba(0,0,0,0.3)] p-2 rounded-md font-mono text-sm whitespace-pre-wrap mt-1">
                  {challenge.expected_output || challenge.example_output}
                </div>
              </div>
            ) : debug ? (
              <div className="mt-3">
                <h4 className="font-medium text-[#f3535b]">Expected Output:</h4>
                <div className="bg-[rgba(0,0,0,0.3)] p-2 rounded-md font-mono text-sm whitespace-pre-wrap mt-1">
                  {(() => {
                    try {
                      const debugData = JSON.parse(debug);
                      console.log("Output challenge debug data:", debugData);

                      // Check different locations where expected output might be
                      if (
                        typeof debugData === "object" &&
                        debugData.challenge_details
                      ) {
                        console.log("Challenge details found");
                      }

                      return (
                        debugData.expected_output ||
                        debugData.example_output ||
                        (debugData.challenge_details &&
                          debugData.challenge_details.expected_output) ||
                        (debugData.incomplete_code &&
                          debugData.incomplete_code.expected_output) ||
                        (debugData.incomplete_code &&
                          debugData.incomplete_code.example_output) ||
                        // Special case for the structure you provided
                        (typeof debugData === "object" &&
                        debugData.hasOwnProperty("expected_output")
                          ? debugData.expected_output
                          : null) ||
                        // Format from the specific example you sent
                        (typeof debugData === "object" &&
                        debugData.test_cases &&
                        debugData.test_cases.length > 0
                          ? debugData.test_cases[0].expected_output
                          : null) ||
                        "No output specified in challenge data."
                      );
                    } catch (e) {
                      console.error("Error parsing debug data:", e);
                      return "Failed to parse output data.";
                    }
                  })()}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-[rgba(255,255,255,0.7)]">
                <p>No expected output provided.</p>
              </div>
            )}
          </div>
        );

      case "problem":
        return (
          <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-4 mb-4 border border-[rgba(103,102,208,0.2)] overflow-y-auto max-h-[calc(100vh-300px)]">
            <h3 className="text-lg font-semibold mb-2 text-[rgba(103,102,208,0.9)]">
              Problem Solving Challenge
            </h3>

            {/* Problem Statement */}
            <div className="mb-4">
              <h4 className="font-medium text-[rgba(103,102,208,0.9)] mb-1">
                Problem Statement:
              </h4>
              <p className="text-[rgba(255,255,255,0.8)]">
                {problemDetails?.problemStatement ||
                  challenge.problem_statement ||
                  (() => {
                    // Try to extract from debug data
                    try {
                      if (debug) {
                        const debugData = JSON.parse(debug);
                        return (
                          debugData.problem_statement ||
                          "Implement a solution for the given problem from scratch."
                        );
                      }
                    } catch (e) {
                      console.error(
                        "Error parsing debug data for problem statement:",
                        e,
                      );
                    }
                    return "Implement a solution for the given problem from scratch.";
                  })()}
              </p>
            </div>

            {/* Input Specification */}
            {(problemDetails?.inputSpecification?.parameters?.length > 0 ||
              challenge.input_specification?.parameters?.length > 0 ||
              (() => {
                try {
                  if (debug) {
                    const debugData = JSON.parse(debug);
                    return (
                      debugData.input_specification?.parameters?.length > 0
                    );
                  }
                } catch (e) {}
                return false;
              })()) && (
              <div className="mb-4">
                <h4 className="font-medium text-[rgba(103,102,208,0.9)] mb-1">
                  Input:
                </h4>
                <ul className="list-disc pl-5 text-[rgba(255,255,255,0.8)]">
                  {(
                    problemDetails?.inputSpecification?.parameters ||
                    challenge.input_specification?.parameters ||
                    (() => {
                      try {
                        if (debug) {
                          const debugData = JSON.parse(debug);
                          return (
                            debugData.input_specification?.parameters || []
                          );
                        }
                      } catch (e) {}
                      return [];
                    })()
                  ).map((param, index) => (
                    <li key={index}>
                      <strong>{param.name}</strong> ({param.type}):{" "}
                      {param.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Output Specification */}
            {(problemDetails?.outputSpecification ||
              challenge.output_specification) && (
              <div className="mb-4">
                <h4 className="font-medium text-[rgba(103,102,208,0.9)] mb-1">
                  Output:
                </h4>
                <p className="text-[rgba(255,255,255,0.8)]">
                  {problemDetails?.outputSpecification?.description ||
                    challenge.output_specification?.description}
                </p>
              </div>
            )}

            {/* Constraints */}
            {(problemDetails?.constraints?.length > 0 ||
              challenge.challenge_details?.constraints?.length > 0) && (
              <div className="mb-4">
                <h4 className="font-medium text-[rgba(103,102,208,0.9)] mb-1">
                  Constraints:
                </h4>
                <ul className="list-disc pl-5 text-[rgba(255,255,255,0.8)]">
                  {(
                    problemDetails?.constraints ||
                    challenge.challenge_details?.constraints ||
                    []
                  ).map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Example Cases */}
            {(problemDetails?.exampleCases?.length > 0 ||
              challenge.example_cases?.length > 0 ||
              (() => {
                try {
                  if (debug) {
                    const debugData = JSON.parse(debug);
                    return debugData.example_cases?.length > 0;
                  }
                } catch (e) {}
                return false;
              })()) && (
              <div className="mb-4">
                <h4 className="font-medium text-[rgba(103,102,208,0.9)] mb-1">
                  Examples:
                </h4>
                {(
                  problemDetails?.exampleCases ||
                  challenge.example_cases ||
                  (() => {
                    try {
                      if (debug) {
                        const debugData = JSON.parse(debug);
                        return debugData.example_cases || [];
                      }
                    } catch (e) {}
                    return [];
                  })()
                ).map((example, index) => (
                  <div
                    key={index}
                    className="mb-3 bg-[rgba(0,0,0,0.2)] p-3 rounded"
                  >
                    <div className="mb-2">
                      <strong className="text-[#6766d0]">Input:</strong>
                      <div className="bg-[rgba(0,0,0,0.3)] p-2 rounded-md font-mono text-sm whitespace-pre-wrap mt-1">
                        {typeof example.input === "object"
                          ? Object.entries(example.input)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join("\n")
                          : String(example.input)}
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong className="text-[#6766d0]">Output:</strong>
                      <div className="bg-[rgba(0,0,0,0.3)] p-2 rounded-md font-mono text-sm whitespace-pre-wrap mt-1">
                        {example.output}
                      </div>
                    </div>
                    {example.explanation && (
                      <div>
                        <strong className="text-[#6766d0]">Explanation:</strong>
                        <p className="text-[rgba(255,255,255,0.7)] text-sm">
                          {example.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Key Concepts */}
            {(problemDetails?.keyConcepts?.length > 0 ||
              challenge.challenge_details?.key_concepts?.length > 0) && (
              <div className="mb-4">
                <h4 className="font-medium text-[rgba(103,102,208,0.9)] mb-1">
                  Key Concepts:
                </h4>
                <ul className="list-disc pl-5 text-[rgba(255,255,255,0.8)]">
                  {(
                    problemDetails?.keyConcepts ||
                    challenge.challenge_details?.key_concepts ||
                    []
                  ).map((concept, index) => (
                    <li key={index}>{concept}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints */}
            {hints.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-[rgba(103,102,208,0.9)] mb-1">
                  Hints:
                </h4>
                <ul className="list-disc pl-5 text-[rgba(255,255,255,0.8)]">
                  {hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="font-sans bg-[#121228] text-white h-screen flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute w-full h-full bg-[radial-gradient(circle,rgba(44,61,149,0.1)_0%,rgba(18,18,40,0)_70%)] z-0"></div>

      {/* Main content */}
      <div className="flex flex-col h-full z-10 p-4">
        {/* Header */}
        <div className="flex justify-between mb-4 flex-row-reverse">
          <h1 className="text-xl font-semibold">Code Editor</h1>
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="w-12" />
          </Link>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor Section (60%) */}
          <div className="w-[60%] h-full overflow-hidden pr-4 flex flex-col">
            {/* Monaco Editor with Run Button */}
            <div className="relative bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl border border-[rgba(103,102,208,0.2)] flex-grow overflow-hidden">
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-[#6766d0] to-[#2c3d95] text-white font-medium shadow-md shadow-[rgba(103,102,208,0.3)] transition-all duration-300 hover:translate-y-[-2px] disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isRunning ? "Running..." : "Run Code"}
                </button>
              </div>
              <Editor
                height="100%"
                defaultLanguage={language}
                defaultValue={starterCode || "// Start coding here"}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  automaticLayout: true,
                }}
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
              />
            </div>

            {/* Output Panel */}
            {showOutput && (
              <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl border border-[rgba(103,102,208,0.2)] mt-4 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[#6766d0] font-semibold">Output</h3>
                  <button
                    onClick={() => setShowOutput(false)}
                    className="text-[rgba(255,255,255,0.7)] hover:text-white"
                  >
                    ×
                  </button>
                </div>
                <div className="bg-[rgba(0,0,0,0.3)] p-2 rounded-md font-mono text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {codeOutput || "No output"}
                </div>
              </div>
            )}
          </div>

          {/* Chat Section (40%) */}
          <div className="w-[40%] h-full overflow-hidden flex flex-col">
            {/* Objective and Description Panel - only shown in practice mode */}
            {challengeType === "practice" && (
              <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl p-4 mb-4 border border-[rgba(103,102,208,0.2)]">
                <h2 className="text-xl font-semibold mb-2 text-[#6766d0]">
                  Objective
                </h2>
                <p className="text-[rgba(255,255,255,0.9)] mb-4">{objective}</p>
                <h2 className="text-xl font-semibold mb-2 text-[#6766d0]">
                  Description
                </h2>
                <p className="text-[rgba(255,255,255,0.9)]">{description}</p>
              </div>
            )}

            {/* Challenge-specific UI */}
            {getChallengeSpecificUI()}

            {/* Chat Window */}
            <div className="flex-grow overflow-hidden">
              <div className="bg-[rgba(25,25,50,0.7)] backdrop-blur-md rounded-xl border border-[rgba(103,102,208,0.2)] h-full flex flex-col">
                {/* Chat Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-grow p-4 overflow-y-auto"
                >
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-[rgba(255,255,255,0.5)] py-8">
                      <p>Ask a question about your code.</p>
                      <p className="mt-2">Select code to get specific help.</p>
                      <p className="mt-2">
                        Run your code to get output and a code review.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}
                      >
                        <div
                          className={`inline-block max-w-[85%] p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-[#2c3d95] text-white"
                              : "bg-[rgba(103,102,208,0.3)] text-white"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <p style={{ whiteSpace: "pre-wrap" }}>
                              {msg.content}
                            </p>
                          ) : (
                            <div className="markdown-body">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({ node, ...props }) => (
                                    <h1
                                      className="text-xl font-bold mt-4 mb-2 text-[#6766d0]"
                                      {...props}
                                    />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2
                                      className="text-lg font-bold mt-3 mb-2 text-[#6766d0]"
                                      {...props}
                                    />
                                  ),
                                  h3: ({ node, ...props }) => (
                                    <h3
                                      className="text-md font-bold mt-2 mb-1 text-[#6766d0]"
                                      {...props}
                                    />
                                  ),
                                  p: ({ node, ...props }) => (
                                    <p className="mb-2" {...props} />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul
                                      className="list-disc pl-5 mb-2"
                                      {...props}
                                    />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol
                                      className="list-decimal pl-5 mb-2"
                                      {...props}
                                    />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li className="mb-1" {...props} />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a
                                      className="text-[#fd8f58] hover:underline"
                                      {...props}
                                    />
                                  ),
                                  code: ({
                                    node,
                                    inline,
                                    className,
                                    children,
                                    ...props
                                  }: {
                                    node?: any;
                                    inline?: boolean;
                                    className?: string;
                                    children?: React.ReactNode;
                                  }) =>
                                    inline ? (
                                      <code
                                        className="bg-[rgba(0,0,0,0.3)] px-1 rounded font-mono text-[#f3535b]"
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    ) : (
                                      <code
                                        className="block bg-[rgba(0,0,0,0.3)] p-2 rounded font-mono my-2 overflow-x-auto"
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    ),
                                  pre: ({ node, ...props }) => (
                                    <pre
                                      className="bg-transparent p-0 my-2"
                                      {...props}
                                    />
                                  ),
                                  blockquote: ({ node, ...props }) => (
                                    <blockquote
                                      className="border-l-4 border-[#6766d0] pl-4 italic opacity-90 my-2"
                                      {...props}
                                    />
                                  ),
                                  strong: ({ node, ...props }) => (
                                    <strong
                                      className="font-bold text-[#fd8f58]"
                                      {...props}
                                    />
                                  ),
                                  em: ({ node, ...props }) => (
                                    <em className="italic" {...props} />
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-center items-center my-2">
                      <div className="animate-pulse text-[rgba(255,255,255,0.7)]">
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={sendMessage}
                  className="p-4 border-t border-[rgba(103,102,208,0.2)]"
                >
                  <div className="flex">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about your code..."
                      className="flex-grow bg-[rgba(25,25,50,0.8)] border border-[rgba(103,102,208,0.3)] rounded-l-md px-4 py-2 text-white focus:outline-none focus:border-[#6766d0]"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-[#6766d0] to-[#2c3d95] text-white px-4 py-2 rounded-r-md hover:opacity-90 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePage;
