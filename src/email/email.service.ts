import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import Mail = require('nodemailer/lib/mailer');
import * as nodemailer from 'nodemailer';
import emailConfig from 'src/config/emailConfig';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Mail;

  constructor(
    // emailConfig.KEY = emailConfig 안에 registerAs의 첫번째 인자에 넣은 토큰
    @Inject(emailConfig.KEY) private config: ConfigType<typeof emailConfig>,
  ) {
    //   nodemailer에서 제공되는 Transporter 객체 생성.
    this.transporter = nodemailer.createTransport({
      service: config.service,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }

  async sendMemberJoinVerification(
    emailAddress: string,
    signupVerifyToken: string,
  ) {
    const baseUrl = this.config.baseUrl;
    const url = `${baseUrl}/users/email-verify?signupVerifyToken=${signupVerifyToken}`;

    const mailOptions: EmailOptions = {
      to: emailAddress,
      subject: '가입 인증 메일',
      html: `
            가입확인 버튼을 누르시면 가입 인증이 완료됩니다.<br/>
            <form action="${url}" method="POST">
                <button>가입확인</button>
            </form>
          `,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
