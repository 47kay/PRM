export const authSchemas = {
    LoginDto: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', format: 'password' }
      },
      required: ['email', 'password']
    },
    AuthResponseDto: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: { $ref: '#/components/schemas/SimpleUserDto' }
      }
    },
    RefreshTokenDto: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' }
      },
      required: ['refreshToken']
    }
  };