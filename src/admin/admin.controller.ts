import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PostCategoryDto } from './dto/postCategory.dto';
import { PostConcertDto } from './dto/postConcert.dto'; // 철자 수정
import { PostSeatDto } from './dto/postSeat.dto';
import { PostClassDto } from './dto/postClass.dto';

import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('postCategory')
  async postCategory(@Body() postCategoryDto: PostCategoryDto) {
    return await this.adminService.postCategory(
      postCategoryDto.name,
      postCategoryDto.description,
    );
  }

  @UseGuards(AuthGuard('jwt'))
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

  //   @UseGuards(AuthGuard('jwt'))
  //   @Post('postSeat')
  //   async postSeat(@Body() postSeatDto: PostSeatDto) {
  //     return await this.adminService.postSeat(
  //       postSeatDto.hall_id,
  //       postSeatDto.capacity,
  //       postSeatDto.capacity_group_by_grade,
  //     );
  //   }

  //   @UseGuards(AuthGuard('jwt'))
  //   @Post('postClass')
  //   async postClass(@Body() postClassDto: PostClassDto) {
  //     return await this.adminService.postClass(
  //       postClassDto.concert_id,
  //       postClassDto.price_by_grade,
  //     );
  //   }
}
