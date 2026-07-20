import { IsEnum, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { ExamType } from '../entities/grade.entity';

export class CreateGradeDto {
  @IsUUID()
  studentId: string;

  @IsNotEmpty()
  subject: string;

  @IsEnum(ExamType)
  examType: ExamType;

  @IsNumber()
  @Min(0)
  marksObtained: number;

  @IsNumber()
  @Min(0)
  totalMarks: number;

  @IsNotEmpty()
  term: string;
}
