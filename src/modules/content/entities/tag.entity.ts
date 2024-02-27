import { Exclude, Expose } from 'class-transformer';
import { Entity, PrimaryColumn, Column, ManyToMany, Relation } from 'typeorm';

import { PostEntity } from './post.entity';

// src/modules/content/entities/tag.entity.ts
@Exclude()
@Entity('content_tags')
export class TagEntity {
    @Expose()
    @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
    id: string;

    @Expose()
    @Column({ comment: '标签名称', unique: true })
    name: string;

    @Expose()
    @Column({ comment: '标签描述', nullable: true })
    description?: string;

    /**
     * 通过queryBuilder生成的文章数量(虚拟字段)
     */
    @Expose()
    postCount: number;

    @ManyToMany(() => PostEntity, (post) => post.tags)
    posts: Relation<PostEntity[]>;
}
