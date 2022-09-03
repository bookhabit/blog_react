import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl';

const posts = new Router();

posts.get('/', postsCtrl.list); // 포스트 조회
posts.post('/', postsCtrl.write); // 포스트 생성
posts.get('/:id', postsCtrl.checkObjectId, postsCtrl.read); // 특정포스트 조회
posts.delete('/:id', postsCtrl.checkObjectId, postsCtrl.remove); // 특정포스트 삭제
posts.patch('/:id', postsCtrl.checkObjectId, postsCtrl.update); // 특정포스트 수정

export default posts;

// posts/:id 에 새로운 라우터 만들어서 적용
// import Router from 'koa-router';
// import * as postsCtrl from './posts.ctrl';

// const posts = new Router();
// // api/posts
// posts.get('/', postsCtrl.list); // 포스트 조회
// posts.post('/', postsCtrl.write); // 포스트 생성

// const post = new Router(); // api/posts/:id
// post.get('/', postsCtrl.read); // 특정포스트 조회
// post.delete('/', postsCtrl.remove); // 특정포스트 삭제
// post.patch('/', postsCtrl.update); // 특정포스트 수정

// posts.use('/:id', postsCtrl.checkObjectId, post.routes());
// export default posts;
