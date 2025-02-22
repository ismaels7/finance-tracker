import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { JwtAuthGaurd } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.useGlobalGuards(new JwtAuthGaurd(jwtS));
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

/* async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enablecors({
    origin: 'https://localhost:3000, //FE origen
    credentials: true //permitir envio de cookies con las peticiones
  });
  await app.listen(3001)
} 
bootstrap()
*/
