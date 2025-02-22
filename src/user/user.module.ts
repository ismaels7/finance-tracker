import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

@Module({
  imports: [ConfigModule],
  controllers: [UserController],
  providers: [UserService, {
    provide: DynamoDBDocumentClient,
    useFactory: (configService: ConfigService) => {
      const client = new DynamoDBClient({
        region: configService.get("AWS_REGION"),
            credentials: {
                accessKeyId: configService.get("AWS_ACCESS_KEY_ID") as string,
                secretAccessKey: configService.get("AWS_SECRET_ACCESS_KEY") as string,
            },
      });
      return DynamoDBDocumentClient.from(client);
    },
    inject: [ConfigService] //inject is needed to get the credentials
  }],
  exports: [UserService]
})
export class UserModule {}
