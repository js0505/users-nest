import * as uuid from 'uuid';
import { ulid } from 'ulid';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { UserInfo } from './UserInfo';
import { EmailService } from './../email/email.service';
import { AuthService } from 'src/auth/auth.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { UserEntity } from 'src/entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    private authService: AuthService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private connection: Connection,
  ) {}

  async getAllUsers() {
    const users = await this.userRepository.find();

    return users;
  }

  async createUser(name: string, email: string, password: string) {
    await this.checkUserExists(email);

    // 인증 토큰 생성
    const signupVerifyToken = uuid.v1();

    await this.saveUser(name, email, password, signupVerifyToken);
    await this.sendMemberJoinEmail(email, signupVerifyToken);
  }

  // email로 가입 되어있는지 검사
  private async checkUserExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ email });

    // 없으면 undefined가 아니므로 true를 리턴
    return user !== undefined;
  }

  // 데이터베이스에 유저 저장
  private async saveUser(
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
  ) {
    // 저장하기 전에 유저가 이미 존재하는지 확인
    const checkUserExists = await this.checkUserExists(email);

    if (!checkUserExists) {
      // 트랜젝션 : 요청을 처리하는 과정에서 에러가 발생했을 경우 이전 상태로 되돌리기 위해서
      // 데이터베이스 에서 제공하는 기능.
      await this.connection.transaction(async (manager) => {
        const user = new UserEntity();
        user.id = ulid();
        user.name = name;
        user.email = email;
        user.password = password;
        user.signupVerifyToken = signupVerifyToken;

        console.log(`${name} 가입 성공`);
        await this.userRepository.save(user);
      });
    } else {
      throw new UnprocessableEntityException(
        '해당 이메일로는 가입할 수 없습니다.',
      );
    }
  }

  // 회원가입 인증 메일 발송
  private async sendMemberJoinEmail(
    emailAddress: string,
    signupVerifyToken: string,
  ) {
    await this.emailService.sendMemberJoinVerification(
      emailAddress,
      signupVerifyToken,
    );
  }

  async verifyEmail(signupVerifyToken: string): Promise<string> {
    // TODO
    // 1. DB에서 signupVerifyToken으로 회원 가입 처리중인 유저가 있는지 조회하고 없다면 에러 처리
    // 2. 바로 로그인 상태가 되도록 JWT를 발급

    const user = await this.userRepository.findOne({ signupVerifyToken });

    if (!user) {
      throw new Error('토큰으로 유저검색 실패');
    }

    return this.authService.login({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  async login(email: string, password: string): Promise<string> {
    // TODO
    // 1. email, password를 가진 유저가 존재하는지 DB에서 확인하고 없다면 에러 처리
    const user = await this.userRepository.findOne({ email, password });
    if (!user) {
      throw new NotFoundException('유저 정보가 없습니다.');
    }

    // 2. JWT를 발급
    return this.authService.login({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    // 1. userId를 가진 유저가 존재하는지 DB에서 확인하고 없다면 에러 처리
    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('유저가 존재하지 않습니다.');
    }

    // 2. 조회된 데이터를 UserInfo 타입으로 응답
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
