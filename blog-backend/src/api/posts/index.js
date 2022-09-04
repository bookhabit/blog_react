// import Router from 'koa-router';
// import * as postsCtrl from './posts.ctrl';
// import checkLoggedIn from '../../lib/checkLoggedIn';

// const posts = new Router();

// posts.get('/', postsCtrl.list); // 포스트 조회
// posts.post('/', checkLoggedIn, postsCtrl.write); // 미들웨어를 사용해서 로그인상태를 보고 포스트 생성

// posts.get('/:id', postsCtrl.getPostById, postsCtrl.read); // 특정포스트 조회
// posts.delete(
//   '/:id',
//   checkLoggedIn,
//   postsCtrl.checkOwnPost,
//   postsCtrl.getPostById,
//   postsCtrl.remove,
// ); // 특정포스트 삭제
// posts.patch(
//   '/:id',
//   checkLoggedIn,
//   postsCtrl.checkOwnPost,
//   postsCtrl.getPostById,
//   postsCtrl.update,
// ); // 특정포스트 수정

// export default posts;

import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const posts = new Router();

posts.get('/', postsCtrl.list); // 포스트 조회
posts.post('/', checkLoggedIn, postsCtrl.write); // 포스트 생성

const post = new Router(); // /api/posts/:id
post.get('/', postsCtrl.read); // 특정포스트 조회
post.delete('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.remove); // 특정 포스트 삭제
post.patch('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.update); // 특정포스트 수정

posts.use('/:id', postsCtrl.getPostById, post.routes());

export default posts;
