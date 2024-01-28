import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: 'xxx',
      signOptions: {
        expiresIn: '2h',
      },
    }),
  ],
})
export class AuthModule {}
