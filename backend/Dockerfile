# Multi-stage build for Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application
COPY src ./src
RUN mvn clean package -DskipTests

# Lightweight runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy packaged jar from build stage
COPY --from=build /app/target/smart-attendance-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
