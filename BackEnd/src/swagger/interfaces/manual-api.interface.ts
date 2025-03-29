import { OpenAPIObject } from '@nestjs/swagger';

export interface ManualOpenAPIObject extends Omit<OpenAPIObject, 'paths'> {
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
}