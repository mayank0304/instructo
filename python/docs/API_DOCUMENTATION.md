# Coding Challenge Service API Documentation

## 1. Request Parameters

### 1.1 Common Parameters

| Parameter     | Type   | Required | Default    | Description                                                           |
| ------------- | ------ | -------- | ---------- | --------------------------------------------------------------------- |
| `objective`   | string | Yes      | -          | The learning goal or purpose of the coding challenge                  |
| `description` | string | Yes      | -          | Detailed description of the challenge                                 |
| `language`    | string | No       | "Python"   | Programming language for the challenge (e.g., "Python", "JavaScript") |
| `difficulty`  | string | No       | "moderate" | Challenge difficulty level                                            |

### 1.2 Supported Languages

- Python
- JavaScript
- TypeScript
- Java
- C++
- Ruby

### 1.3 Difficulty Levels

- `easy`: Suitable for beginners, simple concepts and implementations
- `moderate`: Intermediate level, requires some prior programming knowledge
- `hard`: Advanced challenges, complex problem-solving and algorithmic thinking

## 2. Endpoint Details

### 2.1 Incomplete Code Challenge

**Endpoint**: `POST /challenge/incomplete-code`

#### Request Body Example

```json
{
  "objective": "Learn list comprehension",
  "description": "Create a function using list comprehension",
  "language": "Python",
  "difficulty": "moderate"
}
```

#### Response Structure

```json
{
  "language": "string",
  "code": "string",
  "missing_parts": [
    {
      "location": "string",
      "hint": "string",
      "difficulty": "string"
    }
  ],
  "learning_goals": ["string"]
}
```

### 2.2 Output-Based Challenge

**Endpoint**: `POST /challenge/output-based`

#### Request Body Example

```json
{
  "objective": "Practice string manipulation",
  "description": "Create a function to process strings",
  "language": "Python",
  "difficulty": "moderate"
}
```

#### Response Structure

```json
{
  "language": "string",
  "expected_output": "string",
  "input_description": "string",
  "challenge_details": {
    "difficulty": "string",
    "key_concepts": ["string"]
  },
  "test_cases": [
    {
      "input": "any",
      "expected_output": "any"
    }
  ]
}
```

### 2.3 Problem-Solving Challenge

**Endpoint**: `POST /challenge/problem-solving`

#### Request Body Example

```json
{
  "objective": "Implement a data structure",
  "description": "Create a binary search tree",
  "language": "Python",
  "difficulty": "hard"
}
```

#### Response Structure

```json
{
  "language": "string",
  "problem_statement": "string",
  "challenge_details": {
    "difficulty": "string",
    "key_concepts": ["string"],
    "constraints": ["string"]
  },
  "input_specification": {
    "parameters": [
      {
        "name": "string",
        "type": "string",
        "description": "string"
      }
    ]
  },
  "output_specification": {
    "type": "string",
    "description": "string"
  },
  "example_cases": [
    {
      "input": "any",
      "output": "any",
      "explanation": "string"
    }
  ]
}
```

## 3. Error Handling

### 3.1 Common Error Responses

| HTTP Status | Error Code                    | Description                                        |
| ----------- | ----------------------------- | -------------------------------------------------- |
| 400         | `INVALID_LANGUAGE`            | Unsupported programming language                   |
| 400         | `INVALID_DIFFICULTY`          | Unsupported difficulty level                       |
| 422         | `CHALLENGE_GENERATION_FAILED` | Unable to generate challenge with given parameters |

### 3.2 Example Error Response

```json
{
  "error": {
    "code": "INVALID_LANGUAGE",
    "message": "Requested language 'Rust' is not supported",
    "supported_languages": ["Python", "JavaScript", "TypeScript"]
  }
}
```

## 4. Best Practices

- Always specify a clear and concise `objective`
- Choose an appropriate `difficulty` level matching the learner's skills
- Provide a descriptive `description` that outlines the challenge
- Select a `language` that aligns with the learning goals

## 5. Version

**API Version**: 1.1.0
**Last Updated**: 2024-07-10
