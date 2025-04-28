#!/bin/bash

# Start the API server in the background
./code-submission-api &
SERVER_PID=$!

# Give the server some time to start
echo "Starting server with PID $SERVER_PID..."
sleep 2

# Test the health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:8080/health
echo -e "\n"

# Test a Python code submission
echo "Testing Python code submission..."
curl -s -X POST \
  http://localhost:8080/submit/python \
  -H 'Content-Type: application/json' \
  -d '{
    "code": "print(\"Hello from Python!\")"
}'
echo -e "\n\n"

# Test a JavaScript code submission
echo "Testing JavaScript code submission..."
curl -s -X POST \
  http://localhost:8080/submit/javascript \
  -H 'Content-Type: application/json' \
  -d '{
    "code": "console.log(\"Hello from JavaScript!\");"
}'
echo -e "\n\n"

# Test a C code submission
echo "Testing C code submission..."
curl -s -X POST \
  http://localhost:8080/submit/c \
  -H 'Content-Type: application/json' \
  -d '{
    "code": "#include <stdio.h>\nint main() {\n    printf(\"Hello from C!\\n\");\n    return 0;\n}"
}'
echo -e "\n\n"

# Kill the server
echo "Killing server..."
kill $SERVER_PID

echo "Test completed!" 