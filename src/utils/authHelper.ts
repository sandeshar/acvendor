import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const hashPassword = async (password: string) => {
    const hashedPassword = await bcrypt.hash(password, process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS) : 10);
    return hashedPassword;
}

export const verifyJWT = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        return decoded;
    } catch (error) {
        return null;
    }
}

export const checkAuth = (token: string) => {
    const decoded = verifyJWT(token);
    if (!decoded) {
        return false;
    }
    return true;
}

export const returnRole = (token: string) => {
    const decoded = verifyJWT(token);
    if (!decoded) {
        return null;
    }
    return (decoded as any).role;
}

export const getUserIdFromToken = (token: string): number | null => {
    const decoded = verifyJWT(token);
    if (!decoded) {
        return null;
    }
    return (decoded as any).id;
}