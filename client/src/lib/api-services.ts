import { API_BASE_URL } from "./utils";
import { authFetch } from "./auth";

/**
 * API service for coding challenges
 */

// Challenge type definitions
export interface CodeChallenge {
  title: string;
  description: string;
  instructions: string;
  starter_code?: string;
  code?: string;
  language: string;
  difficulty: string;
  example_input?: string;
  example_output?: string;
  expected_output?: string;
  hints?: string[];
  time_limit_seconds?: number;
  // Problem challenge specific fields
  problem_statement?: string;
  example_cases?: Array<{
    input: any;
    output: string;
    explanation?: string;
  }>;
  input_specification?: {
    parameters?: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  };
  output_specification?: {
    description: string;
    type: string;
  };
  challenge_details?: {
    constraints?: string[];
    key_concepts?: string[];
    difficulty?: string;
  };
}

export interface CodeReview {
  overall_assessment: {
    code_quality: string;
    potential_improvements: string[];
    complexity_score: number;
  };
  detailed_review: Array<{
    category: string;
    observations: string[];
    suggestions: string[];
  }>;
  learning_resources: Array<{
    topic: string;
    url: string;
  }>;
}

// Fetch incomplete code challenge
export const fetchIncompleteCodeChallenge = async (
  objective: string,
  description: string,
  language: string
): Promise<{ incomplete_code: CodeChallenge; initial_review: CodeReview }> => {
  const response = await authFetch(`${API_BASE_URL}/api/langchain/challenge/incomplete-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      objective,
      description,
      language,
      difficulty: "moderate", // Default difficulty
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch incomplete code challenge");
  }

  return response.json();
};

// Fetch output-based challenge
export const fetchOutputChallenge = async (
  objective: string,
  description: string,
  language: string
): Promise<CodeChallenge> => {
  const response = await authFetch(`${API_BASE_URL}/api/langchain/challenge/output-based`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      objective,
      description,
      language,
      difficulty: "moderate", // Default difficulty
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch output-based challenge");
  }

  return response.json();
};

// Fetch problem-solving challenge
export const fetchProblemChallenge = async (
  objective: string,
  description: string,
  language: string
): Promise<CodeChallenge> => {
  const response = await authFetch(`${API_BASE_URL}/api/langchain/challenge/problem-solving`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      objective,
      description,
      language,
      difficulty: "moderate", // Default difficulty
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch problem-solving challenge");
  }

  return response.json();
};

// Submit solution
export const submitSolution = async (
  code: string,
  language: string,
  challengeType: string
): Promise<{ code_review: CodeReview; guidance: any }> => {
  const response = await authFetch(`${API_BASE_URL}/api/langchain/challenge/submit-solution`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      language,
      challenge_type: challengeType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit solution");
  }

  return response.json();
}; 