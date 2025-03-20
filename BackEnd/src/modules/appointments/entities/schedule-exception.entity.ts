import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn, 
    CreateDateColumn, 
    UpdateDateColumn 
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  import { Organization } from '../../organizations/entities/organization.entity';
  
  /**
   * Entity for doctor's schedule exceptions (time off, vacations, etc.)
   */
  @Entity('schedule_exceptions')
  export class ScheduleException {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'uuid' })
    doctorId: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'doctor_id' })
    doctor: User;
  
    @Column({ type: 'uuid' })
    organizationId: string;
  
    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;
  
    @Column({ type: 'date' })
    startDate: Date;
  
    @Column({ type: 'date' })
    endDate: Date;
  
    @Column({ type: 'time', nullable: true })
    startTime: Date | null;
  
    @Column({ type: 'time', nullable: true })
    endTime: Date | null;
  
    @Column({ type: 'boolean', default: false })
    isFullDay: boolean;
  
    @Column({ type: 'enum', enum: ['VACATION', 'SICK_LEAVE', 'CONFERENCE', 'PERSONAL', 'OTHER'], default: 'OTHER' })
    type: string;
  
    @Column({ type: 'text', nullable: true })
    reason: string;
  
    @Column({ type: 'uuid', nullable: true })
    createdBy: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    creator: User;
  
    @Column({ type: 'uuid', nullable: true })
    updatedBy: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'updated_by' })
    updater: User;
  
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
  
    /**
     * Check if a given datetime falls within the exception
     */
    isDateTimeInException(dateTime: Date): boolean {
      // Create date objects without time for date comparisons
      const exceptionStartDate = new Date(this.startDate);
      exceptionStartDate.setHours(0, 0, 0, 0);
      
      const exceptionEndDate = new Date(this.endDate);
      exceptionEndDate.setHours(23, 59, 59, 999);
      
      const testDate = new Date(dateTime);
      
      // First check if the date is within the exception date range
      if (testDate < exceptionStartDate || testDate > exceptionEndDate) {
        return false;
      }
      
      // If it's a full day exception, the datetime is in the exception
      if (this.isFullDay) {
        return true;
      }
      
      // If not a full day, check time range
      // Only if we have start and end times
      if (this.startTime && this.endTime) {
        const exceptionStartDateTime = new Date(testDate);
        exceptionStartDateTime.setHours(
          this.startTime.getHours(),
          this.startTime.getMinutes(),
          this.startTime.getSeconds()
        );
        
        const exceptionEndDateTime = new Date(testDate);
        exceptionEndDateTime.setHours(
          this.endTime.getHours(),
          this.endTime.getMinutes(),
          this.endTime.getSeconds()
        );
        
        return testDate >= exceptionStartDateTime && testDate <= exceptionEndDateTime;
      }
      
      // If we don't have specific times, it affects the whole day
      return true;
    }
  }