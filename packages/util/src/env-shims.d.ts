declare namespace NodeJS {
  export interface ProcessEnv {
    API_PORT: string;
    API_HOST: string;
    API_URL: string;
    API_SESSION_SECRET: string;
    WEBSITE_PORT: string;
    WEBSITE_HOST: string;
    WEBSITE_URL: string;
    DISCORD_TOKEN: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    POSTGRES_DB: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_HOST: string;
    POSTGRES_PORT: string;
  }
}
