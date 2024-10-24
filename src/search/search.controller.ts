import { Body, Controller, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('searchConcerts')
  async searchConcerts() {
    return await this.searchService.searchConcerts();
  }
}
