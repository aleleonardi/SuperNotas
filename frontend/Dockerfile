FROM node:20

WORKDIR /app

COPY app/package.json app/yarn.lock* ./

RUN if [ -f package.json ]; then yarn install; fi

COPY app/ .

CMD ["yarn", "start"]
