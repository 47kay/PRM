export const authPaths = {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login to the system',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginDto'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponseDto'
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials'
          }
        }
      }
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RefreshTokenDto'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponseDto'
                }
              }
            }
          },
          '401': {
            description: 'Invalid refresh token'
          }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user information',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user information',
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
          }
        }
      }
    }
  };