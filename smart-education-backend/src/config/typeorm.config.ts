import { DataSource, DataSourceOptions } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { ClassRoom } from '../classes/entities/class.entity';
import { Student } from '../students/entities/student.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Grade } from '../grades/entities/grade.entity';

loadEnv();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smart_education',
  entities: [User, ClassRoom, Student, Attendance, Grade],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // use migrations instead of auto-sync in real usage
};

export default new DataSource(typeOrmConfig);
