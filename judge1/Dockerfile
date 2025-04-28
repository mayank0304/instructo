FROM golang:1.21-alpine as build

WORKDIR /app

# Copy go module files first for better caching
COPY go.mod go.sum ./

# No need to edit go.mod as we're using a compatible Go version now
RUN go mod download

# Copy source code
COPY . .

# Build with proper flags for production
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o code-submission-api .

# Use minimal scratch image for the smallest footprint
FROM alpine:3.18

WORKDIR /app

# Add certificates for HTTPS
RUN apk add --no-cache ca-certificates && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the binary from the build stage
COPY --from=build --chown=appuser:appgroup /app/code-submission-api .

# Use non-root user
USER appuser:appgroup

# Health check 
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["./code-submission-api"]
