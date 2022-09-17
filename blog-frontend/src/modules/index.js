import { combineReducers } from 'redux';
import auth from './auth';
import write from './write';

const rootReducer = combineReducers({
  auth,
  write,
});

export default rootReducer;
