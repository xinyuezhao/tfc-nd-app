# Stage 1
# building react application
# FROM node:14.2.0-alpine3.11 as react-build
FROM node:14.17-buster-slim as react-build

# set working directory
WORKDIR /cisco_nd_tfc_ui

# copy .npmrc and package.json to /cisco_nd_tfc_ui directory
COPY .npmrc .
COPY package.json .

# install project dependencies
# RUN apt-get update || : && apt-get install python -y

# RUN apt-get update || : && apt-get install python -y
RUN npm install --quiet node-gyp -g

# RUN npm install -g node-pre-gyp
RUN npm install

# copy all content from current directory to workdir
COPY . .

# build the project for production
RUN npm run build

# RUN apk del native-deps

# Stage 2
# set up production environment
FROM nginx:1.17.9-alpine

# expose port 80 to the outer world
EXPOSE 3000

# copy the angular build folder to the root of nginx
RUN rm /usr/share/nginx/html/index.html
COPY --from=react-build /cisco_nd_tfc_ui/build /usr/share/nginx/html/appcenter/cisco/terraform/ui
RUN ln -s /usr/share/nginx/html/appcenter/cisco/terraform/ui/index.html /usr/share/nginx/html/index.html
COPY ./temp/nginx.conf /etc/nginx/nginx.conf

# start nginx
ENTRYPOINT [ "nginx","-g","daemon off;"]
