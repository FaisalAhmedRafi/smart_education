import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  mark(
    @Body() dto: MarkAttendanceDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.attendanceService.markAttendance(dto, user.id);
  }

  @Get('class/:classRoomId')
  @Roles(Role.ADMIN, Role.TEACHER)
  findByClassAndDate(
    @Param('classRoomId') classRoomId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.findByClassAndDate(classRoomId, date);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.attendanceService.findByStudent(studentId);
  }
}
