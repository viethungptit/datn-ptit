# Stage 1: Build ứng dụng
FROM node:24.7.0-alpine AS build

WORKDIR /app

# Copy file package.json và package-lock.json
COPY package*.json ./

# Cài đặt npm mới nhất và dependencies
RUN npm install -g npm@latest
RUN npm install --legacy-peer-deps

# Copy mã nguồn
COPY . .

ARG VITE_GATEWAY_SERVICE_URL
ARG VITE_MINIO_ENDPOINT

ENV VITE_GATEWAY_SERVICE_URL=$VITE_GATEWAY_SERVICE_URL
ENV VITE_MINIO_ENDPOINT=$VITE_MINIO_ENDPOINT

RUN echo "VITE_GATEWAY_SERVICE_URL=$VITE_GATEWAY_SERVICE_URL"
RUN echo "VITE_MINIO_ENDPOINT=$VITE_MINIO_ENDPOINT"

# Build ứng dụng (sử dụng build mặc định)
RUN npm run build

# Stage 2: Serve file tĩnh với serve
FROM node:24.7.0-alpine

WORKDIR /app

# Copy file build từ stage trước
COPY --from=build /app/dist ./dist

# Cài đặt serve
RUN npm install -g serve

# Expose cổng 5173
EXPOSE 5173

# Chạy ứng dụng
CMD ["serve", "-s", "dist", "-l", "5173"]