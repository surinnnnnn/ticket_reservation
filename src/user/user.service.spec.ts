import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { User } from './entities/user.entity';
import { PaymentMethod } from './entities/paymentMethod.entity';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
        {
          provide: getRepositoryToken(PaymentMethod),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mockToken') },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: CryptoService, useValue: {} },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('로그인 성공 시 토큰 발급', async () => {
    const mockUser = {
      id: 1,
      account_id: 'testuser',
      password: await bcrypt.hash('password', 10),
      nickname: 'testNickname',
      role: 0,
      paymentMethod: null,
      payments: null,
    };
    jest
      .spyOn(service['userRepository'], 'findOne')
      .mockResolvedValue(mockUser);
    jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');

    const result = await service.login('testuser', 'password');
    expect(result).toEqual({ access_token: 'mockToken' });
  });

  it('should throw UnauthorizedException if user not found', async () => {
    jest.spyOn(service['userRepository'], 'findOne').mockResolvedValue(null);

    await expect(service.login('wronguser', 'password')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('비밀번호 불일치 시 오류 ', async () => {
    const mockUser = {
      id: 1,
      account_id: 'testuser',
      password: await bcrypt.hash('password', 10),
      nickname: 'testNickname',
      role: 0,
      paymentMethod: null,
      payments: null,
    };
    jest
      .spyOn(service['userRepository'], 'findOne')
      .mockResolvedValue(mockUser);

    await expect(service.login('testuser', 'wrongpassword')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('로그인 3번 실패시 30분 블락', async () => {
    const mockUser = {
      id: 1,
      account_id: 'testuser',
      password: await bcrypt.hash('password', 10),
      nickname: 'testNickname',
      role: 0,
      paymentMethod: null,
      payments: null,
    };
    jest
      .spyOn(service['userRepository'], 'findOne')
      .mockResolvedValue(mockUser);

    for (let i = 0; i < 3; i++) {
      await expect(service.login('testuser', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    }

    await expect(service.login('testuser', 'wrongpassword')).rejects.toThrow(
      '비밀번호를 3회 이상 틀렸습니다. 30분 후에 다시 시도하세요.',
    );
  });

  it('30분 후 로그인 가능', async () => {
    const mockUser = {
      id: 1,
      account_id: 'testuser',
      password: await bcrypt.hash('password', 10),
      nickname: 'testNickname',
      role: 0,
      paymentMethod: null,
      payments: null,
    };
    jest
      .spyOn(service['userRepository'], 'findOne')
      .mockResolvedValue(mockUser);

    for (let i = 0; i < 3; i++) {
      await expect(service.login('testuser', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    }

    service['loginAttempts']['testuser'][1] -= 30 * 60 * 1000;

    jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');
    const result = await service.login('testuser', 'password');
    expect(result).toEqual({ access_token: 'mockToken' });
  });
});
