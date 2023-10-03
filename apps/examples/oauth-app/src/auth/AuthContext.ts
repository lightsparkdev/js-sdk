interface AuthContextType {
  signin: (callback: VoidFunction) => void;
  signout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  isAuthorized: () => boolean;
}

export default AuthContextType;
