import { expectSaga } from 'redux-saga-test-plan';
import { tapisAuthPassword, authenticatorLogin } from 'tapis-redux/authenticator/authenticator.sagas';
import { ACTIONS } from 'tapis-redux/authenticator/authenticator.actions';
import { authenticatorToken, authenticatorStore, authenticatorResponse } from 'fixtures/authenticator.fixtures';
import authenticator from 'tapis-redux/authenticator/authenticator.reducer';
import * as matchers from "redux-saga-test-plan/matchers";

jest.mock('cross-fetch');

describe('Authenticator login saga', () => {
  it('runs saga', async () => {
    const onApi = jest.fn();
    const action = {
      type: ACTIONS.LOGIN.LOGIN,
      payload: {
        username: 'username',
        password: 'password',
        onApi
      }
    };
    // Make sure saga runs with correct sequence of events
    expectSaga(authenticatorLogin, action)
      .withReducer(authenticator)
      .provide([
        // Mock the call to tapisAuthPassword to return the fixture
        [matchers.call.fn(tapisAuthPassword), authenticatorResponse]
      ])
      .put({
        type: ACTIONS.LOGIN.START,
      })
      .call(tapisAuthPassword, { username: 'username', password: 'password', authenticator: undefined })
      .put({
        type: ACTIONS.LOGIN.SUCCESS,
        payload: authenticatorToken,
      })
      .call(onApi, authenticatorToken)
      .hasFinalState(authenticatorStore)
      .run();
    // Make sure callback fires
    expect(onApi.mock.calls[0][0]).toStrictEqual(authenticatorToken);
  });
});