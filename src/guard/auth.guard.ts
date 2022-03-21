import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
// Guard를 만들땐 CanActivate를 사용.
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  // 요청을 받아서 검증 후
  // 가드 통과 여부를 리턴.
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  // 요청을 검증하는 함수
  private validateRequest(request: any) {
    // 헤더에 키 : authorization, 값 : Bearer (jwt값)
    // 헤더에서 jwt 파싱
    const jwtString = request.headers.authorization.split('Bearer ')[1];

    // 우리 서버에서 발급된게 맞는지 확인
    this.authService.verify(jwtString);
    return true;
  }
}
