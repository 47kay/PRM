export declare function getAllPaths(): {
    '/users': {
        get: {
            tags: string[];
            summary: string;
            security: {
                bearerAuth: any[];
            }[];
            parameters: ({
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                    default: number;
                };
            } | {
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                    default?: undefined;
                };
            })[];
            responses: {
                '200': {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
                '401': {
                    description: string;
                };
                '403': {
                    description: string;
                };
            };
        };
        post: {
            tags: string[];
            summary: string;
            security: {
                bearerAuth: any[];
            }[];
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            responses: {
                '201': {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                '400': {
                    description: string;
                };
                '401': {
                    description: string;
                };
                '403': {
                    description: string;
                };
            };
        };
    };
    '/users/{id}': {
        get: {
            tags: string[];
            summary: string;
            security: {
                bearerAuth: any[];
            }[];
            parameters: {
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                    format: string;
                };
            }[];
            responses: {
                '200': {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                '401': {
                    description: string;
                };
                '403': {
                    description: string;
                };
                '404': {
                    description: string;
                };
            };
        };
        put: {
            tags: string[];
            summary: string;
            security: {
                bearerAuth: any[];
            }[];
            parameters: {
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                    format: string;
                };
            }[];
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            responses: {
                '200': {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                '400': {
                    description: string;
                };
                '401': {
                    description: string;
                };
                '403': {
                    description: string;
                };
                '404': {
                    description: string;
                };
            };
        };
        delete: {
            tags: string[];
            summary: string;
            security: {
                bearerAuth: any[];
            }[];
            parameters: {
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                    format: string;
                };
            }[];
            responses: {
                '204': {
                    description: string;
                };
                '400': {
                    description: string;
                };
                '401': {
                    description: string;
                };
                '403': {
                    description: string;
                };
                '404': {
                    description: string;
                };
            };
        };
    };
    '/auth/login': {
        post: {
            tags: string[];
            summary: string;
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            responses: {
                '200': {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                '401': {
                    description: string;
                };
            };
        };
    };
    '/auth/refresh-token': {
        post: {
            tags: string[];
            summary: string;
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            responses: {
                '200': {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                '401': {
                    description: string;
                };
            };
        };
    };
    '/auth/me': {
        get: {
            tags: string[];
            summary: string;
            security: {
                bearerAuth: any[];
            }[];
            responses: {
                '200': {
                    description: string;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                '401': {
                    description: string;
                };
            };
        };
    };
};
