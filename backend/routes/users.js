const express = require('express');
const { body, query, validationResult } = require('express-validator');
// Models will be imported after initialization
let User;
const setUserModel = (UserModel) => {
    User = UserModel;
};
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', requireAdmin, [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('role')
        .optional()
        .isIn(['user', 'staff', 'admin', 'super_admin'])
        .withMessage('Invalid role'),
    query('search')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Search term must not be empty')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }

        const {
            page = 1,
            limit = 20,
            role,
            search,
            isActive
        } = req.query;

        // Build where clause
        const whereClause = {};

        if (role) whereClause.role = role;
        if (isActive !== undefined) whereClause.isActive = isActive === 'true';

        if (search) {
            whereClause[require('sequelize').Op.or] = [
                { username: { [require('sequelize').Op.like]: `%${search}%` } },
                { email: { [require('sequelize').Op.like]: `%${search}%` } },
                { firstName: { [require('sequelize').Op.like]: `%${search}%` } },
                { lastName: { [require('sequelize').Op.like]: `%${search}%` } }
            ];
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Get users with pagination
        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Calculate pagination info
        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                    hasNextPage,
                    hasPrevPage
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get users'
            }
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private (Admin)
router.get('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found'
                }
            });
        }

        res.json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get user'
            }
        });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private (Admin)
router.put('/:id', requireAdmin, [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be 1-50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be 1-50 characters'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('role')
        .optional()
        .isIn(['user', 'staff', 'admin', 'super_admin'])
        .withMessage('Invalid role'),
    body('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department must be 100 characters or less'),
    body('position')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Position must be 100 characters or less'),
    body('employeeId')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Employee ID must be 50 characters or less'),
    body('phoneNumber')
        .optional()
        .matches(/^[\+]?[0-9\s\-\(\)]+$/)
        .withMessage('Invalid phone number format'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Find user
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found'
                }
            });
        }

        // Check if trying to change role of super_admin
        if (user.role === 'super_admin' && updateData.role && updateData.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Cannot change role of super admin'
                }
            });
        }

        // Check if trying to deactivate super_admin
        if (user.role === 'super_admin' && updateData.isActive === false) {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Cannot deactivate super admin'
                }
            });
        }

        // Update user
        await user.update(updateData);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to update user'
            }
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found'
                }
            });
        }

        // Prevent deletion of super admin
        if (user.role === 'super_admin') {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Cannot delete super admin'
                }
            });
        }

        // Soft delete
        await user.update({ isActive: false });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to delete user'
            }
        });
    }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview (admin only)
// @access  Private (Admin)
router.get('/stats/overview', requireAdmin, async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            inactiveUsers
        ] = await Promise.all([
            User.count(),
            User.count({ where: { isActive: true } }),
            User.count({ where: { isActive: false } })
        ]);

        // Get role distribution
        const roleStats = await User.findAll({
            where: { isActive: true },
            attributes: [
                'role',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['role'],
            raw: true
        });

        // Get department distribution
        const departmentStats = await User.findAll({
            where: { isActive: true },
            attributes: [
                'department',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['department'],
            raw: true
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers
                },
                roleDistribution: roleStats,
                departmentDistribution: departmentStats
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get user statistics'
            }
        });
    }
});

module.exports = router;
