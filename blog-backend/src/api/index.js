// const Router = require('koa-router');
// const posts = require('./posts');
import Router from 'koa-router';
import posts from './posts';
import auth from './auth';

const api = new Router();

// posts와 auth 라우터를 api라우터에 적용
api.use('/posts', posts.routes());
api.use('/auth', auth.routes());

// 라우터를 내보낸다
export default api;
