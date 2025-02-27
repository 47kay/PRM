import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Department } from './department.entity';
import { User } from '../../users/entities/user.entity';

export enum DepartmentAuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  MEMBER_ADDED = 'MEMBER_ADDED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  MEMBER_TRANSFERRED = 'MEMBER_TRANSFERRED',
  MANAGER_CHANGED = 'MANAGER_CHANGED',
  MOVED = 'MOVED',
  REORDERED = 'REORDERED'
}

@Entity('department_audit_logs')
export class DepartmentAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column('uuid')
  organizationId: string;

  @Column({
    type: 'enum',
    enum: DepartmentAuditAction
  })
  action: DepartmentAuditAction;

  @Column('jsonb', { nullable: true })
  changes: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('uuid')
  performedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performedById' })
  performedBy: User;

  @Column('inet', { nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  affectedUserId: string;

  

  @ManyToOne(() => User)
  @JoinColumn({ name: 'affectedUserId' })
  affectedUser: User;
}