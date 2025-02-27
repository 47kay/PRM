import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 0, name: 'display_order' })
displayOrder: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('uuid')
  organizationId: string;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => Organization, organization => organization.departments)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column('uuid', { nullable: true })
  managerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'managerId' })
  manager: User;

  @Column('uuid', { nullable: true })
  parentDepartmentId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'parentDepartmentId' })
  parentDepartment: Department;

  @OneToMany(() => Department, department => department.parentDepartment)
  childDepartments: Department[];

  @ManyToMany(() => User, user => user.department)
  @JoinTable({
    name: 'department_members',
    joinColumn: {
      name: 'departmentId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id'
    }
  })
  members: User[];

  @OneToMany(() => Ticket, ticket => ticket.department)
  tickets: Ticket[];

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: 0 })
  memberCount: number;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  workingHours: string;

  @Column({ nullable: true })
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column('uuid', { nullable: true })
  updatedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;
}