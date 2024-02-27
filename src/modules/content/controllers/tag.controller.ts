import {
    UseInterceptors,
    Controller,
    Get,
    SerializeOptions,
    Query,
    ValidationPipe,
    Param,
    ParseUUIDPipe,
    Post,
    Body,
    Patch,
    Delete,
} from '@nestjs/common';

import { AppIntercepter } from '@/modules/core/providers';

import { QueryCategoryDto } from '../dtos/category.dto';
import { CreateTagDto, UpdateTagDto } from '../dtos/tag.dto';
import { TagService } from '../services';

// src/modules/content/controllers/tag.controller.ts
@UseInterceptors(AppIntercepter)
@Controller('tags')
export class TagController {
    constructor(protected service: TagService) {}

    @Get()
    @SerializeOptions({})
    async list(
        @Query(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
                validationError: { target: false },
            }),
        )
        options: QueryCategoryDto,
    ) {
        return this.service.paginate(options);
    }

    @Get(':id')
    @SerializeOptions({})
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id);
    }

    @Post()
    @SerializeOptions({})
    async store(
        @Body(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
                validationError: { target: false },
                groups: ['create'],
            }),
        )
        data: CreateTagDto,
    ) {
        return this.service.create(data);
    }

    @Patch()
    @SerializeOptions({})
    async update(
        @Body(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
                validationError: { target: false },
                groups: ['update'],
            }),
        )
        data: UpdateTagDto,
    ) {
        return this.service.update(data);
    }

    @Delete(':id')
    @SerializeOptions({})
    async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.delete(id);
    }
}
