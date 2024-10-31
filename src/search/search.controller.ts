import { Body, Controller, Get, Query } from '@nestjs/common';

import { SearchService } from './search.service';

import { GetDetailsDto } from './dto/searchDetails.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('getConcerts')
  async getConcerts() {
    return await this.searchService.getConcerts();
  }

  @Get('getConcertsBycategory')
  async getConcertsBycategory() {
    return await this.searchService.getConcertsBycategory();
  }

  @Get('searchConcert')
  async searchConcert(@Query() getDetailsDto: GetDetailsDto) {
    return await this.searchService.searchConcert(getDetailsDto.concert_name);
  }

  @Get('searchConcertDetails')
  async searchConcertDetails(@Query() getDetailsDto: GetDetailsDto) {
    return await this.searchService.searchConcertDetails(
      getDetailsDto.concert_name,
    );
  }
}
