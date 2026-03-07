interface AppleSignInAuthorizationResponse {
  authorization: {
    code: string;
    id_token: string;
    state?: string;
  };
  user?: {
    email: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
}

interface AppleIDAuth {
  init(config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    state?: string;
    usePopup?: boolean;
  }): void;
  signIn(): Promise<AppleSignInAuthorizationResponse>;
}

interface Window {
  AppleID?: {
    auth: AppleIDAuth;
  };
}
