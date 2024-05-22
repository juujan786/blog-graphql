const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { config } = require('dotenv');
const connectDB = require('./config/database');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers/resolvers');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');

config();
connectDB();
const app = express();

async function startServer(){
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  app.use(bodyParser.json());
  app.use(cors());

  app.use('/graphql', expressMiddleware(server));

  app.listen(process.env.PORT,(req,res)=>{
    console.log(`server is working on port: ${process.env.PORT}`)
  }) 
}

startServer();