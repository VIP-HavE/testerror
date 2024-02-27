import { pick, unset } from 'lodash';
import { TreeRepository, FindTreeOptions, FindOptionsUtils, TreeRepositoryUtils } from 'typeorm';

import { CustomRepository } from '@/modules/database/decorators';

import { CategoryEntity } from '../entities/category.entity';

// src/modules/content/repositories/category.repository.ts
@CustomRepository(CategoryEntity)
export class CategoryRepository extends TreeRepository<CategoryEntity> {
    /**
     * 构建基础查询器
     */
    buildBaseQB() {
        return this.createQueryBuilder('category').leftJoinAndSelect('category.parent', 'parent');
    }

    /**
     * 树形结构查询
     * @param options
     */
    async findTrees(options?: FindTreeOptions) {
        const roots = await this.findRoots(options);
        await Promise.all(roots.map((root) => this.findDescendantsTree(root, options)));
        return roots;
    }

    /**
     * 查询顶级分类
     * @param options
     */
    findRoots(options?: FindTreeOptions) {
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);

        const joinColumn = this.metadata.treeParentRelation!.joinColumns[0];
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;
        const qb = this.buildBaseQB().orderBy('category.customOrder', 'ASC');
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        return qb
            .where(`${escapeAlias('category')}.${escapeColumn(parentPropertyName)} IS NULL`)
            .getMany();
    }

    /**
     * 查询后代分类
     * @param entity
     * @param options
     */
    findDescendants(entity: CategoryEntity, options?: FindTreeOptions) {
        const qb = this.createDescendantsQueryBuilder('category', 'treeClosure', entity);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        qb.orderBy('category.customOrder', 'ASC');
        return qb.getMany();
    }

    /**
     * 查询祖先分类
     * @param entity
     * @param options
     */
    findAncestors(entity: CategoryEntity, options?: FindTreeOptions) {
        const qb = this.createAncestorsQueryBuilder('category', 'treeClosure', entity);
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);
        qb.orderBy('category.customOrder', 'ASC');
        return qb.getMany();
    }

    /**
     * 查询后代树
     * @param entity
     * @param options
     */
    async findDescendantsTree(entity: CategoryEntity, options?: FindTreeOptions) {
        const qb = this.createDescendantsQueryBuilder('category', 'treeClosure', entity)
            .leftJoinAndSelect('category.parent', 'parent')
            .orderBy('category.customOrder', 'ASC');
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, pick(options, ['relations', 'depth']));
        const entities = await qb.getRawAndEntities();
        const relationMaps = TreeRepositoryUtils.createRelationMaps(
            this.manager,
            this.metadata,
            'category',
            entities.raw,
        );
        TreeRepositoryUtils.buildChildrenEntityTree(
            this.metadata,
            entity,
            entities.entities,
            relationMaps,
            {
                depth: -1,
                ...pick(options, ['relations']),
            },
        );

        return entity;
    }

    /**
     * 查询祖先树
     * @param entity
     * @param options
     */
    async findAncestorsTree(entity: CategoryEntity, options?: FindTreeOptions) {
        const qb = this.createAncestorsQueryBuilder('category', 'treeClosure', entity)
            .leftJoinAndSelect('category.parent', 'parent')
            .orderBy('category.customOrder', 'ASC');
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, options);

        const entities = await qb.getRawAndEntities();
        const relationMaps = TreeRepositoryUtils.createRelationMaps(
            this.manager,
            this.metadata,
            'category',
            entities.raw,
        );
        TreeRepositoryUtils.buildParentEntityTree(
            this.metadata,
            entity,
            entities.entities,
            relationMaps,
        );
        return entity;
    }

    /**
     * 统计后代元素数量
     * @param entity
     */
    async countDescendants(entity: CategoryEntity) {
        const qb = this.createDescendantsQueryBuilder('category', 'treeClosure', entity);
        return qb.getCount();
    }

    /**
     * 统计祖先元素数量
     * @param entity
     */
    async countAncestors(entity: CategoryEntity) {
        const qb = this.createAncestorsQueryBuilder('category', 'treeClosure', entity);
        return qb.getCount();
    }

    /**
     * 打平并展开树
     * @param trees
     * @param depth
     * @param parent
     */
    async toFlatTrees(trees: CategoryEntity[], depth = 0, parent: CategoryEntity | null = null) {
        const data: Omit<CategoryEntity, 'children'>[] = [];
        for (const item of trees) {
            item.depth = depth;
            item.parent = parent;
            const { children } = item;
            unset(item, 'children');
            data.push(item);
            data.push(...(await this.toFlatTrees(children, depth + 1, item)));
        }
        return data as CategoryEntity[];
    }
}
