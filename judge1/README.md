# Code Submission API

A Go API for submitting and executing code snippets in various programming languages using Docker-based sandboxing.

## Features

- Code execution in a secure Docker-based sandbox
- Support for multiple languages:
  - Python
  - JavaScript
  - Java
  - C++
  - C
- Resource limitations to prevent abuse
- CORS support for web applications

## Prerequisites

- Go 1.16+
- Docker installed and running
- Docker API access

## Installation

```bash
# Clone the repository
git clone https://github.com/daveydark/code-submission-api.git
cd code-submission-api

# Get dependencies
go mod tidy

# Build the application
go build -o code-submission-api
```

## Running the Server

```bash
./code-submission-api
```

The server will start on port 8080 by default.

## API Endpoints

### Submit Code

Submit code for execution in a specific language.

- `POST /submit/python` - Submit Python code
- `POST /submit/javascript` - Submit JavaScript code
- `POST /submit/java` - Submit Java code
- `POST /submit/cpp` - Submit C++ code
- `POST /submit/c` - Submit C code

#### Request Format

```json
{
  "code": "print('Hello, World!')"
}
```

Note: The language is determined from the endpoint URL and doesn't need to be specified in the request body.

#### Response Format

Success:

```json
{
  "success": true,
  "output": "Hello, World!\n"
}
```

Error:

```json
{
  "success": false,
  "output": "",
  "error": "Error message"
}
```

### Health Check

- `GET /health` - Check if the API is running

## Example Usage

### Python

```bash
curl -X POST \
  http://localhost:8080/submit/python \
  -H 'Content-Type: application/json' \
  -d '{
    "code": "print(\"Hello from Python!\")"
}'
```

### JavaScript

```bash
curl -X POST \
  http://localhost:8080/submit/javascript \
  -H 'Content-Type: application/json' \
  -d '{
    "code": "console.log(\"Hello from JavaScript!\");"
}'
```

## Security Considerations

The API implements several security measures:

1. Code execution in isolated Docker containers
2. Network access disabled within containers
3. Memory and CPU limitations
4. Process count restrictions
5. Auto-removal of containers after execution

## License

MIT 