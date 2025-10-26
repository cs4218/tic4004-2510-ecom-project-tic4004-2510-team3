# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Remove ALL mongoose imports from ALL files
RUN find . -name "*.js" -exec sed -i "/import.*mongoose/d" {} \; 2>/dev/null || true

# Fix the browserslist warning and build
RUN npx update-browserslist-db@latest
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]