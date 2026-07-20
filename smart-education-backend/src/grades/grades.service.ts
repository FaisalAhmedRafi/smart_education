import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradesRepository: Repository<Grade>,
  ) {}

  create(dto: CreateGradeDto, recordedById: string): Promise<Grade> {
    const grade = this.gradesRepository.create({ ...dto, recordedById });
    return this.gradesRepository.save(grade);
  }

  findByStudent(studentId: string): Promise<Grade[]> {
    return this.gradesRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.gradesRepository.findOne({ where: { id } });
    if (!grade) {
      throw new NotFoundException(`Grade ${id} not found`);
    }
    return grade;
  }

  async update(id: string, dto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findOne(id);
    Object.assign(grade, dto);
    return this.gradesRepository.save(grade);
  }

  async remove(id: string): Promise<void> {
    const grade = await this.findOne(id);
    await this.gradesRepository.remove(grade);
  }
}
