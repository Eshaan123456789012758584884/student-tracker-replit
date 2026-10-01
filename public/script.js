const $ = (selector) => document.querySelector(selector);
let students = [];
const initials = (name) => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
const showToast = (message) => { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500); };

async function loadStudents() {
  try {
    const response = await fetch('/api/students');
    if (!response.ok) throw new Error('Could not load students');
    students = await response.json();
    renderStudents();
  } catch (error) { showToast('⚠️ Add MongoDB connection string to Replit Secrets'); console.error(error); }
}

function renderStudents() {
  const rows = $('#studentRows'); rows.innerHTML = '';
  $('#emptyState').style.display = students.length ? 'none' : 'block';
  students.slice(0, 6).forEach((student) => {
    const attendance = student.attendancePercentage || 0; const marks = student.marksPercentage || 0;
    const row = document.createElement('tr');
    row.innerHTML = `<td><div class="student-name"><span class="student-avatar">${initials(student.name)}</span>${student.name}</div></td><td>${student.className}</td><td><span class="progress"><i style="width:${attendance}%"></i></span>${attendance}%</td><td><span class="progress orange"><i style="width:${marks}%"></i></span>${marks}%</td><td><span class="badge">Active</span></td><td><button class="delete-row outline" data-id="${student._id}" title="Delete" style="border:none;background:none;color:#f46d70;cursor:pointer;font-size:16px;">×</button></td>`;
    rows.appendChild(row);
  });
  
  document.querySelectorAll('.delete-row').forEach((button) => button.addEventListener('click', () => deleteStudent(button.dataset.id)));
  
  $('#totalStudents').textContent = students.length;
  const average = (key) => students.length ? Math.round(students.reduce((sum, item) => sum + (item[key] || 0), 0) / students.length) : 0;
  $('#avgAttendance').textContent = `${average('attendancePercentage')}%`; 
  $('#avgMarks').textContent = `${average('marksPercentage')}%`;
  
  const top = [...students].sort((a, b) => (b.marksPercentage || 0) - (a.marksPercentage || 0))[0]; 
  $('#topPerformer').textContent = top ? top.name.split(' ')[0] : '—';
}

async function deleteStudent(id) { 
  if (!confirm('Delete this student and all related records?')) return; 
  const response = await fetch(`/api/students/${id}`, { method: 'DELETE' }); 
  if (response.ok) { showToast('✅ Student deleted'); loadStudents(); } 
  else showToast('❌ Failed to delete student');
}

function openModal() { $('#studentModal').classList.remove('hidden'); $('#studentForm').querySelector('input').focus(); }
function closeModal() { $('#studentModal').classList.add('hidden'); $('#studentForm').reset(); }

$('#addStudentButton').addEventListener('click', openModal); 
$('#closeModal').addEventListener('click', closeModal); 
$('#cancelModal').addEventListener('click', closeModal);

$('#studentModal').addEventListener('click', (event) => { if (event.target.id === 'studentModal') closeModal(); });

$('#studentForm').addEventListener('submit', async (event) => { 
  event.preventDefault(); 
  const data = Object.fromEntries(new FormData(event.target)); 
  const response = await fetch('/api/students', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  }); 
  const result = await response.json(); 
  if (!response.ok) return showToast('❌ ' + (result.message || 'Unable to save student')); 
  closeModal(); 
  showToast('✅ Student added successfully'); 
  loadStudents(); 
});

document.querySelectorAll('.nav-item[data-section], .action-card').forEach((element) => {
  element.addEventListener('click', () => { 
    const section = element.dataset.section || element.dataset.action; 
    if (section === 'students') document.querySelector('.students-panel').scrollIntoView({ behavior: 'smooth' }); 
    else if (section === 'dashboard') window.scrollTo({ top: 0, behavior: 'smooth' }); 
    else showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} feature coming soon!`); 
  });
});

$('#viewAllButton').addEventListener('click', () => document.querySelector('.students-panel').scrollIntoView({ behavior: 'smooth' }));

loadStudents();
setInterval(loadStudents, 30000);
