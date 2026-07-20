import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  gender?: string;

  @IsNotEmpty()
  rollNumber: string;

  @IsOptional()
  guardianName?: string;

  @IsOptional()
  guardianPhone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  @IsUUID()
  classRoomId?: string;

  // link to an existing user account (student portal login), if any
  @IsOptional()
  @IsUUID()
  userId?: string;
}
