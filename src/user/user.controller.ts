import { UserInfo } from 'src/common.utils/userInfo.decorator';

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { LoginDto } from './dto/login.dto';
import { PaymentMethodDto } from './dto/paymentMethod.dto.';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.userService.register(
      registerDto.account_id,
      registerDto.password,
      registerDto.confirmed_password,
      registerDto.nickname,
      registerDto.admin_number,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto.account_id, loginDto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async profile(@UserInfo() user: User) {
    // 인증된 사용자 정보 로드함
    return await this.userService.profile(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('registerPayment')
  async registerPayment(
    @UserInfo() user: User,
    @Body() paymentMethodDto: PaymentMethodDto,
  ) {
    return await this.userService.registerPayment(
      user,
      paymentMethodDto.card_number,
      paymentMethodDto.expiration_date,
      paymentMethodDto.cvv,
    );
  }
}
