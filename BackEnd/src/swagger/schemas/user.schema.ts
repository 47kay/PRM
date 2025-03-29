export const userSchemas = {
    SimpleUserDto: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { 
          type: 'string',
          enum: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'STAFF'] 
        },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    },
    CreateUserDto: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        password: { type: 'string', format: 'password' },
        role: { 
          type: 'string',
          enum: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'STAFF'] 
        }
      },
      required: ['email', 'firstName', 'lastName', 'password', 'role']
    },
    UpdateUserDto: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { 
          type: 'string',
          enum: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'STAFF'] 
        },
        isActive: { type: 'boolean' }
      }
    }
  };