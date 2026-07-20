import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

export enum ExamType {
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  MIDTERM = 'midterm',
  FINAL = 'final',
}

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  @Column()
  subject: string;

  @Column({ type: 'enum', enum: ExamType })
  examType: ExamType;

  @Column({ type: 'float' })
  marksObtained: number;

  @Column({ type: 'float' })
  totalMarks: number;

  @Column()
  term: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recordedById' })
  recordedBy: User;

  @Column({ nullable: true })
  recordedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
