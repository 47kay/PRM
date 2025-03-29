export declare const userSchemas: {
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
