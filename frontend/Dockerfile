# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configurations and install
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine

# Copy built app to Nginx default folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config for API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
