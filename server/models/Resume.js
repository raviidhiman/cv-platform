const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, default: '' },
});

const sectionStyleSchema = new mongoose.Schema({
  font: { type: String, default: 'garamond' },
  size: { type: String, default: 'medium' },
  bold: { type: Boolean, default: false },
  italic: { type: Boolean, default: false },
  align: { type: String, default: 'left' },
});

const educationSchema = new mongoose.Schema({
  institution: String, degree: String, field: String,
  startYear: String, endYear: String, grade: String, location: String,
  customFields: [customFieldSchema],
  order: { type: Number, default: 0 },
});

const experienceSchema = new mongoose.Schema({
  company: String, role: String, startDate: String,
  endDate: String, location: String, bullets: [String],
  customFields: [customFieldSchema],
  order: { type: Number, default: 0 },
});

const projectSchema = new mongoose.Schema({
  title: String, description: String, tech: [String],
  github: String, link: String,
  customFields: [customFieldSchema],
  order: { type: Number, default: 0 },
});

const skillSchema = new mongoose.Schema({
  category: String, items: [String],
  customFields: [customFieldSchema],
  order: { type: Number, default: 0 },
});

const achievementSchema = new mongoose.Schema({
  title: String, description: String, year: String,
  customFields: [customFieldSchema],
  order: { type: Number, default: 0 },
});

const customSectionSchema = new mongoose.Schema({
  title: String,
  entries: [{ fields: [customFieldSchema], order: { type: Number, default: 0 } }],
  order: { type: Number, default: 0 },
});

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  settings: {
    enabledTemplates: { type: [String], default: ['classic','modern','creative','minimal','executive'] },
    defaultTemplate: { type: String, default: 'classic' },
    globalFont: { type: String, default: 'garamond' },
    primaryColor: { type: String, default: '#000000' },
    showPhoto: { type: Boolean, default: true },
    fontSize: { type: String, default: 'medium' },
    globalBold: { type: Boolean, default: false },
    globalItalic: { type: Boolean, default: false },
  },
  sectionStyles: {
    personal: { type: sectionStyleSchema, default: () => ({}) },
    education: { type: sectionStyleSchema, default: () => ({}) },
    experience: { type: sectionStyleSchema, default: () => ({}) },
    projects: { type: sectionStyleSchema, default: () => ({}) },
    skills: { type: sectionStyleSchema, default: () => ({}) },
    achievements: { type: sectionStyleSchema, default: () => ({}) },
  },
  personal: {
    name: { type: String, default: '' }, email: { type: String, default: '' },
    phone: { type: String, default: '' }, location: { type: String, default: '' },
    linkedin: { type: String, default: '' }, github: { type: String, default: '' },
    website: { type: String, default: '' }, summary: { type: String, default: '' },
    photo: { type: String, default: '' }, customFields: [customFieldSchema],
  },
  education: [educationSchema],
  experience: [experienceSchema],
  projects: [projectSchema],
  skills: [skillSchema],
  achievements: [achievementSchema],
  customSections: [customSectionSchema],
  sectionOrder: { type: [String], default: ['education','experience','projects','skills','achievements'] },
  visibleSections: { type: [String], default: ['education','experience','projects','skills','achievements'] },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
