const BusinessProfile = require('../models/BusinessProfile');
const businessConfigService = require('../services/businessConfigService');

exports.getConfig = (req, res) => {
  res.json(businessConfigService.getModuleMap());
};

exports.getFullConfig = (req, res) => {
  const config = businessConfigService.getConfig();
  const publicConfig = {};
  Object.entries(config).forEach(([type, val]) => {
    publicConfig[type] = {
      label: val.label,
      emoji: val.emoji,
      modules: val.modules,
      supplyKeywords: val.supplyKeywords
    };
  });
  res.json(publicConfig);
};

exports.createProfile = async (req, res) => {
  try {
    const { name, businessType, ownerName, address, phone, email } = req.body;
    const existing = await BusinessProfile.findOne({ name, businessType });
    if (existing) return res.json(existing);
    const profile = await BusinessProfile.create({ name, businessType, ownerName, address, phone, email });
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await BusinessProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const config = businessConfigService.getBusinessConfig(profile.businessType);
    res.json({ profile, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listProfiles = async (req, res) => {
  try {
    const profiles = await BusinessProfile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
