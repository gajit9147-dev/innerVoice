import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "InnerVoice API",

      version: "1.0.0",

      description:
        "REST API documentation for the InnerVoice AI Notes application.",
    },

    servers: [
      {
        url: "http://localhost:5000",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",

          scheme: "bearer",

          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    "./routes/*.js",
    "./controllers/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
