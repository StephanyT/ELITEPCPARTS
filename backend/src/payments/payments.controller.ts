import { BadRequestException, Body, Controller, Get, HttpCode, Param, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from '../orders/order.dto';
import { CurrentUser, Public } from '../auth/auth.decorators';
import type { UsuarioToken } from '../auth/auth.decorators';

const PURCHASE_NUMBER = /^\d{1,12}$/;

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // El checkout pide una sesión de pago. El monto lo calcula el servidor.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('niubiz/session')
  @HttpCode(200)
  @ApiBody({ schema: { example: { direccion: 'Av. Siempre Viva 123, Lima', items: [{ componentId: 1, cantidad: 1 }] } } })
  crearSesion(@CurrentUser() usuario: UsuarioToken, @Body() dto: CreateOrderDto, @Req() req: Request) {
    return this.paymentsService.crearSesion(usuario, dto, req.ip);
  }

  // Niubiz envía aquí el formulario (POST del navegador, sin token) con el transactionToken.
  // Es público porque no hay forma de mandar el JWT, pero no confía en nada: confirma el cobro con Niubiz.
  @Public()
  @Post('niubiz/confirm')
  async confirmar(
    @Query('purchaseNumber') purchaseNumber: string,
    @Body('transactionToken') transactionToken: string | undefined,
    @Res() res: Response,
  ) {
    if (!PURCHASE_NUMBER.test(purchaseNumber ?? '')) throw new BadRequestException('Número de compra inválido');

    await this.paymentsService.confirmar(purchaseNumber, transactionToken);

    // Pase lo que pase, se vuelve a la tienda; la página de resultado pregunta el estado real
    const frontend = (process.env.FRONTEND_URL ?? 'http://localhost').replace(/\/$/, '');
    return res.redirect(303, `${frontend}/src/pages/pago-resultado.html?compra=${purchaseNumber}`);
  }

  // La página de resultado consulta cómo terminó el pago
  @Get(':purchaseNumber')
  consultar(@CurrentUser() usuario: UsuarioToken, @Param('purchaseNumber') purchaseNumber: string) {
    if (!PURCHASE_NUMBER.test(purchaseNumber)) throw new BadRequestException('Número de compra inválido');
    return this.paymentsService.consultar(usuario, purchaseNumber);
  }
}