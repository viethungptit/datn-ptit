# =============================
# 🧱 1️⃣ Builder stage - build bằng Maven
# =============================
FROM maven:3.9.11-amazoncorretto-24-alpine AS builder
WORKDIR /workspace

# Copy file cấu hình Maven để cache dependency
COPY pom.xml mvnw* ./
COPY .mvn .mvn

# Tải dependency (cache)
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B dependency:go-offline

# Copy source và build (bỏ test)
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -DskipTests package

# =============================
# ☕ 2️⃣ Extract stage - chỉ lấy JAR dependencies (giảm layer)
# =============================
FROM amazoncorretto:24-alpine-jdk AS extractor
WORKDIR /extract
COPY --from=builder /workspace/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# =============================
# 🚀 3️⃣ Runtime stage - cực nhẹ
# =============================
FROM eclipse-temurin:24-jre-alpine AS runtime

# Tạo user không phải root
ARG APP_USER=appuser
RUN addgroup -S ${APP_USER} && adduser -S ${APP_USER} -G ${APP_USER}
USER ${APP_USER}

WORKDIR /app
COPY --from=extractor /extract/dependencies/ ./
COPY --from=extractor /extract/spring-boot-loader/ ./
COPY --from=extractor /extract/snapshot-dependencies/ ./
COPY --from=extractor /extract/application/ ./

EXPOSE 5004
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
