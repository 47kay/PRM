// src/modules/voip/entities/call-log.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('call_logs')
export class CallLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  callUuid: string;

  @Column()
  callerNumber: string;

  @Column()
  destinationNumber: string;

  @Column({ nullable: true })
  provider: string;

  @Column()
  status: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  answerTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  hangupCause: string;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column({ nullable: true })
  callDirection: string;

  @Column({ nullable: true })
  appointmentId: number;

  @Column({ nullable: true })
  contactId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}