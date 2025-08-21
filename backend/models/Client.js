const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 200
    },
    projectName: {
        type: String,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 5000
    },
    contactPerson: {
        type: String,
        trim: true,
        maxlength: 100
    },
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    contactPhone: {
        type: String,
        trim: true,
        maxlength: 20,
        match: /^[\+]?[0-9\s\-\(\)]+$/
    },
    location: {
        type: String,
        trim: true,
        maxlength: 200
    },
    agency: {
        type: String,
        enum: ['MSME', 'Academe', 'NGA', 'DepED', 'Cooperatives', 'LGU', 'Private Sector', 'Others']
    },
    status: {
        type: String,
        enum: ['Active', 'Pending', 'Completed', 'On Hold', 'Cancelled'],
        default: 'Active',
        required: true
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium',
        required: true
    },
    category: {
        type: String,
        trim: true,
        maxlength: 100
    },
    tags: {
        type: [String],
        default: []
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    budget: {
        type: Number,
        min: 0
    },
    currency: {
        type: String,
        default: 'PHP',
        maxlength: 3
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 5000
    },
    attachments: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    },
    lastContactDate: {
        type: Date
    },
    nextFollowUpDate: {
        type: Date
    },
    source: {
        type: String,
        trim: true,
        maxlength: 100
    },
    referralBy: {
        type: String,
        trim: true,
        maxlength: 100
    },
    customFields: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes
clientSchema.index({ clientName: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ priority: 1 });
clientSchema.index({ agency: 1 });
clientSchema.index({ assignedTo: 1 });
clientSchema.index({ startDate: 1 });
clientSchema.index({ endDate: 1 });
clientSchema.index({ isActive: 1 });
clientSchema.index({ createdAt: -1 });

// Virtual fields
clientSchema.virtual('fullProjectInfo').get(function () {
    return this.projectName ? `${this.clientName} - ${this.projectName}` : this.clientName;
});

clientSchema.virtual('isOverdue').get(function () {
    if (!this.endDate) return false;
    return new Date(this.endDate) < new Date();
});

clientSchema.virtual('daysRemaining').get(function () {
    if (!this.endDate) return null;
    const today = new Date();
    const endDate = new Date(this.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

clientSchema.virtual('statusColor').get(function () {
    const statusColors = {
        'Active': 'success',
        'Pending': 'warning',
        'Completed': 'info',
        'On Hold': 'secondary',
        'Cancelled': 'danger'
    };
    return statusColors[this.status] || 'secondary';
});

clientSchema.virtual('priorityColor').get(function () {
    const priorityColors = {
        'High': 'danger',
        'Medium': 'warning',
        'Low': 'success'
    };
    return priorityColors[this.priority] || 'secondary';
});

// Instance methods (with different names than virtuals)
clientSchema.methods.getFullProjectInfo = function () {
    return this.projectName ? `${this.clientName} - ${this.projectName}` : this.clientName;
};

clientSchema.methods.checkIfOverdue = function () {
    if (!this.endDate) return false;
    return new Date(this.endDate) < new Date();
};

clientSchema.methods.calculateDaysRemaining = function () {
    if (!this.endDate) return null;
    const today = new Date();
    const endDate = new Date(this.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

clientSchema.methods.getStatusColor = function () {
    const statusColors = {
        'Active': 'success',
        'Pending': 'warning',
        'Completed': 'info',
        'On Hold': 'secondary',
        'Cancelled': 'danger'
    };
    return statusColors[this.status] || 'secondary';
};

clientSchema.methods.getPriorityColor = function () {
    const priorityColors = {
        'High': 'danger',
        'Medium': 'warning',
        'Low': 'success'
    };
    return priorityColors[this.priority] || 'secondary';
};

// Static methods
clientSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};

clientSchema.statics.findByStatus = function (status) {
    return this.find({ status, isActive: true });
};

clientSchema.statics.findByPriority = function (priority) {
    return this.find({ priority, isActive: true });
};

clientSchema.statics.findByAgency = function (agency) {
    return this.find({ agency, isActive: true });
};

clientSchema.statics.findByAssignedUser = function (userId) {
    return this.find({ assignedTo: userId, isActive: true });
};

clientSchema.statics.findOverdue = function () {
    const today = new Date();
    return this.find({
        endDate: { $lt: today },
        status: { $nin: ['Completed', 'Cancelled'] },
        isActive: true
    });
};

clientSchema.statics.findUpcomingDeadlines = function (days = 7) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.find({
        endDate: { $gte: today, $lte: futureDate },
        status: { $nin: ['Completed', 'Cancelled'] },
        isActive: true
    });
};

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;