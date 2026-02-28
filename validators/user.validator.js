import * as yup from 'yup';

export const userRegistrationSchema = yup.object({
    body: yup.object({
        userName: yup
            .string()
            .required("Username is required")
            .min(3, "Username must be at least 3 characters")
            .trim(),
        email: yup
            .string()
            .required("Email is required")
            .email("Invalid email format")
            .lowercase()
            .trim(),
        password: yup
            .string()
            .required("Password is required")
            .min(6, "Password must be at least 6 characters"),
    }),
});

export const verifyEmailSchema = yup.object({
    params: yup.object({
        email: yup.string().email("Invalid email format").required("Email is required")
    })
});

export const userLoginSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .required("Email is required")
            .email("Invalid email format")
            .lowercase()
            .trim(),
        password: yup
            .string()
            .required("Password is required")
            .min(6, "Password must be at least 6 characters"),
    }),
});

export const resetPasswordSchema = yup.object({
    body: yup.object({
        email: yup.string().email().required("Email is required"),
        otp: yup.string().length(6, "OTP must be 6 digits").required("OTP is required"),
        newPassword: yup.string().min(6, "Password must be at least 6 characters").required()
    })
});

export const changePasswordSchema = yup.object({
    body: yup.object({
        oldPassword: yup.string().required("Old password is required"),
        newPassword: yup.string().min(6, "New password must be at least 6 characters").required()
    })
})

export const verifyOtpSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .email("Invalid email format")
            .required("Email is required to verify OTP"),
        otp: yup
            .string()
            .length(6, "OTP must be exactly 6 digits")
            .required("OTP is required")
            .matches(/^\d+$/, "OTP must only contain numbers") // Ensure only digits
    })
});

export const forgotPasswordSchema = yup.object({
    body: yup.object({
        email: yup
            .string()
            .email("Invalid email format")
            .required("Email is required to send OTP")
    })
});