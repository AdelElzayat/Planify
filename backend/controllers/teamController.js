const Team = require('../models/Team');
const User = require('../models/User');
const Repository = require('../models/Repository');
const { createNotification } = require('./notificationController');

const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      leader: req.user._id,
      members: [{ user: req.user._id, role: 'leader' }]
    });

    await Repository.create({ team: team._id });

    await User.findByIdAndUpdate(req.user._id, {
      team: team._id,
      teamRole: 'leader'
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const team = await Team.findOne({ inviteCode });

    if (!team) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    if (team.status !== 'active') {
      return res.status(400).json({ message: 'Team is not active' });
    }

    if (team.members.length >= 10) {
      return res.status(400).json({ message: 'Team has reached maximum capacity of 10 members' });
    }

    const alreadyMember = team.members.find(
      m => m.user.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'Already a member of this team' });
    }

    team.members.push({ user: req.user._id, role: 'member' });
    await team.save();

    await User.findByIdAndUpdate(req.user._id, {
      team: team._id,
      teamRole: 'member'
    });

    // Notify team leader
    await createNotification(
      team.leader,
      'member_joined',
      'New Team Member',
      `${req.user.name} joined your team`,
      { teamId: team._id },
      team._id
    );

    // Notify the user who joined
    await createNotification(
      req.user._id,
      'team_invite',
      'Welcome to the Team!',
      `You have successfully joined ${team.name}`,
      { teamId: team._id },
      team._id
    );

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name email avatar department universityId')
      .populate('leader', 'name email avatar')
      .populate('supervisor', 'name email avatar');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ 'members.user': req.user._id })
      .populate('members.user', 'name email avatar department universityId')
      .populate('leader', 'name email avatar')
      .populate('supervisor', 'name email avatar');

    if (!team) {
      return res.status(404).json({ message: 'You are not in a team' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team leader can update team' });
    }

    const { name, description, logo } = req.body;
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (logo !== undefined) team.logo = logo;

    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team leader can remove members' });
    }

    const memberId = req.params.memberId;
    team.members = team.members.filter(
      m => m.user.toString() !== memberId
    );
    await team.save();

    await User.findByIdAndUpdate(memberId, {
      team: null,
      teamRole: 'none'
    });

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const inviteMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team leader can invite members' });
    }

    res.json({ inviteCode: team.inviteCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignSupervisor = async (req, res) => {
  try {
    const { supervisorId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team leader can assign supervisor' });
    }

    const supervisor = await User.findById(supervisorId);
    if (!supervisor || !supervisor.isSupervisor) {
      return res.status(400).json({ message: 'Invalid supervisor' });
    }

    team.supervisor = supervisorId;
    await team.save();

    if (!supervisor.supervisedTeams.includes(team._id)) {
      supervisor.supervisedTeams.push(team._id);
      await supervisor.save();
    }

    // Notify supervisor
    await createNotification(
      supervisorId,
      'supervisor_feedback',
      'Supervisor Assigned',
      `You have been assigned as supervisor for ${team.name}`,
      { teamId: team._id },
      team._id
    );

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMilestone = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.milestones.push({ title, description, dueDate });
    await team.save();

    // Notify all team members about new milestone
    team.members.forEach(member => {
      createNotification(
        member.user,
        'milestone',
        'New Milestone',
        `New milestone "${title}" added to your team`,
        { teamId: team._id, milestoneTitle: title },
        team._id
      );
    });

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeMilestone = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const milestone = team.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    milestone.completed = true;
    milestone.completedAt = new Date();
    await team.save();

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTeams = async (req, res) => {
  try {
    let teams;
    if (req.user.isSupervisor) {
      teams = await Team.find({ supervisor: req.user._id })
        .populate('members.user', 'name email')
        .populate('leader', 'name email');
    } else {
      teams = await Team.find({})
        .populate('leader', 'name email')
        .limit(50);
    }
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeam,
  joinTeam,
  getTeam,
  getMyTeam,
  updateTeam,
  removeMember,
  inviteMember,
  assignSupervisor,
  addMilestone,
  completeMilestone,
  getAllTeams
};