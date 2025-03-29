export declare function getAllSchemas(): {
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
    SimpleUserDto: {
        type: string;
        properties: {
            id: {
                type: string;
                format: string;
            };
            email: {
                type: string;
                format: string;
            };
            firstName: {
                type: string;
            };
            lastName: {
                type: string;
            };
            role: {
                type: string;
                enum: string[];
            };
            isActive: {
                type: string;
            };
            createdAt: {
                type: string;
                format: string;
            };
        };
    };
    CreateUserDto: {
        type: string;
        properties: {
            email: {
                type: string;
                format: string;
            };
            firstName: {
                type: string;
            };
            lastName: {
                type: string;
            };
            password: {
                type: string;
                format: string;
            };
            role: {
                type: string;
                enum: string[];
            };
        };
        required: string[];
    };
    UpdateUserDto: {
        type: string;
        properties: {
            firstName: {
                type: string;
            };
            lastName: {
                type: string;
            };
            role: {
                type: string;
                enum: string[];
            };
            isActive: {
                type: string;
            };
        };
    };
};
