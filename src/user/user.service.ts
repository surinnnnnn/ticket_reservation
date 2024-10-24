import { compare, hash } from 'bcrypt';
import _ from 'lodash';
import { Admin, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../crypto/crypto.service';
import { Role } from './types/userRole.type';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { PaymentMethod } from './entities/paymentMethod.entity';

@Injectable()
export class UserService {
  private loginAttempts: {
    [key: string]: [number, number];
  } = {};
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PaymentMethod)
    private paymentMethodReposytory: Repository<PaymentMethod>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private cryptoService: CryptoService,
  ) {}

  async register(
    accountId: string,
    password: string,
    confirmed_password: string,
    nickname: string,
    admin_number?: string,
  ) {
    try {
      // 사용 중인 아이디
      const existingUser = await this.findByAccountId(accountId);
      if (existingUser) {
        throw new ConflictException('이미 사용되고 있는 아이디입니다.'); // 예외클래스 보내기
      }

      // 비밀번호, 확인 비밀번호 불일치
      if (password !== confirmed_password) {
        throw new BadRequestException('확인 비밀번호가 일치하지 않습니다.');
      }

      // 관리자 번호 입력 시 불일치
      const expectedAdminNumber =
        this.configService.get<string>('ADMIN_NUMBER');
      if (admin_number && admin_number !== expectedAdminNumber) {
        throw new BadRequestException('관리자 번호가 일치하지 않습니다.');
      }

      const hashedPassword = await hash(password, 10);

      // 관리자 번호 있으면 관리자로 가입
      const userRole = admin_number ? Role.Admin : Role.User;
      await this.userRepository.save({
        account_id: accountId,
        password: hashedPassword,
        nickname,
        role: userRole,
      });

      return {
        message: '회원가입이 완료되었습니다.',
        statusCode: 201,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findByAccountId(account_id: string) {
    return await this.userRepository.findOneBy({ account_id });
  }
  // 로그인
  async login(account_id: string, password: string) {
    const MAX_ATTEMPTS = 3;
    const BLOCK_TIME = 30 * 60 * 1000; // 30min

    const currentTime = Date.now();
    let userAttempts: [number, number]; // [count, time]

    if (this.loginAttempts[account_id]) {
      userAttempts = this.loginAttempts[account_id];
    } else {
      userAttempts = [0, 0]; // [count, time]
    }

    // 로그인 시도 시 차단 시간 확인
    if (userAttempts[0] >= MAX_ATTEMPTS) {
      if (currentTime - userAttempts[1] < BLOCK_TIME) {
        throw new UnauthorizedException(
          '비밀번호를 3회 이상 틀렸습니다. 30분 후에 다시 시도하세요.',
        );
      } else {
        // 타이머 다되면 카운트 리셋
        userAttempts[0] = 0;
        userAttempts[1] = 0;
      }
    }
    try {
      const user = await this.userRepository.findOne({
        select: ['id', 'account_id', 'password'],
        where: { account_id },
      });

      // 아이디 잘못 입력
      if (_.isNil(user)) {
        throw new UnauthorizedException('해당 아이디 사용자가 없습니다.');
      }

      // 비밀번호 불일치, 불일 치 시 시도 횟수 업데이트
      if (!(await compare(password, user.password))) {
        userAttempts[0] += 1;
        userAttempts[1] = currentTime;
        this.loginAttempts[account_id] = userAttempts;
        throw new UnauthorizedException('비밀 번호가 일치 하지 않습니다.');
      }

      // 로그인 성공 시
      userAttempts[0] = 0;
      userAttempts[1] = 0;
      this.loginAttempts[account_id] = userAttempts;

      const payload = { account_id, sub: user.id };
      const token = this.jwtService.sign(payload);
      // res.header('authorization', `Bearer ${token}`);
      return {
        access_token: token,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // 프로필 조회
  async profile(user: User) {
    try {
      const findUser = await this.userRepository.findOne({
        select: ['nickname'],
        where: { account_id: user.account_id },
      });

      const role = user.role === 0 ? 'user' : 'admin';
      return {
        account_id: user.account_id,
        nickname: findUser.nickname,
        role,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // 결제 수단 등록
  async registerPayment(
    user: User,
    card_number: string,
    expiration_date: string,
    cvv: string,
  ) {
    try {
      const cardHash = this.cryptoService.hashCardNumber(card_number);

      // 해시된 카드 번호로 중복거르기
      const existingPaymentMethod = await this.paymentMethodReposytory.findOne({
        where: { card_hash: cardHash }, // card_hash 칼럼 만들기(+)
      });

      if (existingPaymentMethod) {
        throw new ConflictException('이미 사용되고 있는 카드입니다.');
      }

      // crypto 로 암호화 해서 저장
      const encryptedCardNumber = this.cryptoService.encrypt(card_number);
      const encryptedCvv = this.cryptoService.encrypt(cvv);

      await this.paymentMethodReposytory.save({
        user: user,
        card_hash: cardHash,
        card_number: encryptedCardNumber,
        expiration_date,
        cvv: encryptedCvv,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
