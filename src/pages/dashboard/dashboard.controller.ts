import {
  Controller,
  Get,
  Logger,
  UseGuards,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { PASSPORT_ADMIN_TOKEN_TYPE } from 'src/core/global-variables';
import { AuthGuard } from '@nestjs/passport';
import { GetAdmin } from 'src/decorator/get-admin.decorator';
import { Admin } from 'src/interfaces/admin/admin.interface';

@Controller('dashboard')
export class DashboardController {
  private logger = new Logger(DashboardController.name);

  constructor(private dashboardService: DashboardService) {}

  @Version(VERSION_NEUTRAL)
  @Get('/sale-dashboard')
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  @UseGuards(AdminJwtAuthGuard)
  async getSalesDashboard(@GetAdmin() admin: Admin): Promise<ResponsePayload> {
    return await this.dashboardService.getSalesDashboard(admin);
  }
}
