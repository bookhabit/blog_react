import Joi from 'joi';
import User from '../../modules/user';

/*
Post /api/auth/register  요청
{ (body 데이터) 
    username:'velopert',
    password:'mypass123'
}
*/
// 회원가입 구현
export const register = async (ctx) => {
  // Request Body 검증하기
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }
  const { username, password } = ctx.request.body; // 요청할때 보내오는 데이터
  try {
    // username이 이미 존재하는지 확인
    const exists = await User.findByUsername(username);
    if (exists) {
      ctx.status = 409; // Conflict
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // 데이터베이스에 저장

    // 응답할 데이터에서 hashedPassword 필드 제거 - serialize() 메서드 사용
    // const data = user.toJSON();
    // delete data.hashedPassword;
    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
Post /api/auth/login  요청URL
{ (body 데이터) 
    username:'velopert',
    password:'mypass123'
}
*/
// 로그인
export const login = async (ctx) => {
  const { username, password } = ctx.request.body; // 요청할 때 보내는 내용 받아옴

  //username,password 가 없으면 에러 처리
  if (!username || !password) {
    // 값이 들어있으면 true , 들어있지 않으면 false
    ctx.status = 401; // Unauthorized
    return;
  }

  try {
    const user = await User.findByUsername(username);
    // 계정이 존재하지 않으면 에러처리
    if (!user) {
      ctx.status = 401;
      return;
    }
    // 비밀번호 확인
    const valid = await user.checkPassword(password);
    // 잘못된 비밀번호
    if (!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = user.serialize(); // 응답할 데이터에 hashedPassword 제거
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const check = async (ctx) => {
  // 로그인 상태 확인
};
export const logout = async (ctx) => {
  // 로그아웃
};
