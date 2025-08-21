const express = require('express');
// Models will be imported after initialization
let Client, User;
const setModels = (ClientModel, UserModel) => {
  Client = ClientModel;
  User = UserModel;
};
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview statistics
// @access  Private
router.get('/overview', async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const [
            totalClients,
            activeClients,
            pendingClients,
            completedClients,
            highPriorityClients,
            newThisMonth,
            overdueClients,
            upcomingDeadlines,
            totalUsers,
            activeUsers
        ] = await Promise.all([
            // Client counts
            Client.count({ where: { isActive: true } }),
            Client.count({ where: { status: 'Active', isActive: true } }),
            Client.count({ where: { status: 'Pending', isActive: true } }),
            Client.count({ where: { status: 'Completed', isActive: true } }),
            Client.count({ where: { priority: 'High', isActive: true } }),

            // New clients this month
            Client.count({
                where: {
                    isActive: true,
                    createdAt: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            }),

            // Overdue clients
            Client.findOverdue().then(clients => clients.length),

            // Upcoming deadlines (next 7 days)
            Client.findUpcomingDeadlines(7).then(clients => clients.length),

            // User counts
            User.count(),
            User.count({ where: { isActive: true } })
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

        // Get priority distribution
        const priorityStats = await Client.findAll({
            where: { isActive: true },
            attributes: [
                'priority',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['priority'],
            raw: true
        });

        // Get recent clients
        const recentClients = await Client.findAll({
            where: { isActive: true },
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Get clients by assigned user
        const clientsByUser = await Client.findAll({
            where: { isActive: true },
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            attributes: [
                'assignedTo',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['assignedTo'],
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
                    newThisMonth,
                    overdueClients,
                    upcomingDeadlines,
                    totalUsers,
                    activeUsers
                },
                distributions: {
                    agency: agencyStats,
                    status: statusStats,
                    priority: priorityStats
                },
                recentClients,
                clientsByUser
            }
        });
    } catch (error) {
        console.error('Get dashboard overview error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get dashboard overview'
            }
        });
    }
});

// @route   GET /api/dashboard/trends
// @desc    Get dashboard trends data
// @access  Private
router.get('/trends', async (req, res) => {
    try {
        const currentDate = new Date();
        const months = [];

        // Generate last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push({
                year: date.getFullYear(),
                month: date.getMonth(),
                label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            });
        }

        // Get client creation trends
        const clientTrends = await Promise.all(
            months.map(async ({ year, month, label }) => {
                const startDate = new Date(year, month, 1);
                const endDate = new Date(year, month + 1, 0);

                const count = await Client.count({
                    where: {
                        isActive: true,
                        createdAt: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                });

                return { month: label, count };
            })
        );

        // Get completion trends
        const completionTrends = await Promise.all(
            months.map(async ({ year, month, label }) => {
                const startDate = new Date(year, month, 1);
                const endDate = new Date(year, month + 1, 0);

                const count = await Client.count({
                    where: {
                        isActive: true,
                        status: 'Completed',
                        updatedAt: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                });

                return { month: label, count };
            })
        );

        res.json({
            success: true,
            data: {
                clientTrends,
                completionTrends
            }
        });
    } catch (error) {
        console.error('Get dashboard trends error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get dashboard trends'
            }
        });
    }
});

// @route   GET /api/dashboard/performance
// @desc    Get performance metrics
// @access  Private
router.get('/performance', async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Get performance metrics
        const [
            totalActiveProjects,
            completedThisMonth,
            averageProjectDuration,
            clientSatisfactionScore,
            responseTime,
            budgetUtilization
        ] = await Promise.all([
            // Active projects
            Client.count({
                where: {
                    isActive: true,
                    status: {
                        [Op.in]: ['Active', 'Pending']
                    }
                }
            }),

            // Completed this month
            Client.count({
                where: {
                    isActive: true,
                    status: 'Completed',
                    updatedAt: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            }),

            // Average project duration (for completed projects)
            Client.findAll({
                where: {
                    isActive: true,
                    status: 'Completed',
                    startDate: { [Op.ne]: null },
                    endDate: { [Op.ne]: null }
                },
                attributes: [
                    [
                        require('sequelize').fn(
                            'AVG',
                            require('sequelize').fn(
                                'JULIANDAY',
                                require('sequelize').col('endDate')
                            ) - require('sequelize').fn(
                                'JULIANDAY',
                                require('sequelize').col('startDate')
                            )
                        ),
                        'avgDuration'
                    ]
                ],
                raw: true
            }).then(result => {
                const avgDays = result[0]?.avgDuration || 0;
                return Math.round(avgDays);
            }),

            // Client satisfaction score (placeholder - would need rating system)
            Promise.resolve(4.2),

            // Average response time (placeholder - would need tracking system)
            Promise.resolve(2.5),

            // Budget utilization (placeholder - would need budget tracking)
            Promise.resolve(78.5)
        ]);

        // Get top performing staff
        const topPerformers = await Client.findAll({
            where: {
                isActive: true,
                status: 'Completed',
                assignedTo: { [Op.ne]: null }
            },
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            attributes: [
                'assignedTo',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'completedProjects']
            ],
            group: ['assignedTo'],
            order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
            limit: 5,
            raw: true
        });

        res.json({
            success: true,
            data: {
                metrics: {
                    totalActiveProjects,
                    completedThisMonth,
                    averageProjectDuration,
                    clientSatisfactionScore,
                    responseTime,
                    budgetUtilization
                },
                topPerformers
            }
        });
    } catch (error) {
        console.error('Get dashboard performance error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get dashboard performance'
            }
        });
    }
});

// @route   GET /api/dashboard/alerts
// @desc    Get dashboard alerts and notifications
// @access  Private
router.get('/alerts', async (req, res) => {
    try {
        const currentDate = new Date();
        const alerts = [];

        // Overdue projects
        const overdueClients = await Client.findOverdue();
        if (overdueClients.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'Overdue Projects',
                message: `${overdueClients.length} project(s) are overdue`,
                count: overdueClients.length,
                items: overdueClients.slice(0, 3).map(client => ({
                    id: client.id,
                    name: client.clientName,
                    daysOverdue: Math.abs(client.getDaysRemaining())
                }))
            });
        }

        // Upcoming deadlines
        const upcomingDeadlines = await Client.findUpcomingDeadlines(3);
        if (upcomingDeadlines.length > 0) {
            alerts.push({
                type: 'info',
                title: 'Upcoming Deadlines',
                message: `${upcomingDeadlines.length} project(s) have deadlines in the next 3 days`,
                count: upcomingDeadlines.length,
                items: upcomingDeadlines.slice(0, 3).map(client => ({
                    id: client.id,
                    name: client.clientName,
                    daysRemaining: client.getDaysRemaining()
                }))
            });
        }

        // High priority projects
        const highPriorityClients = await Client.findAll({
            where: {
                priority: 'High',
                status: {
                    [Op.in]: ['Active', 'Pending']
                },
                isActive: true
            },
            limit: 5
        });

        if (highPriorityClients.length > 0) {
            alerts.push({
                type: 'danger',
                title: 'High Priority Projects',
                message: `${highPriorityClients.length} high priority project(s) require attention`,
                count: highPriorityClients.length,
                items: highPriorityClients.map(client => ({
                    id: client.id,
                    name: client.clientName,
                    status: client.status
                }))
            });
        }

        // Unassigned projects
        const unassignedClients = await Client.count({
            where: {
                assignedTo: null,
                isActive: true,
                status: {
                    [Op.in]: ['Active', 'Pending']
                }
            }
        });

        if (unassignedClients > 0) {
            alerts.push({
                type: 'warning',
                title: 'Unassigned Projects',
                message: `${unassignedClients} project(s) are not assigned to any staff member`,
                count: unassignedClients
            });
        }

        res.json({
            success: true,
            data: {
                alerts
            }
        });
    } catch (error) {
        console.error('Get dashboard alerts error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to get dashboard alerts'
            }
        });
    }
});

module.exports = router;
