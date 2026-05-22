import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/createCard.dto';
import { UpdateCardDto } from './dto/updateCard.dto';

@ApiTags('Cards')
@ApiBearerAuth()
@Controller('api/v1/cards')
export class CardsController {
    constructor(private cardService: CardsService) {}

    @ApiOperation({ summary: 'List cards' })
    @ApiResponse({
        status: 200,
        example: [{ id: '550e8400-e29b-41d4-a716-446655440030', card_uid: '04A1B2C3D4', is_active: true }],
    })
    @Get()
    getAllCards() {
        return this.cardService.getAllCards();
    }

    @ApiOperation({ summary: 'Create a card' })
    @ApiBody({ type: CreateCardDto })
    @ApiResponse({
        status: 201,
        example: {
            id: '550e8400-e29b-41d4-a716-446655440030',
            user_id: '550e8400-e29b-41d4-a716-446655440001',
            card_uid: '04A1B2C3D4',
            is_active: true,
        },
    })
    @Post()
    createCard(@Body() dto: CreateCardDto) {
        return this.cardService.createCard(dto);
    }

    @ApiOperation({ summary: 'Get a card by UID' })
    @ApiParam({ name: 'cardUid', example: '04A1B2C3D4' })
    @Get(':cardUid')
    retrieveCardByUid(@Param('cardUid') cardUid: string) {
        return this.cardService.getCardByUid(cardUid);
    }

    @ApiOperation({ summary: 'Get active card owner by card UID' })
    @ApiParam({ name: 'cardUid', example: '04A1B2C3D4' })
    @ApiResponse({ status: 200, example: { name: 'Jane', surname: 'Doe' } })
    @Get(':cardUid/user')
    getUserByCardUid(@Param('cardUid') cardUid: string) {
        return this.cardService.getUserByCardUid(cardUid);
    }

    @ApiOperation({ summary: 'Update a card by UID' })
    @ApiParam({ name: 'cardUid', example: '04A1B2C3D4' })
    @ApiBody({ type: UpdateCardDto })
    @Patch(':cardUid')
    updateCard(@Param('cardUid') cardUid: string, @Body() dto: UpdateCardDto) {
        return this.cardService.updateCard(cardUid, dto);
    }

    @ApiOperation({ summary: 'Delete a card by UID' })
    @ApiParam({ name: 'cardUid', example: '04A1B2C3D4' })
    @Delete(':cardUid')
    deleteCard(@Param('cardUid') cardUid: string) {
        return this.cardService.deleteCard(cardUid);
    }
}
