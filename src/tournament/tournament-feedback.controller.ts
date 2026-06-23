import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { wrap } from '@mikro-orm/core';
import { TournamentFeedbackService } from './tournament-feedback.service';
import { TournamentService } from './tournament.service';
import { SubmitTournamentFeedbackDto } from './dto/submit-tournament-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsService } from '../auth/permissions.service';

@Controller('tournament-feedback')
export class TournamentFeedbackController {
  constructor(
    private readonly feedbackService: TournamentFeedbackService,
    private readonly tournamentService: TournamentService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('pending')
  async getPending(@Request() req: { user: { sub: string } }) {
    const tournaments = await this.feedbackService.getPendingForUser(
      req.user.sub,
    );
    return tournaments.map((t) => ({
      id: t.id,
      title: t.title,
      startDate: t.startDate,
      endDate: t.endDate ?? t.startDate,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async submit(
    @Body() data: SubmitTournamentFeedbackDto,
    @Request() req: { user: { sub: string } },
  ) {
    const feedback = await this.feedbackService.submitFeedback(
      req.user.sub,
      data,
    );
    return wrap(feedback).toJSON();
  }

  @UseGuards(JwtAuthGuard)
  @Get('tournament/:tournamentId/mine')
  async getMine(
    @Param('tournamentId') tournamentId: string,
    @Request() req: { user: { sub: string } },
  ) {
    const feedback = await this.feedbackService.getMyFeedback(
      tournamentId,
      req.user.sub,
    );
    if (!feedback) return null;
    return wrap(feedback).toJSON();
  }

  @UseGuards(JwtAuthGuard)
  @Get('tournament/:tournamentId')
  async getForTournament(
    @Param('tournamentId') tournamentId: string,
    @Request() req: { user: { sub: string; role: string } },
  ) {
    const tournament = await this.tournamentService.findById(tournamentId);

    if (
      !this.permissionsService.canUpdateTournament(req.user, {
        createdBy: { id: tournament.createdBy.id },
      })
    ) {
      throw new ForbiddenException(
        'You do not have permission to view tournament feedback',
      );
    }

    const { summary, items } =
      await this.feedbackService.getFeedbackForTournament(tournamentId);

    return {
      summary,
      items: items.map((item) => ({
        id: item.id,
        rating: item.rating,
        comment: item.comment,
        createdAt: item.createdAt,
        user: {
          id: item.user.id,
          firstName: item.user.firstName,
          lastName: item.user.lastName,
          email: item.user.email,
        },
      })),
    };
  }
}
