import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Public self-signup. In most school-management setups an admin creates
  // teacher/student accounts instead (see UsersController), but this is here
  // if you want open registration too.
  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    return this.buildToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    return this.buildToken(user.id, user.email, user.role);
  }

  private buildToken(sub: string, email: string, role: string) {
    const accessToken = this.jwtService.sign({ sub, email, role });
    return { accessToken };
  }
}
