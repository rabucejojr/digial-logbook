const express = require('express');
const { body, query, validationResult } = require('express-validator');
// Models will be imported after initialization
let Client, User;
const setModels = (ClientModel, UserModel) => {
    Client = ClientModel;
    User = UserModel;
};
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/clients
// @desc    Get all clients with filtering and pagination
// @access  Private
router.get('/', [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('status')
        .optional()
        .isIn(['Active', 'Pending', 'Completed', 'On Hold', 'Cancelled'])
        .withMessage('Invalid status'),
    query('priority')
        .optional()
        .isIn(['High', 'Medium', 'Low'])
        .withMessage('Invalid priority'),
    query('agency')
        .optional()
        .isIn(['MSME', 'Academe', 'NGA', 'DepED', 'Cooperatives', 'LGU', 'Private Sector', 'Others'])
        .withMessage('Invalid agency'),
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
            status,
            priority,
            agency,
            search,
            assignedTo,
            startDate,
            endDate
        } = req.query;

        // Build where clause
        const whereClause = { isActive: true };

        if (status) whereClause.status = status;
        if (priority) whereClause.priority = priority;
        if (agency) whereClause.agency = agency;
        if (assignedTo) whereClause.assignedTo = assignedTo;

        if (startDate && endDate) {
            whereClause.startDate = {
                [require('sequelize').Op.between]: [startDate, endDate]
            };
        }

        // Build search clause
        if (search) {
            whereClause[require('sequelize').Op.or] = [
                { clientName: { [require('sequelize').Op.like]: `%${search}%` } },
                { projectName: { [require('sequelize').Op.like]: `%${search}%` } },
                { description: { [require('sequelize').Op.like]: `%${search}%` } },
                { contactPerson: { [require('sequelize').Op.like]: `%${search}%` } },
                { location: { [require('sequelize').Op.like]: `%${search}%` } }
            ];
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Get clients with pagination
        const { count, rows: clients } = await Client.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'firstName', 'lastName', 'username', 'email']
                }
            ],
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
                clients,
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
        console.error('Get clients error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get clients'
            }
        });
    }
});

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'department', 'position']
                }
            ]
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Client not found'
                }
            });
        }

        res.json({
            success: true,
            data: {
                client
            }
        });
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get client'
            }
        });
    }
});

// @route   POST /api/clients
// @desc    Create a new client
// @access  Private
router.post('/', [
    body('clientName')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Client name is required and must be 1-200 characters'),
    body('projectName')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Project name must be 200 characters or less'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Description must be 5000 characters or less'),
    body('contactPerson')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Contact person must be 100 characters or less'),
    body('contactEmail')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('contactPhone')
        .optional()
        .matches(/^[\+]?[0-9\s\-\(\)]+$/)
        .withMessage('Invalid phone number format'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Location must be 200 characters or less'),
    body('agency')
        .optional()
        .isIn(['MSME', 'Academe', 'NGA', 'DepED', 'Cooperatives', 'LGU', 'Private Sector', 'Others'])
        .withMessage('Invalid agency'),
    body('status')
        .optional()
        .isIn(['Active', 'Pending', 'Completed', 'On Hold', 'Cancelled'])
        .withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['High', 'Medium', 'Low'])
        .withMessage('Invalid priority'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must be 100 characters or less'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),
    body('budget')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Budget must be a positive number'),
    body('assignedTo')
        .optional()
        .isInt()
        .withMessage('Assigned user ID must be an integer'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Notes must be 5000 characters or less')
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
            clientName,
            projectName,
            description,
            contactPerson,
            contactEmail,
            contactPhone,
            location,
            agency,
            status = 'Active',
            priority = 'Medium',
            category,
            tags = [],
            startDate,
            endDate,
            budget,
            currency = 'PHP',
            assignedTo,
            notes,
            source,
            referralBy
        } = req.body;

        // Validate assigned user if provided
        if (assignedTo) {
            const assignedUser = await User.findByPk(assignedTo);
            if (!assignedUser) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Assigned user not found'
                    }
                });
            }
        }

        // Create client
        const client = await Client.create({
            clientName,
            projectName,
            description,
            contactPerson,
            contactEmail,
            contactPhone,
            location,
            agency,
            status,
            priority,
            category,
            tags,
            startDate,
            endDate,
            budget,
            currency,
            assignedTo,
            notes,
            source,
            referralBy
        });

        // Get client with assigned user info
        const createdClient = await Client.findByPk(client.id, {
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'firstName', 'lastName', 'username', 'email']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            data: {
                client: createdClient
            }
        });
    } catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to create client'
            }
        });
    }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', [
    body('clientName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Client name must be 1-200 characters'),
    body('projectName')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Project name must be 200 characters or less'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Description must be 5000 characters or less'),
    body('contactPerson')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Contact person must be 100 characters or less'),
    body('contactEmail')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('contactPhone')
        .optional()
        .matches(/^[\+]?[0-9\s\-\(\)]+$/)
        .withMessage('Invalid phone number format'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Location must be 200 characters or less'),
    body('agency')
        .optional()
        .isIn(['MSME', 'Academe', 'NGA', 'DepED', 'Cooperatives', 'LGU', 'Private Sector', 'Others'])
        .withMessage('Invalid agency'),
    body('status')
        .optional()
        .isIn(['Active', 'Pending', 'Completed', 'On Hold', 'Cancelled'])
        .withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['High', 'Medium', 'Low'])
        .withMessage('Invalid priority'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must be 100 characters or less'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),
    body('budget')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Budget must be a positive number'),
    body('assignedTo')
        .optional()
        .isInt()
        .withMessage('Assigned user ID must be an integer'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Notes must be 5000 characters or less')
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

        // Find client
        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Client not found'
                }
            });
        }

        // Validate assigned user if provided
        if (updateData.assignedTo) {
            const assignedUser = await User.findByPk(updateData.assignedTo);
            if (!assignedUser) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Assigned user not found'
                    }
                });
            }
        }

        // Update client
        await client.update(updateData);

        // Get updated client with assigned user info
        const updatedClient = await Client.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'firstName', 'lastName', 'username', 'email']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Client updated successfully',
            data: {
                client: updatedClient
            }
        });
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to update client'
            }
        });
    }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client (soft delete)
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Client not found'
                }
            });
        }

        // Soft delete
        await client.update({ isActive: false });

        res.json({
            success: true,
            message: 'Client deleted successfully'
        });
    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to delete client'
            }
        });
    }
});

// @route   GET /api/clients/stats/overview
// @desc    Get client statistics overview
// @access  Private
router.get('/stats/overview', async (req, res) => {
    try {
        const [
            totalClients,
            activeClients,
            pendingClients,
            completedClients,
            highPriorityClients,
            overdueClients
        ] = await Promise.all([
            Client.count({ where: { isActive: true } }),
            Client.count({ where: { status: 'Active', isActive: true } }),
            Client.count({ where: { status: 'Pending', isActive: true } }),
            Client.count({ where: { status: 'Completed', isActive: true } }),
            Client.count({ where: { priority: 'High', isActive: true } }),
            Client.findOverdue().then(clients => clients.length)
        ]);

        // Get agency distribution
        const agencyStats = await Client.findAll({
            where: { isActive: true },
            attributes: [
                'agency',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['agency'],
            raw: true
        });

        // Get status distribution
        const statusStats = await Client.findAll({
            where: { isActive: true },
            attributes: [
                'status',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalClients,
                    activeClients,
                    pendingClients,
                    completedClients,
                    highPriorityClients,
                    overdueClients
                },
                agencyDistribution: agencyStats,
                statusDistribution: statusStats
            }
        });
    } catch (error) {
        console.error('Get client stats error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get client statistics'
            }
        });
    }
});

module.exports = router;
