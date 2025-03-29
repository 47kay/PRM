export declare const authSchemas: {
    LoginDto: {
        type: string;
        properties: {
            email: {
                type: string;
                format: string;
            };
            password: {
                type: string;
                format: string;
            };
        };
        required: string[];
    };
    AuthResponseDto: {
        type: string;
        properties: {
            accessToken: {
                type: string;
            };
            refreshToken: {
                type: string;
            };
            user: {
                $ref: string;
            };
        };
    };
    RefreshTokenDto: {
        type: string;
        properties: {
            refreshToken: {
                type: string;
            };
        };
        required: string[];
    };
};
