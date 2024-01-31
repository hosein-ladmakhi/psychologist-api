import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TokenGuard } from './token.guard';
import { TokenStrategy } from './token.strategy';

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
  providers: [TokenGuard, TokenStrategy],
})
export class AuthModule {}
