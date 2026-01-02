FROM node:18
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy rest of the code
COPY . .

# Start the consumer
CMD ["npm", "start"]
