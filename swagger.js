const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SkillSwap API',
            version: '1.0.0',
            description: 'API documentation for SkillSwap application',
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'User ID',
                        },
                        name: {
                            type: 'string',
                            description: 'User name',
                        },
                        email: {
                            type: 'string',
                            description: 'User email',
                        },
                        skills: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'User skills',
                        },
                    },
                },
                Skill: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Skill ID',
                        },
                        name: {
                            type: 'string',
                            description: 'Skill name',
                        },
                        description: {
                            type: 'string',
                            description: 'Skill description',
                        },
                        category: {
                            type: 'string',
                            description: 'Skill category',
                        },
                    },
                },
                Match: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Match ID',
                        },
                        requester: {
                            type: 'string',
                            description: 'User ID of the requester',
                        },
                        receiver: {
                            type: 'string',
                            description: 'User ID of the receiver',
                        },
                        skills: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'Skills involved in the match',
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'accepted', 'rejected'],
                            description: 'Match status',
                        },
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Review ID',
                        },
                        matchId: {
                            type: 'string',
                            description: 'Associated match ID',
                        },
                        rating: {
                            type: 'number',
                            description: 'Rating (1-5)',
                        },
                        comment: {
                            type: 'string',
                            description: 'Review comment',
                        },
                        skillRated: {
                            type: 'string',
                            description: 'Skill being rated',
                        },
                    },
                },
            },
        },
    },
    apis: ['./routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
