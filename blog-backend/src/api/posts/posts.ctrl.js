import Post from '../../modules/post';
import mongoose from 'mongoose';
import Joi from '../../../node_modules/joi/lib/index';

// ObjectId 검증코드
const { ObjectId } = mongoose.Types;

export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const post = await Post.findById(id);
    // 포스트가 존재하지 않을 때
    if (!post) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

// id로 찾은 포스트가 로그인중인 사용자가 작성한 포스트인지 확인해주는 미들웨어
export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403; // Forbidden 에러
    return;
  }
  return next();
};

// 포스트 작성 POST/api/posts {title,body}
// Post / api / posts
// {
//   title:'제목',
//   body:'내용',
//   tags:['태그1','태그2']
// }
export const write = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });
  // 검증하고 나서 검증 실패인 경우 에러처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }
  // 검증이 잘 됬으면 3가지 데이터를 전달받아서 포스트를 생성한다
  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
    user: ctx.state.user,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 포스트 목록 조회   GET/api/posts
export const list = async (ctx) => {
  // query는 문자열이기 떄문에 숫자로 변환해주어야 한다
  // 값이 주어지지 않으면 기본값 1페이지로 설정
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    //1보다 작으면 오류메세지
    ctx.status = 400;
    return;
  }

  const { tag, username } = ctx.query;
  // tag,username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
  const query = {
    ...(username ? { 'user.username': username } : {}),
    ...(tag ? { tags: tag } : {}),
  };

  try {
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const postCount = await Post.countDocuments(query).exec();
    ctx.set('Last-Page', Math.ceil(postCount / 10));
    ctx.body = posts
      .map((post) => post.toJSON())
      .map((post) => ({
        ...post,
        body:
          post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
      }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 특정 포스트 조회  GET/api/posts/:id
export const read = (ctx) => {
  ctx.body = ctx.state.post;
};

// 특정 포스트 제거 DELETE /api/posts/:id
export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; // No Content (성공하기는 했지만 응답할 데이터가 없음)
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 포스트 수정 (특정필드 변경)  PATCH/api/posts/:id {title,body,tags}
export const update = async (ctx) => {
  const { id } = ctx.params;
  // write 에서 사용한 schema 와 비슷한데, required() 가 없습니다.
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  // 검증 후, 검증 실패시 에러처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // 이 값을 설정하면 업데이트된 데이터를 반환합니다.
      // false 일 때에는 업데이트 되기 전의 데이터를 반환합니다.
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
