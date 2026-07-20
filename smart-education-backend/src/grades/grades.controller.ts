import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StudentsService } from '../students/students.service';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(
    private readonly gradesService: GradesService,
    private readonly studentsService: StudentsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(
    @Body() dto: CreateGradeDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.gradesService.create(dto, user.id);
  }

  @Get('student/:studentId')
  async findByStudent(
    @Param('studentId') studentId: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    if (user.role === Role.STUDENT) {
      const ownRecord = await this.studentsService.findByUserId(user.id);
      if (!ownRecord || ownRecord.id !== studentId) {
        throw new ForbiddenException('You can only view your own grades');
      }
    }
    return this.gradesService.findByStudent(studentId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  update(@Param('id') id: string, @Body() dto: UpdateGradeDto) {
    return this.gradesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.gradesService.remove(id);
  }
}
