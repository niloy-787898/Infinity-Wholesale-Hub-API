import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { AdminMetaRoles } from '../../decorator/admin-roles.decorator';
import { AdminRoles } from '../../enum/admin-roles.enum';
import { AdminRolesGuard } from '../../guards/admin-roles.guard';
import { AdminJwtAuthGuard } from '../../guards/admin-jwt-auth.guard';
import {
  AddSalesDto,
  FilterAndPaginationSalesDto,
  OptionSalesDto,
  UpdateSalesDto,
} from '../../dto/sales.dto';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { MongoIdValidationPipe } from '../../pipes/mongo-id-validation.pipe';
import { GetAdmin } from 'src/decorator/get-admin.decorator';
import { Admin } from 'src/interfaces/admin/admin.interface';
import { PASSPORT_ADMIN_TOKEN_TYPE } from 'src/core/global-variables';
import { AuthGuard } from '@nestjs/passport';
import { PreOrderService } from './pre-order.service';

@Controller('pre-order')
export class PreorderController {
  private logger = new Logger(PreorderController.name);

  constructor(private preorderService: PreOrderService) {}

  /**
   * ADD DATA
   * addSales()
   * insertManySales()
   */
  @Post('/add')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async addSales(
    @Body()
    addSalesDto: AddSalesDto,
    @GetAdmin() admin: Admin,
  ): Promise<ResponsePayload> {
    return await this.preorderService.addSales(addSalesDto, admin);
  }

  /**
   * GET DATA
   * getAllSales()
   * getSalesById()
   * getUserSalesById()
   */
  @Version(VERSION_NEUTRAL)
  @Post('/get-all')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getAllSales(
    @Body() filterSalesDto: FilterAndPaginationSalesDto,
    @Query('q') searchString: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return this.preorderService.getAllSales(filterSalesDto, searchString);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/get-by-sales')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getSalesByDate(
    @Query('date') date: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return this.preorderService.getSalesByDate(date);
  }

  @Version(VERSION_NEUTRAL)
  @Get('/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AuthGuard(PASSPORT_ADMIN_TOKEN_TYPE))
  async getSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return await this.preorderService.getSalesById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-customer-sales/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  async getCustomerSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return await this.preorderService.getCustomerSalesById(id, select);
  }

  @Version(VERSION_NEUTRAL)
  @Get('get-salesman-sales/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async getSalesmanSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query() select: string,
    @GetAdmin() salesman: Admin,
  ): Promise<ResponsePayload> {
    return await this.preorderService.getSalesmanSalesById(id, select);
  }

  /**
   * UPDATE DATA
   * updateSalesById()
   * updateMultipleSalesById()
   */
  @Version(VERSION_NEUTRAL)
  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() updateSalesDto: UpdateSalesDto,
  ): Promise<ResponsePayload> {
    return await this.preorderService.updateSalesById(id, updateSalesDto);
  }

  @Version(VERSION_NEUTRAL)
  @Put('/update-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async updateMultipleSalesById(
    @Body() updateSalesDto: UpdateSalesDto,
  ): Promise<ResponsePayload> {
    return await this.preorderService.updateMultipleSalesById(
      updateSalesDto.ids,
      updateSalesDto,
    );
  }

  /**
   * DELETE DATA
   * deleteSalesById()
   * deleteMultipleSalesById()
   */
  @Version(VERSION_NEUTRAL)
  @Delete('/delete/:id')
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteSalesById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.preorderService.deleteSalesById(id, Boolean(checkUsage));
  }

  @Version(VERSION_NEUTRAL)
  @Post('/delete-multiple')
  @UsePipes(ValidationPipe)
  @AdminMetaRoles(AdminRoles.SUPER_ADMIN, AdminRoles.SALESMAN)
  @UseGuards(AdminRolesGuard)
  @UseGuards(AdminJwtAuthGuard)
  async deleteMultipleSalesById(
    @Body() data: { ids: string[] },
    @Query('checkUsage') checkUsage: boolean,
  ): Promise<ResponsePayload> {
    return await this.preorderService.deleteMultipleSalesById(
      data.ids,
      Boolean(checkUsage),
    );
  }
}
