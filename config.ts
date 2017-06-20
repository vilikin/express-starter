const tokenExpiryTime: TokenExpiryTime = {
    value: 7,
    unit: "days"
};

export default {
    isDevelopment: () => process.env.NODE_ENV === "development",
    isProduction: () => process.env.NODE_ENV === "production",
    port: process.env.PORT,
    tokenSecret: process.env.TOKEN_SECRET,
    tokenExpiryTime
};