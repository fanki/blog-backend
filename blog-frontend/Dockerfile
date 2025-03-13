# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app
COPY . .

# Install dependencies und build
RUN npm install
RUN npm run build --prod

# Production stage
FROM nginx:alpine

# Copy the Angular build output to Nginx HTML folder
COPY --from=build-stage /app/dist/blog-frontend /usr/share/nginx/html

# Optional: Custom Nginx config (falls benötigt)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
