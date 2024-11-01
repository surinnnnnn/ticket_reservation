import { Request } from 'express';
import { EntityManager } from 'typeorm';

declare module 'express' {
  export interface Request {
    entityManager?: EntityManager;
  }
}
