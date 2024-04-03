const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bucketsRoutes = require('./routes/buckets');
const objectsRoutes = require('./routes/objects');

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration options
const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'S3-like Service API',
      version: '1.0.0',
      description: 'API documentation for S3-like Service',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Update with your server URL
        description: 'Development server',
      },
    ],
    schemes:['http','https']
    
  },
  // Path to the API routes
  apis: ['./routes/*.js'],
};

// Initialize Swagger JSdoc
const specs = swaggerJsdoc(options);

app.use(bodyParser.json());

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes for buckets and objects
app.use('/buckets', bucketsRoutes);
app.use('/objects', objectsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
