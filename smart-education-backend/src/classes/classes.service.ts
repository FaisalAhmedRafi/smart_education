import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassRoom } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassRoom)
    private readonly classesRepository: Repository<ClassRoom>,
  ) {}

  create(dto: CreateClassDto): Promise<ClassRoom> {
    const classRoom = this.classesRepository.create(dto);
    return this.classesRepository.save(classRoom);
  }

  findAll(): Promise<ClassRoom[]> {
    return this.classesRepository.find({ relations: ['classTeacher'] });
  }

  async findOne(id: string): Promise<ClassRoom> {
    const classRoom = await this.classesRepository.findOne({
      where: { id },
      relations: ['classTeacher'],
    });
    if (!classRoom) {
      throw new NotFoundException(`Class ${id} not found`);
    }
    return classRoom;
  }

  async update(id: string, dto: UpdateClassDto): Promise<ClassRoom> {
    const classRoom = await this.findOne(id);
    Object.assign(classRoom, dto);
    return this.classesRepository.save(classRoom);
  }

  async remove(id: string): Promise<void> {
    const classRoom = await this.findOne(id);
    await this.classesRepository.remove(classRoom);
  }
}
