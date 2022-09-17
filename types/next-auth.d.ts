declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's internal database ID */
      id: string;

      /** The user's email address */
      email: string;

      /** The user's name */
      name: string;
    };
  }
}

export {};
