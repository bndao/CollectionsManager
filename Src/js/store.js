import { applyMiddleware, createStore } from "redux"

import { createLogger } from "redux-logger";
import thunk from "redux-thunk"
import promise from "redux-promise-middleware"

import reducer from "./Reducers"

const middleware = process.env.NODE_ENV === 'dev' ?
  applyMiddleware(promise(), thunk, createLogger()) :
  applyMiddleware(promise(), thunk);

export default createStore(reducer, middleware)
