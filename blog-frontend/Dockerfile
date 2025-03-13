# Build Stage
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

# Production Stage
FROM nginx:alpine AS production-stage
COPY --from=build-stage /app/dist/blog-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
