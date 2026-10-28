
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse, } from '@nestjs/swagger';
import { CasesService } from './cases.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/claims.enums.js';
import { CreateCaseDto } from '../dto/cases.dto.js';
import { ClaimPreviewDto } from '../dto/claim-preview.dto.js';
import { DischargeDto } from '../dto/discharge.dto.js';
import type { AuthenticatedRequest } from '../interfaces/auth.interface.js';
import { AuthGuard } from '../common/guards/auth.guard.js';

@ApiTags('cases')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('/api/v1/cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post('/create')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Create a treatment case' })
  @ApiCreatedResponse({
    description: 'Treatment case and pre-authorization created',
  })
  @ApiBadRequestResponse({
    description: 'Coverage is missing, inactive, or insufficient',
  })
  @ApiConflictResponse({
    description: 'An active case already exists for this appointment',
  })
  @ApiNotFoundResponse({ description: 'Health package not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Only doctors can create cases' })
  async create_case(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCaseDto,
  ) {
    return this.casesService.create_case_service(req.user!, dto);
  }

  @Get('/me')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get the current patient’s cases' })
  @ApiOkResponse({ description: 'Patient cases retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Only patients can access this endpoint' })
  async get_my_case(@Req() req: AuthenticatedRequest) {
    return this.casesService.get_my_case_service(req.user!.id);
  }

  @Get('/doctor')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Get cases assigned to the current doctor' })
  @ApiOkResponse({ description: 'Doctor cases retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Only doctors can access this endpoint' })
  async get_doctor_case(@Req() req: AuthenticatedRequest) {
    return this.casesService.get_doctor_case_service(req.user!.id);
  }

  @Get('/:id/claim-preview')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Preview the claim payment split' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Treatment case ID',
  })
  @ApiQuery({
    name: 'finalBill',
    type: Number,
    required: true,
    description: 'Final hospital bill amount',
    example: 65000,
  })
  @ApiQuery({
    name: 'nonPayable',
    type: Number,
    required: false,
    description: 'Non-payable portion of the bill',
    example: 5000,
  })
  @ApiOkResponse({ description: 'Claim preview calculated successfully' })
  @ApiBadRequestResponse({
    description: 'Case status, pre-authorization, or bill amount is invalid',
  })
  @ApiNotFoundResponse({
    description: 'Case or pre-authorization not found',
  })
  @ApiForbiddenResponse({
    description: 'Case belongs to another doctor',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async preview(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Query() q: ClaimPreviewDto,
  ) {
    return this.casesService.preview_service(
      req.user!,
      id,
      q.finalBill,
      q.nonPayable ?? 0,
    );
  }

  @Post('/:id/discharge')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Discharge a patient and create a claim' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Treatment case ID',
  })
  @ApiCreatedResponse({
    description: 'Claim created and case discharged successfully',
  })
  @ApiBadRequestResponse({
    description: 'Case status, pre-authorization, or bill amount is invalid',
  })
  @ApiConflictResponse({
    description: 'A claim already exists for this case',
  })
  @ApiNotFoundResponse({
    description: 'Case or pre-authorization not found',
  })
  @ApiForbiddenResponse({
    description: 'Case belongs to another doctor',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async discharge(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DischargeDto,
  ) {
    return this.casesService.discharge_service(req.user!, id, dto);
  }

  @Get('/:id')
  @Roles(Role.PATIENT, Role.DOCTOR, Role.TPA_DESK, Role.PMJAY_DESK)
  @ApiOperation({ summary: 'Get a treatment case by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Treatment case ID',
  })
  @ApiOkResponse({ description: 'Case details retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Case not found' })
  @ApiForbiddenResponse({
    description: 'User is not authorized to view this case',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async get_case(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.casesService.get_case_service(req.user!, id);
  }
}
