import { Repository } from 'typeorm';

import { CustomRepository } from '@/modules/database/decorators';

import { PostEntity } from '../entities/post.entity';
import { TagEntity } from '../entities/tag.entity';

// src/modules/content/repositories/tag.repository.ts
@CustomRepository(TagEntity)
export class TagRepository extends Repository<TagEntity> {
    buildBaseQB() {
        return this.createQueryBuilder('tag')
            .leftJoinAndSelect('tag.posts', 'posts')
            .addSelect(
                (subQuery) => subQuery.select('COUNT(p.id)', 'count').from(PostEntity, 'p'),
                'postCount',
            )
            .orderBy('postCount', 'DESC')
            .loadRelationCountAndMap('tag.postCount', 'tag.posts');
    }
}
