#FROM node:18-alpine AS build
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#COPY . .
#
## ARG and ENV MUST be placed BEFORE running build
#ARG REACT_APP_API_GATEWAY_URL
#ENV REACT_APP_API_GATEWAY_URL=$REACT_APP_API_GATEWAY_URL
#
#RUN npm run build
#
#FROM nginx:alpine
#COPY --from=build /app/build /usr/share/nginx/html
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]

# Stage 1: Build React static assets
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]