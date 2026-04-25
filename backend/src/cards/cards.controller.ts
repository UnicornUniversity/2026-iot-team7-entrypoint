import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('api/v1/cards')
export class CardsController {
    constructor(private cardService: CardsService) {}

    @Post()
    createCard(
        @Body('cardUid')cardUid: string,
        @Body('userId') userId: string,
        @Body('isActive') isActive: boolean
    ) {
        return this.cardService.createCard(cardUid, userId, isActive);
    }

    @Get(':cardUid')
    retrieveCardByUid(@Param('cardUid') cardUid: string) {
        return this.cardService.getCardByUid(cardUid);
    }

    @Get(':cardUid/user')
    getUserByCardUid(@Param('cardUid') cardUid: string) {
        return this.cardService.getUserByCardUid(cardUid);
    }
}
