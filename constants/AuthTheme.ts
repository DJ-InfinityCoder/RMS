export const AuthTheme = {
    colors: {
        primary: '#FF7A28',
        darkNavy: '#181924',
        backgroundGrey: '#F0F2F5',
        white: '#FFFFFF',
        inputBackground: '#F5F5F5',
        textGrey: '#9E9E9E',
        facebook: '#3B5998',
        twitter: '#1DA1F2',
        apple: '#000000',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: {
        small: 8,
        medium: 12,
        large: 30,
    },
    typography: {
        headerSize: 28,
        subheaderSize: 14,
        inputLabelSize: 12,
        buttonSize: 16,
    },
};

export type AuthThemeType = typeof AuthTheme;
