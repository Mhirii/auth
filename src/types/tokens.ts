export type AccessTokenPayload = {
  username: string;
  email: string;
  id: string;
};

export type RefreshTokenPayload = {
  id: string;
};

export type decodedAccessToken = {
  username: string;
  email: string;
  id: string;
  exp: number;
};

export type decodedRefreshToken = {
  id: string;
  exp: number;
};
