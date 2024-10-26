import { Body, Controller, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PostCategoryDto } from './dto/postCategory.dto';
import { PostConcertDto } from './dto/postConcert.dto'; // 철자 수정
import { PostSeatDto } from './dto/postSeat.dto';
import { PostClassDto } from './dto/postClass.dto';
import { PostHallReservationDto } from './dto/postHallReservation.dto';

import { AdminService } from './admin.service';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Role } from 'src/user/types/userRole.type';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', [Role.Admin])
  @Post('postCategory')
  async postCategory(@Body() postCategoryDto: PostCategoryDto) {
    return await this.adminService.postCategory(
      postCategoryDto.name,
      postCategoryDto.description,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', [Role.Admin])
  @Post('postConcert')
  async postConcert(@Body() postConcertDto: PostConcertDto) {
    return await this.adminService.postConcert(
      postConcertDto.name,
      postConcertDto.description,
      postConcertDto.image,
      postConcertDto.category_id,
      postConcertDto.date,
      postConcertDto.venue_id,
      postConcertDto.hall_name,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', [Role.Admin])
  @Post('postConcert')
  async postHallreservation(
    @Body() postHallreservationDto: PostHallReservationDto,
  ) {
    return await this.adminService.postHallreservation(
      postHallreservationDto.hall_id,
      postHallreservationDto.schedule_id,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', [Role.Admin])
  @Post('postSeat')
  async postSeat(@Body() postSeatDto: PostSeatDto) {
    return await this.adminService.postSeat(
      postSeatDto.hall_reservation_id,
      postSeatDto.class_id,
      postSeatDto.concert_id,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @SetMetadata('roles', [Role.Admin])
  @Post('postClass')
  async postClass(@Body() postClassDto: PostClassDto) {
    return await this.adminService.postClass(
      postClassDto.concert_id,
      postClassDto.price_by_grade,
    );
  }
}
