import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  create(dto: CreateStudentDto): Promise<Student> {
    const student = this.studentsRepository.create(dto);
    return this.studentsRepository.save(student);
  }

  findAll(classRoomId?: string): Promise<Student[]> {
    return this.studentsRepository.find({
      where: classRoomId ? { classRoomId } : {},
      relations: ['classRoom'],
    });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['classRoom'],
    });
    if (!student) {
      throw new NotFoundException(`Student ${id} not found`);
    }
    return student;
  }

  findByUserId(userId: string): Promise<Student | null> {
    return this.studentsRepository.findOne({
      where: { userId },
      relations: ['classRoom'],
    });
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, dto);
    return this.studentsRepository.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentsRepository.remove(student);
  }
}
