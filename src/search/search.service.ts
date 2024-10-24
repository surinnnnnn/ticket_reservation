import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class SearchService {
  constructor(private adminService: AdminService) {}

  /** 공연 목록 조회 함수
   *
   */
  async searchConcerts() {}
}
