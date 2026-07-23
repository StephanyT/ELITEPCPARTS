import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contacto } from './contacto.entity';
import { ContactoService } from './contacto.service';
import { ContactoController } from './contacto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contacto])],
  providers: [ContactoService],
  controllers: [ContactoController],
})
export class ContactoModule {}
