const Repository = require('../models/Repository');

const getRepository = async (req, res) => {
  try {
    const repo = await Repository.findOne({ team: req.params.teamId })
      .populate('commits.author', 'name email avatar');
    
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCommit = async (req, res) => {
  try {
    const { message, files } = req.body;
    const repo = await Repository.findOne({ team: req.params.teamId });

    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    repo.commits.push({
      message,
      author: req.user._id,
      files: files || []
    });

    await repo.save();

    const updatedRepo = await Repository.findById(repo._id)
      .populate('commits.author', 'name email avatar');

    res.status(201).json(updatedRepo.commits[updatedRepo.commits.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReadme = async (req, res) => {
  try {
    const { content } = req.body;
    const repo = await Repository.findOne({ team: req.params.teamId });

    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    repo.readme = content;
    await repo.save();

    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDocumentation = async (req, res) => {
  try {
    const { notes, progressUpdates } = req.body;
    const repo = await Repository.findOne({ team: req.params.teamId });

    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    if (notes !== undefined) repo.documentation.notes = notes;
    if (progressUpdates !== undefined) repo.documentation.progressUpdates = progressUpdates;

    await repo.save();
    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMeetingSummary = async (req, res) => {
  try {
    const { title, content } = req.body;
    const repo = await Repository.findOne({ team: req.params.teamId });

    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    repo.documentation.meetingSummaries.push({
      title,
      content,
      date: new Date(),
      createdBy: req.user._id
    });

    await repo.save();
    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const repo = await Repository.findOne({ team: req.params.teamId });
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    const newFile = {
      name: req.file.originalname,
      path: `/files/${req.file.filename}`,
      type: 'file',
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      parentPath: req.body.path || '/'
    };

    repo.files.push(newFile);
    await repo.save();

    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const repo = await Repository.findOne({ team: req.params.teamId });
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    repo.files = repo.files.filter(f => f._id.toString() !== req.params.fileId);
    await repo.save();

    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getRepository, createCommit, updateReadme, 
  updateDocumentation, addMeetingSummary, uploadFile, deleteFile 
};