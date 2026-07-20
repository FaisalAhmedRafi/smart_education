import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ClassRoom } from '../../classes/entities/class.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ type: 'date', nullable: true })
  dob: string;

  @Column({ nullable: true })
  gender: string;

  @Column()
  rollNumber: string;

  @Column({ nullable: true })
  guardianName: string;

  @Column({ nullable: true })
  guardianPhone: string;

  @Column({ nullable: true })
  address: string;

  @ManyToOne(() => ClassRoom, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'classRoomId' })
  classRoom: ClassRoom;

  @Column({ nullable: true })
  classRoomId: string;

  // optional: link to a login account if the student has portal access
  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
