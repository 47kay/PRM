// src/modules/messages/entities/template-category.entity.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
  } from 'typeorm';
  import { MessageTemplate } from './message-template.entity';

  
  @Entity('template_categories')
  export class TemplateCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;
  
    @Column({ nullable: true })
    description: string;
  
    @Column()
    organizationId: string;
  
    @OneToMany(() => MessageTemplate, template => template.category)
    templates: MessageTemplate[];
  
    @Column({ nullable: true })
    createdById: string;
  
    @Column({ nullable: true })
    updatedById: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
  }