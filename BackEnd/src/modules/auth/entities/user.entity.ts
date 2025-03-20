// src/modules/auth/entities/user.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    BeforeInsert,
    BeforeUpdate
  } from 'typeorm';
  import { Exclude } from 'class-transformer';
  import { Organization } from '../../organizations/entities/organization.entity';
  import { Role } from '../../users/enums/role.enum';
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 50 })
    firstName: string;
  
    @Column({ length: 50 })
    lastName: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    @Exclude()
    password: string;
  
    @Column({ nullable: true })
    phone?: string;
  
    @Column({ 
      type: 'enum',
      enum: Role,
      default: Role.STAFF
    })
    role: Role;
  
    @Column({ type: 'simple-array', nullable: true })
    permissions: string[];
  
    @Column({ default: false })
    isEmailVerified: boolean;
  
    @Column({ default: true })
    isActive: boolean;
  
    @Column({ nullable: true })
    lastLoginAt: Date;
  
    @ManyToOne(() => Organization, { nullable: false })
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;
  
    @Column({ name: 'organization_id' })
    organizationId: string;
  
    @Column({ nullable: true })
    createdBy?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @Column({ nullable: true })
    updatedBy?: string;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column({ nullable: true })
    refreshToken?: string;
  
    @Column({ nullable: true, type: 'timestamp' })
    refreshTokenExpiresAt?: Date;
  
    @Column({ nullable: true })
    passwordResetToken?: string;
  
    @Column({ nullable: true, type: 'timestamp' })
    passwordResetExpiresAt?: Date;
  
    // Virtual property for full name
    get fullName(): string {
      return `${this.firstName} ${this.lastName}`;
    }
  
    @BeforeInsert()
    @BeforeUpdate()
    normalizeEmail() {
      if (this.email) {
        this.email = this.email.toLowerCase().trim();
      }
    }
  }