import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  // Marks attendance for every student listed, for one class on one date.
  // Re-marking the same student/date pair overwrites the previous record
  // (see the unique index on the entity).
  async markAttendance(
    dto: MarkAttendanceDto,
    markedById: string,
  ): Promise<Attendance[]> {
    const records = dto.entries.map((entry) => ({
      classRoomId: dto.classRoomId,
      date: dto.date,
      studentId: entry.studentId,
      status: entry.status,
      remarks: entry.remarks,
      markedById,
    }));

    // studentId + date is unique, so this overwrites same-day re-submissions
    await this.attendanceRepository.upsert(records, {
      conflictPaths: ['studentId', 'date'],
    });

    return this.findByClassAndDate(dto.classRoomId, dto.date);
  }

  findByClassAndDate(
    classRoomId: string,
    date: string,
  ): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { classRoomId, date },
      relations: ['student'],
    });
  }

  findByStudent(studentId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { studentId },
      order: { date: 'DESC' },
    });
  }
}
