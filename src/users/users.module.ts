import { UsersController } from './users.controller';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { EmailModule } from 'src/email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, EmailModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
