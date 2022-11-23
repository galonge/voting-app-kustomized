FROM node:14-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:1.18-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/result/ /usr/share/nginx/html/
EXPOSE 80
