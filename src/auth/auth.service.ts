import * as jwt from 'jsonwebtoken';
import { ConfigType } from '@nestjs/config';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import authConfig from 'src/config/authConfig';

interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
  ) {}

  // 여기서 JWT 토큰을 리턴
  login(user: User) {
    const payload = { ...user };

    return jwt.sign(payload, this.config.jwtSecret, {
      // 토큰 유효기간
      expiresIn: '1d',
      audience: 'example.com',
      issuer: 'example.com',
    });
  }

  verify(jwtString: string) {
    try {
      const payload = jwt.verify(jwtString, this.config.jwtSecret) as (
        | jwt.JwtPayload
        | string
      ) &
        User;

      const { id, email } = payload;

      return {
        userId: id,
        email,
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
