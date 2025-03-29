import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('departments')
export class Department {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column()
    organizationId: string;

    @ApiProperty()
    @Column({ nullable: true })
    description?: string;

    @ApiProperty()
    @Column({ nullable: true })
    parentDepartmentId?: string;

    @ApiProperty()
    @Column({ nullable: true })
    managerId?: string;

    @ApiProperty()
    @Column({ nullable: true })
    createdById?: string;

    @ApiProperty()
    @Column({ nullable: true })
    updatedById?: string;

    @ApiProperty()
    @Column({ default: true })
    isActive: boolean;

    @ApiProperty()
    @Column({ type: 'int', default: 0 })
    memberCount: number;

    @ApiProperty()
    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    @ApiProperty()
    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    // Relations
    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    @ManyToOne(() => Department, { nullable: true })
    @JoinColumn({ name: 'parentDepartmentId' })
    parentDepartment?: Department;

    @OneToMany(() => Department, dept => dept.parentDepartment)
    childDepartments: Department[];

    @ManyToOne(() => User, { lazy: true })
    @JoinColumn({ name: 'managerId' })
    manager: Promise<User>;

    @ManyToOne(() => User, { lazy: true })
    @JoinColumn({ name: 'createdById' })
    createdBy: Promise<User>;

    @ManyToOne(() => User, { lazy: true })
    @JoinColumn({ name: 'updatedById' })
    updatedBy: Promise<User>;

    @OneToMany(() => Ticket, ticket => ticket.department)
    tickets: Promise<Ticket[]>;
}