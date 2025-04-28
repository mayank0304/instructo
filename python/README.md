# Instructo AI Learning Platform

## Overview

Instructo is an AI-powered learning platform designed to help programmers improve their skills through interactive quizzes, code reviews, and intelligent guidance.

## Prerequisites

- Python 3.8+
- Flask
- LangChain
- Google Generative AI (Gemini)

## Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/instructo.git
cd instructo
```

2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Set up environment variables
   Create a `.env` file in the project root with:

```
GOOGLE_API_KEY=your_google_api_key_here
HOST=0.0.0.0
PORT=5000
DEBUG=True
```

## Running the Application

```bash
python app.py
```

## API Routes

### 1. Quiz Generation Routes

#### Generate Quiz

- **Endpoint**: `/quiz/generate`
- **Method**: GET
- **Query Parameter**: `language` (required)

**Request**:

```bash
curl -X GET "http://localhost:5000/quiz/generate?language=Python"
```

**Response Example**:

```json
{
  "language": "Python",
  "total_questions": 20,
  "questions": [
    {
      "text": "What is a list comprehension in Python?",
      "options": [
        "A way to create lists using loops",
        "A method to compress lists",
        "A concise way to create lists",
        "A list sorting technique"
      ],
      "correct_answer": "A concise way to create lists",
      "difficulty": "moderate",
      "explanation": "List comprehensions provide a concise way to create lists based on existing lists or other iterable objects."
    }
    // ... 19 more questions
  ]
}
```

#### Evaluate Quiz

- **Endpoint**: `/quiz/evaluate`
- **Method**: POST

**Request Body**:

```json
{
  "language": "Python",
  "responses": [
    {
      "question": "What is a list comprehension?",
      "answer": "A concise way to create lists"
    }
    // ... more responses
  ]
}
```

**Response Example**:

```json
{
  "total_questions": 20,
  "correct_answers": 15,
  "score_percentage": 75.0,
  "skill_level": "moderate",
  "detailed_feedback": [
    {
      "question": "What is a list comprehension?",
      "user_answer": "A concise way to create lists",
      "correct_answer": "A concise way to create lists",
      "is_correct": true,
      "explanation": "Correct! List comprehensions are an efficient way to create lists in Python."
    }
    // ... more detailed feedback
  ]
}
```

### 2. Code Review Routes

#### Code Review

- **Endpoint**: `/code/review`
- **Method**: POST

**Request Body**:

```json
{
  "language": "Python",
  "code": "def calculate_sum(a, b):\n    return a + b"
}
```

**Response Example**:

```json
{
  "overall_assessment": {
    "code_quality": "average",
    "potential_improvements": ["Add type hints", "Consider input validation"],
    "complexity_score": 2
  },
  "detailed_review": [
    {
      "category": "Structure/Organization",
      "observations": ["Simple function with clear purpose"],
      "suggestions": ["Consider adding docstring", "Add error handling"]
    }
    // ... more detailed review categories
  ],
  "learning_resources": [
    {
      "topic": "Python Function Best Practices",
      "url": "https://realpython.com/defining-your-own-python-function/"
    }
  ]
}
```

#### Code Chat

- **Endpoint**: `/code/chat`
- **Method**: POST

**Request Body**:

```json
{
  "message": "How do I improve my Python programming skills?"
}
```

**Response Example**:

```json
{
  "response_type": "guidance",
  "main_points": [
    "Practice consistently",
    "Work on projects",
    "Read and understand others' code"
  ],
  "detailed_explanation": "Improving Python skills requires a multi-faceted approach...",
  "learning_resources": [
    {
      "title": "Python Mastery Course",
      "url": "https://example.com/python-course",
      "type": "online_course"
    }
  ],
  "recommended_next_steps": [
    "Complete online tutorials",
    "Contribute to open-source projects"
  ]
}
```

### 3. Coding Challenge Routes

#### 3.1 Incomplete Code Challenge

**Endpoint**: `POST /challenge/incomplete-code`

**Request Body**:

```json
{
  "objective": "Learn list comprehension in Python",
  "description": "Create a function that uses list comprehension to transform a list",
  "language": "Python",
  "difficulty": "moderate"
}
```

**Response Example**:

```json
{
  "language": "Python",
  "code": "def transform_list(input_list):\n    # Incomplete code with placeholders\n    pass",
  "missing_parts": [
    {
      "location": "function body",
      "hint": "Use list comprehension to transform the list",
      "difficulty": "moderate"
    }
  ],
  "learning_goals": [
    "Understand list comprehension syntax",
    "Practice functional programming concepts"
  ]
}
```

#### 3.2 Output-Based Challenge

**Endpoint**: `POST /challenge/output-based`

**Request Body**:

```json
{
  "objective": "Practice string manipulation",
  "description": "Create a function that processes a list of strings",
  "language": "Python",
  "difficulty": "moderate"
}
```

**Response Example**:

```json
{
  "language": "Python",
  "expected_output": "Processed list of strings",
  "input_description": "List of strings to be transformed",
  "challenge_details": {
    "difficulty": "moderate",
    "key_concepts": ["String manipulation", "List processing"]
  },
  "test_cases": [
    {
      "input": ["hello", "world"],
      "expected_output": ["HELLO", "WORLD"]
    }
  ]
}
```

#### 3.3 Problem-Solving Challenge

**Endpoint**: `POST /challenge/problem-solving`

**Request Body**:

```json
{
  "objective": "Implement a data structure algorithm",
  "description": "Create a binary search tree implementation",
  "language": "Python",
  "difficulty": "hard"
}
```

**Response Example**:

```json
{
  "language": "Python",
  "problem_statement": "Implement a binary search tree with insertion and search methods",
  "challenge_details": {
    "difficulty": "hard",
    "key_concepts": ["Tree data structures", "Recursive algorithms"],
    "constraints": ["Implement without using built-in tree libraries"]
  },
  "input_specification": {
    "parameters": [
      {
        "name": "values",
        "type": "list",
        "description": "List of values to insert into the tree"
      }
    ]
  },
  "output_specification": {
    "type": "BinarySearchTree",
    "description": "Fully constructed binary search tree"
  },
  "example_cases": [
    {
      "input": "[5, 3, 7, 1, 4, 6, 8]",
      "output": "Binary Search Tree with given values",
      "explanation": "Tree constructed with values in correct order"
    }
  ]
}
```

#### 3.4 Submit Solution

**Endpoint**: `POST /challenge/submit-solution`

**Request Body**:

```json
{
  "code": "def solve_challenge(input_data):\n    # Solution code here",
  "language": "Python",
  "challenge_type": "problem-solving"
}
```

**Response Example**:

```json
{
  "overall_assessment": {
    "strengths": ["Correct implementation", "Clean code structure"],
    "areas_for_improvement": [
      "Add more error handling",
      "Optimize time complexity"
    ]
  },
  "learning_insights": [
    {
      "concept": "Algorithmic problem-solving",
      "explanation": "Detailed breakdown of the solution approach",
      "resources": [
        {
          "title": "Advanced Python Algorithms",
          "url": "https://example.com/python-algorithms"
        }
      ]
    }
  ],
  "alternative_approaches": [
    {
      "description": "Alternative solution using a different algorithm",
      "pros": ["More time-efficient", "Simpler implementation"],
      "cons": ["Higher space complexity", "Less readable"]
    }
  ]
}
```

**Notes**:

- `language` parameter is optional (defaults to Python)
- `difficulty` parameter is optional (defaults to moderate)
- Supported languages include Python, JavaScript, and more
- Difficulty levels: easy, moderate, hard

## Challenge Types Overview

The Coding Challenge routes provide three distinct types of learning experiences:

1. **Incomplete Code Challenge**:

   - Provides partially written code
   - Requires completing the implementation
   - Focuses on specific coding skills

2. **Output-Based Challenge**:

   - Provides a specific output requirement
   - Allows flexible implementation
   - Tests understanding of problem-solving

3. **Problem-Solving Challenge**:
   - Provides a comprehensive problem statement
   - Requires full implementation
   - Tests advanced algorithmic and problem-solving skills

### Key Features

- Adaptive difficulty levels
- Integrated code review
- Personalized learning guidance
- Multiple challenge types
- Concept-focused learning

## Error Handling

All routes return JSON error responses with appropriate HTTP status codes:

```json
{
  "error": "Detailed error message"
}
```

## Authentication

Currently, the API does not require authentication. Future versions may implement user authentication.

## Rate Limiting

No rate limiting is currently implemented. This may be added in future versions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/instructo](https://github.com/yourusername/instructo)
