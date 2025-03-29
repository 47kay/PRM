export const userPaths = {
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 10 }
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Return all users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/SimpleUserDto'
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - requires ADMIN role'
          }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Create new user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateUserDto'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SimpleUserDto'
                }
              }
            }
          },
          '400': {
            description: 'Bad Request - validation failed'
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - requires ADMIN role'
          }
        }
      }
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Returns user details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SimpleUserDto'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - requires ADMIN role'
          },
          '404': {
            description: 'User not found'
          }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Update user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateUserDto'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SimpleUserDto'
                }
              }
            }
          },
          '400': {
            description: 'Bad Request - validation failed'
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - requires ADMIN role'
          },
          '404': {
            description: 'User not found'
          }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '204': {
            description: 'User deleted successfully'
          },
          '400': {
            description: 'Bad Request - cannot delete last admin'
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - requires ADMIN role'
          },
          '404': {
            description: 'User not found'
          }
        }
      }
    }
  };