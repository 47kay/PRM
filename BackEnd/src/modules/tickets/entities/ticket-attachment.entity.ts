import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from './ticket.entity';
import { TicketComment } from './ticket-comment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ticket_attachments')
export class TicketAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column()
  storageKey: string;

  @Column({ nullable: true })
  description: string;

  @Column('uuid')
  ticketId: string;

  @ManyToOne(() => Ticket, ticket => ticket.attachments)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column('uuid', { nullable: true })
  commentId: string;

  @ManyToOne(() => TicketComment, comment => comment.attachments, { nullable: true })
  @JoinColumn({ name: 'commentId' })
  comment: TicketComment;

  @Column('uuid')
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ default: true })
  isActive: boolean;
}