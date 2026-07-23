import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contacto } from './contacto.entity';
import { CreateContactoDto } from './contacto.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactoService {
  constructor(
    @InjectRepository(Contacto)
    private contactoRepository: Repository<Contacto>,
    private mailService: MailService,
  ) {}

  async create(dto: CreateContactoDto): Promise<Contacto> {
    const contacto = this.contactoRepository.create(dto);
    const guardado = await this.contactoRepository.save(contacto);
    await this.mailService.sendContactNotification(dto);
    return guardado;
  }

  findAll(): Promise<Contacto[]> {
    return this.contactoRepository.find({ order: { creado_en: 'DESC' } });
  }
}
