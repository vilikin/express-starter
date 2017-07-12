const tokenExpiryTime: TokenExpiryTime = {
    value: 60,
    unit: "seconds"
};

export default {
    isDevelopment: () => process.env.NODE_ENV === "development",
    isProduction: () => process.env.NODE_ENV === "production",
    logErrors: false,
    port: process.env.PORT,
    tokenSecret: process.env.TOKEN_SECRET,
    tokenExpiryTime
};