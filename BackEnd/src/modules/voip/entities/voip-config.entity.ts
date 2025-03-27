// src/modules/voip/entities/voip-config.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('voip_configs')
export class VoipConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'default' })
  name: string;

  @Column({ default: 'freeswitch' })
  provider: string;

  @Column({ default: '127.0.0.1' })
  host: string;

  @Column({ default: 8021 })
  port: number;

  @Column({ default: 'ClueCon' })
  password: string;

  @Column({ type: 'text', nullable: true })
  configJson: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}