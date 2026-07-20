import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AttendanceStatus } from '../entities/attendance.entity';

class StudentAttendanceEntry {
  @IsUUID()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  remarks?: string;
}

// Marks attendance for an entire class in one call, e.g.
// { classRoomId, date, entries: [{ studentId, status }, ...] }
export class MarkAttendanceDto {
  @IsUUID()
  classRoomId: string;

  @IsDateString()
  date: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceEntry)
  entries: StudentAttendanceEntry[];
}
