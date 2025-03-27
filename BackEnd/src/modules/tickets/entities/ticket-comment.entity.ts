import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from '../../users/entities/user.entity';
import { TicketAttachment } from './ticket-attachment.entity';

@Entity('ticket_comments')
export class TicketComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  organizationId: string;
  userId: string;
  
  @Column('text')
  content: string;
  
  @Column({ default: false })
  isInternal: boolean;
  
  @Column('uuid')
  ticketId: string;
  
  @ManyToOne(() => Ticket, ticket => ticket.comments)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;
  
  @Column('uuid')
  authorId: string;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;
  
  @OneToMany(() => TicketAttachment, attachment => attachment.comment)
  attachments: TicketAttachment[];
  
  @Column({ nullable: true })
  parentId: string;
  
  // Self-referencing relationships can also use string names
  @ManyToOne('TicketComment', { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: TicketComment;
  
  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
  
  @Column({ nullable: true })
  editedAt: Date;
  
  @Column({ nullable: true })
  editedBy: string;
}