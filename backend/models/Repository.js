const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: String,
  path: String,
  type: {
    type: String,
    enum: ['file', 'folder'],
    default: 'file'
  },
  mimeType: String,
  size: Number,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  parentPath: {
    type: String,
    default: '/'
  }
});

const commitSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Commit message is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    name: String,
    action: {
      type: String,
      enum: ['add', 'modify', 'delete'],
      default: 'add'
    }
  }],
  hash: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

const repositorySchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    unique: true
  },
  files: [fileSchema],
  commits: [commitSchema],
  readme: {
    type: String,
    default: '# Project Title\n\nProject description goes here.'
  },
  documentation: {
    notes: {
      type: String,
      default: ''
    },
    progressUpdates: {
      type: String,
      default: ''
    },
    meetingSummaries: [{
      title: String,
      content: String,
      date: Date,
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  }
}, {
  timestamps: true
});

commitSchema.pre('save', function(next) {
  if (!this.hash) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.hash = `${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Repository', repositorySchema);