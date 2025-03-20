import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  content: string; // Add this line
  type: string; // Add this line

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column('text')
  htmlContent: string;

  @Column('text', { nullable: true })
  textContent: string;

  @Column('jsonb', { nullable: true })
  variables: Record<string, string>;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}