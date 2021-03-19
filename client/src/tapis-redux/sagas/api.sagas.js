import { call, put, select, takeEvery } from 'redux-saga/effects';
import getToken from '../authenticator/authenticator.selectors';
import tapisFetch from '../utils';
import ACTIONS from './api.actions';

export function* apiSagaHelper(action) {
  const {
    config,
    apiCallback,
    apiParams,
    dispatches,
    responseParser,
  } = action.payload;
  try {
    yield put({ type: dispatches.START });
    const storeToken = yield select(getToken);
    // Search for a token in a provided tapis config, or just use the store's token
    const token = config ? config.token || storeToken : storeToken;
    // Search for a tenant url a provided tapis config, or just use environment default
    const defaultUrl = process.env.TAPIS_TENANT_URL;
    const tenant = config ? config.tenant || defaultUrl : defaultUrl;
    const fetchParams = {
      method: apiParams.method,
      token: token.access_token,
      service: apiParams.service,
      path: apiParams.path,
      params: apiParams.params,
      tenant,
      data: apiParams.data,
    };
    const response = yield call(tapisFetch, fetchParams);
    const result = responseParser(response);
    yield put({ type: dispatches.SUCCESS, payload: result });
    if (apiCallback) {
      apiCallback(result);
    }
  } catch (error) {
    yield put({ type: dispatches.ERROR, payload: error });
    if (apiCallback) {
      apiCallback(error);
    }
  }
}

export function* watchApiSagaHelper() {
  yield takeEvery(ACTIONS.API.CALL, apiSagaHelper);
}