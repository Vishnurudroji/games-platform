import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

export const createCategory = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { name, entryFee, gameId, inchargeName, inchargeEmail, inchargePassword } = req.body;

        // Manage INCHARGE user creation
        let inchargeUser = await prisma.user.findUnique({ where: { email: inchargeEmail } });

        if (!inchargeUser) {
            if (!inchargePassword) {
                return res.status(400).json({ message: 'Password is required to create a new Incharge user' });
            }
            const hashedPassword = await bcrypt.hash(inchargePassword, 10);
            inchargeUser = await prisma.user.create({
                data: {
                    email: inchargeEmail,
                    password: hashedPassword,
                    name: inchargeName,
                    role: 'INCHARGE'
                }
            });
        }

        const category = await prisma.category.create({
            data: {
                name,
                entryFee: Number(entryFee),
                gameId,
                inchargeId: inchargeUser.id
            }
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getCategories = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { gameId } = req.query;
        let whereClause = {};
        if (gameId) {
            whereClause = { gameId: String(gameId) };
        }

        const categories = await prisma.category.findMany({
            where: whereClause,
            include: {
                incharge: { select: { id: true, name: true, email: true } }
            }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id as string;
        const { name, entryFee, inchargeName, inchargeEmail, inchargePassword } = req.body;

        const existingCategory: any = await prisma.category.findUnique({
            where: { id },
            include: { incharge: true }
        });

        if (!existingCategory) return res.status(404).json({ message: 'Category not found' });

        let inchargeId = existingCategory.inchargeId;

        if (inchargeEmail && inchargeEmail !== existingCategory.incharge.email) {
            let inchargeUser = await prisma.user.findUnique({ where: { email: inchargeEmail } });
            if (!inchargeUser) {
                if (!inchargePassword) {
                    return res.status(400).json({ message: 'Password is required to create a new Incharge user' });
                }
                const hashedPassword = await bcrypt.hash(inchargePassword, 10);
                inchargeUser = await prisma.user.create({
                    data: {
                        email: inchargeEmail,
                        password: hashedPassword,
                        name: inchargeName,
                        role: 'INCHARGE'
                    }
                });
            }
            inchargeId = inchargeUser.id;
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name: name || existingCategory.name,
                entryFee: entryFee !== undefined ? Number(entryFee) : existingCategory.entryFee,
                inchargeId
            }
        });

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id as string;
        await prisma.category.delete({ where: { id } });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
