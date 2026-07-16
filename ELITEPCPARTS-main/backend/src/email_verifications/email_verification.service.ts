import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from './email-verification.entity';

@Injectable()
export class EmailVerificationsService {
  constructor(
    @InjectRepository(EmailVerification)
    private emailVerificationsRepository: Repository<EmailVerification>,
  ) {}

  findAll() {
    return this.emailVerificationsRepository.find({ relations: { usuario: true } });
  }

  findOne(id: number) {
    return this.emailVerificationsRepository.findOne({ where: { id }, relations: { usuario: true } });
  }

  create(data: Partial<EmailVerification>) {
    const verification = this.emailVerificationsRepository.create(data);
    return this.emailVerificationsRepository.save(verification);
  }

  async remove(id: number) {
    await this.emailVerificationsRepository.delete(id);
    return { deleted: true };
  }
}