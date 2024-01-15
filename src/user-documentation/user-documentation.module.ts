import { Module } from '@nestjs/common';
import { UserDocumentationController } from './user-documentation.controller';

@Module({
  controllers: [UserDocumentationController]
})
export class UserDocumentationModule {}
