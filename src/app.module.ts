import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import emailConfig from './config/emailConfig';
import { LoggerMiddelware } from './logger/logger.middelware';
import { AuthModule } from './auth/auth.module';
import authConfig from './config/authConfig';

@Module({
  imports: [
    UsersModule,
    EmailModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: [`${__dirname}/config/env/.${process.env.NODE_ENV}.env`],
      // config 파일 만들고 여기서 로드 꼭 해야함
      load: [emailConfig, authConfig],
      isGlobal: true,
      // validationSchema,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: 3306,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: 'test',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // 개발 환경에서만 사용.
      // 소스코드 기반으로 데이터베이스 스키마 동기화 여부.
      synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE),
    }),
  ],
  providers: [],
})

// NestModule 인터페이스를 사용한 클래스로 만들고

// consumer.apply = 미들웨어 클래스, 함수
// 콤마를 사용해서 나열할 수 있고, 나열된 순서대로 실행된다.
// MiddlewareConfigProxy 타입을 리턴하고 이 타입이 밑에 함수들

// consumer.exclude = 미들웨어를 적용하지 않을 경로 설정
// ex) .exclude({ path: 'users', method: RequestMethod.GET },)
//  = users 경로의 get 메소드는 미들웨어를 무시한다.

// consumer.forRoutes = 전달된 경로 또는 컨트롤러를 현재 구성된 미들웨어에 연결.
// 클래스를 전달하면 Nest는 이 컨트롤러 내에 정의된 모든 경로에 미들웨어를 연결합니다.
// '/users' 등의 경로 or UserController 등의 클래스 전달 가능
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddelware).forRoutes('/users');
  }
}
