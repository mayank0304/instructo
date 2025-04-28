FROM maven:3.9-eclipse-temurin-21-alpine as build

WORKDIR /app

# Copy only pom.xml first for better caching
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Download dependencies (this layer can be cached if pom.xml doesn't change)
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build with Maven
RUN --mount=type=cache,target=/root/.m2 \
    mvn package -DskipTests

# Use smaller runtime image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy jar file from build stage
COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

CMD ["java", "-jar", "app.jar"]
