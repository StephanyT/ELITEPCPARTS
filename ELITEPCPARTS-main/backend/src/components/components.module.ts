import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentsController } from './components.controller';
import { ComponentsService } from './components.service';
import { Component } from './component.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Component])],
  controllers: [ComponentsController],
  providers: [ComponentsService],
})
export class ComponentsModule {}