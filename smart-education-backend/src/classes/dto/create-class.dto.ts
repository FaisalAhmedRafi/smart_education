import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  section?: string;

  @IsNotEmpty()
  academicYear: string;

  @IsOptional()
  @IsUUID()
  classTeacherId?: string;
}
