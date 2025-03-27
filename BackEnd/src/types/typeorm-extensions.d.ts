// src/types/typeorm-extensions.d.ts

import { DeepPartial } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';

// Extend DeepPartial to allow string IDs for User relations
declare module 'typeorm' {
  interface DeepPartial<T> {
    createdBy?: User | string;
    updatedBy?: User | string;
  }
}