const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI not set! Add it to Replit Secrets');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB Connected Successfully!');
}).catch((error) => {
  console.error('❌ MongoDB Connection Error:', error.message);
  process.exit(1);
});

// Student Schema
const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  className: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true }
});

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  exam: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  maximumMarks: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Marks = mongoose.model('Marks', marksSchema);

// API Routes
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    const ids = students.map(s => s._id);
    
    const attendance = await Attendance.aggregate([
      { $match: { studentId: { $in: ids } } },
      { $group: { _id: '$studentId', total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } } } }
    ]);
    
    const marks = await Marks.aggregate([
      { $match: { studentId: { $in: ids } } },
      { $group: { _id: '$studentId', obtained: { $sum: '$marksObtained' }, maximum: { $sum: '$maximumMarks' } } }
    ]);
    
    const attendanceMap = new Map(attendance.map(a => [String(a._id), a]));
    const marksMap = new Map(marks.map(m => [String(m._id), m]));
    
    const result = students.map(student => {
      const a = attendanceMap.get(String(student._id)) || { total: 0, present: 0 };
      const m = marksMap.get(String(student._id)) || { obtained: 0, maximum: 0 };
      return {
        ...student.toObject(),
        attendancePercentage: a.total ? Math.round((a.present / a.total) * 100) : 0,
        marksPercentage: m.maximum ? Math.round((m.obtained / m.maximum) * 100) : 0
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await Attendance.deleteMany({ studentId: student._id });
    await Marks.deleteMany({ studentId: student._id });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/attendance', async (req, res) => {
  try {
    const records = await Attendance.find().populate('studentId', 'name').sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const record = new Attendance(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/marks', async (req, res) => {
  try {
    const records = await Marks.find().populate('studentId', 'name').sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/marks', async (req, res) => {
  try {
    const record = new Marks(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Open the Replit webview to access the dashboard`);
});
