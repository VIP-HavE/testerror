import { SetMetadata } from '@nestjs/common';
import { ObjectType } from 'typeorm';

import { CUSTOM_REPOSITORY_METADATA } from '../constants';

// src/modules/database/decorators/repository.decorator.ts
export const CustomRepository = <T>(entity: ObjectType<T>): ClassDecorator =>
    SetMetadata(CUSTOM_REPOSITORY_METADATA, entity);
