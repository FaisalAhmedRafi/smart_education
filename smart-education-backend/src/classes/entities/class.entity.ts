import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('classes')
export class ClassRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // e.g. "Grade 10"
  @Column()
  name: string;

  // e.g. "A"
  @Column({ nullable: true })
  section: string;

  // e.g. "2026"
  @Column()
  academicYear: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'classTeacherId' })
  classTeacher: User;

  @Column({ nullable: true })
  classTeacherId: string;

  @CreateDateColumn()
  createdAt: Date;
}
