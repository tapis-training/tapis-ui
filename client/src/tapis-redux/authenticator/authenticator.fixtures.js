export const authenticatorToken = {
  token: 'abcdef',
  expires_at: '2021-03-18T21:14:39.702723+00:00',
  expires_in: 14400,
  jti: '',
};

export const authenticatorResult = {
  data: {
    result: {
      access_token: authenticatorToken,
    },
  },
};

export const authenticatorStore = {
  token: authenticatorToken,
  loading: false,
  error: null,
};
