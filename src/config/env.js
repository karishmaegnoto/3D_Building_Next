
export const ENV = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL ,
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
};

export default ENV;
