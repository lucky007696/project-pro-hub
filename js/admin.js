// Check protocol
if (window.location.protocol === 'file:') {
  alert('Admin panel requires running via a server (http://localhost:3000) for API access. File protocol is not supported.');
}

// Global Admin Pass
window.__adminPass = '';

// === AUTHENTICATION ===
document.getElementById('btn-login').addEventListener('click', async () => {
  const pass = document.getElementById('admin-pass').value.trim();
  if (!pass) return;

  const btn = document.getElementById('btn-login');
  btn.textContent = 'Verifying...';

  try {
    const res = await fetch('/api/users', { headers: { 'x-admin-password': pass } });
    if (!res.ok) throw new Error();

    window.__adminPass = pass;
    document.getElementById('login-overlay').classList.add('hide');
    document.getElementById('admin-wrapper').classList.remove('hide');
    loadAll();
  } catch (e) {
    document.getElementById('login-error').style.display = 'block';
    setTimeout(() => document.getElementById('login-error').style.display = 'none', 3000);
    btn.textContent = 'Unlock Dashboard';
  }
});

// === NAVIGATION ===
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (btn.id === 'btn-logout') return location.reload();

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const targetId = btn.getAttribute('data-target');
    document.getElementById(targetId).classList.add('active');
  });
});

// === DATA LOADING ===
async function fetchAdmin(path) {
  const res = await fetch(path, { headers: { 'x-admin-password': window.__adminPass || '' } });
  if (!res.ok) throw new Error('Unauthorized or error');
  return res.json();
}

async function loadAll() {
  const [usersRes, sessionsRes, hiresRes, bulkRes, loginsRes] = await Promise.all([
    fetchAdmin('/api/users'),
    fetchAdmin('/api/sessions'),
    fetchAdmin('/api/hires'),
    fetchAdmin('/api/bulk-quotes'),
    fetchAdmin('/api/logins')
  ]);

  populateTable('users-table', usersRes.users);
  populateTable('sessions-table', sessionsRes.sessions);
  populateTable('hires-table', hiresRes.hires);
  populateTable('bulk-table', bulkRes.bulkQuotes);
  populateTable('logins-table', loginsRes.logins);

  const [projectsRes, coursesRes, statsRes] = await Promise.all([
    fetchAdmin('/api/projects'),
    fetchAdmin('/api/courses'),
    fetchAdmin('/api/stats')
  ]);
  populateTable('projects-table', projectsRes.projects);
  populateTable('courses-table', coursesRes.courses);

  const statsEl = document.getElementById('stats');
  let currentTotalVisits = statsRes.totalVisits || 0;

  // Initialize Socket for Admin
  if (typeof io !== 'undefined') {
    const socket = io();
    socket.on('visitorUpdate', (data) => {
      // Handle both old format (count) and new format (active, total)
      const active = data.active !== undefined ? data.active : data.count;
      const total = data.total !== undefined ? data.total : currentTotalVisits;
      updateStats(usersRes.users.length, sessionsRes.sessions.length, projectsRes.projects.length, coursesRes.courses.length, active, total);
    });
  }

  updateStats(usersRes.users.length, sessionsRes.sessions.length, projectsRes.projects.length, coursesRes.courses.length, '...', currentTotalVisits);
}

function updateStats(users, sessions, projects, courses, active, total) {
  const statsEl = document.getElementById('stats');
  statsEl.innerHTML = `
        <div style="display:flex; gap: 20px; align-items:center; margin-bottom: 10px;">
            <span style="color: #4ade80;">● Live: <b>${active}</b></span>
            <span style="color: #60a5fa;">👁 Total: <b>${total}</b></span>
        </div>
        <div style="font-size: 0.9rem; color: #94a3b8;">
            Users: ${users} · Sessions: ${sessions} · Projects: ${projects} · Courses: ${courses}
        </div>
    `;
}

// === DRAWER LOGIC ===
const drawerBackdrop = document.getElementById('drawer-backdrop');
const sideDrawer = document.getElementById('side-drawer');
const drawerContent = document.getElementById('drawer-content');
const drawerTitle = document.getElementById('drawer-title');

function openDrawer(title, templateId, rowData = null) {
  drawerTitle.textContent = title;

  // Cone template
  const template = document.getElementById(templateId).innerHTML;
  drawerContent.innerHTML = template;

  // Show Drawer
  drawerBackdrop.classList.add('open');
  sideDrawer.classList.add('open');

  // Wire up Close buttons
  drawerContent.querySelectorAll('.close-drawer-btn').forEach(btn => {
    btn.addEventListener('click', closeDrawer);
  });

  // Populate Data if editing
  if (rowData) {
    const form = drawerContent.querySelector('form');
    populateFormFields(form, rowData);
  }

  // Attach Form Submit Listener
  const form = drawerContent.querySelector('form');
  // Determine endpoint based on form ID
  // Use getAttribute because form.id is shadowed by input named "id"
  const formId = form.getAttribute('id');
  let endpoint = '';
  if (formId === 'add-project-form') endpoint = '/api/projects';
  if (formId === 'add-course-form') endpoint = '/api/courses';

  if (!endpoint) {
    console.error('Unknown form ID:', formId);
    return;
  }

  attachFormSubmit(form, endpoint);

  // Attach Upload Handler if project form
  if (form.getAttribute('id') === 'add-project-form') {
    const uploadBtn = form.querySelector('#upload-project-btn');
    uploadBtn.addEventListener('click', () => handleUpload(form));
  }
}

function closeDrawer() {
  sideDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('open');
  setTimeout(() => {
    drawerContent.innerHTML = ''; // Cleanup
  }, 300);
}

document.getElementById('close-drawer').addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', (e) => {
  if (e.target === drawerBackdrop) closeDrawer();
});

// Wire 'Add New' Buttons
document.getElementById('open-add-project').addEventListener('click', () => {
  openDrawer('Add New Project', 'project-form-template');
});

document.getElementById('open-add-course').addEventListener('click', () => {
  openDrawer('Add New Course', 'course-form-template');
});


// === FORM HANDLING ===

function populateFormFields(form, data) {
  // Set ID
  const idInput = form.querySelector('[name="id"]');
  if (idInput) idInput.value = data._id || data.id;

  // Set other fields
  Object.keys(data).forEach(key => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = data[key];
      } else if (input.tagName === 'SELECT') {
        input.value = data[key];
      } else {
        // Handle arrays (tags/features)
        if (Array.isArray(data[key])) {
          input.value = data[key].join(', ');
        } else {
          input.value = data[key];
        }
      }
    }
  });

  // Handle Image Preview
  if (data.image && form.getAttribute('id') === 'add-project-form') {
    form.querySelector('#project-image-preview').textContent = `Current: ${data.image}`;
  }
}

function attachFormSubmit(form, endpoint) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    const id = form.querySelector('[name="id"]').value;
    const isEdit = !!id;

    btn.textContent = 'Saving...';
    btn.disabled = true;

    btn.textContent = 'Saving...';
    btn.disabled = true;

    // Auto-Upload Image if selected (UX Fix)
    if (form.getAttribute('id') === 'add-project-form') {
      const fileInput = form.querySelector('#project-file');
      if (fileInput && fileInput.files.length > 0) {
        try {
          await handleUpload(form, true); // Silent upload
        } catch (e) {
          alert('Failed to upload image. Save cancelled.');
          btn.textContent = originalText;
          btn.disabled = false;
          return;
        }
      }
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Process Types
    // Use getAttribute because form.id is shadowed
    if (form.getAttribute('id') === 'add-project-form') {
      data.featured = form.querySelector('[name="featured"]').checked;
      data.tags = data.tags ? data.tags.split(',').map(s => s.trim()) : [];
      data.priority = parseInt(data.priority) || 0;
    }
    if (form.getAttribute('id') === 'add-course-form') {
      data.features = data.features ? data.features.split(',').map(s => s.trim()) : [];
    }

    const url = isEdit ? `${endpoint}/${id}` : endpoint;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': window.__adminPass || ''
        },
        body: JSON.stringify(data)
      });





      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errJson = await res.json();
          throw new Error(errJson.error || 'Failed to save');
        } else {
          const text = await res.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned non-JSON response: ' + text.substring(0, 100));
        }
      }

      alert(isEdit ? 'Updated successfully!' : 'Added successfully!');
      closeDrawer();
      await loadAll();
    } catch (error) {
      console.error(error);
      alert('Error saving item: ' + error.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

async function handleUpload(form, silent = false) {
  const fileInput = form.querySelector('#project-file');
  const file = fileInput.files[0];
  if (!file) {
    if (!silent) alert('Select a file first');
    return;
  }

  const btn = form.querySelector('#upload-project-btn');
  btn.textContent = '...';
  btn.disabled = true;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-password': window.__adminPass || '' },
      body: formData
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');

    form.querySelector('#project-image-url').value = json.url;
    form.querySelector('#project-image-preview').textContent = `Uploaded: ${json.url}`;
    if (!silent) alert('Image uploaded!');
    return json.url;
  } catch (e) {
    console.error(e);
    if (!silent) alert('Upload failed');
    throw e;
  } finally {
    btn.textContent = 'Upload';
    btn.disabled = false;
  }
}


// === TABLE RENDERING ===

function populateTable(id, data) {
  const tbody = document.querySelector(`#${id} tbody`);
  tbody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');

    // Custom rendering based on table type
    if (id === 'projects-table') {
      tr.innerHTML = `
                <td><img src="${row.image}" style="width:50px; height:30px; object-fit:cover; border-radius:4px;"></td>
                <td>${row.title}</td>
                <td><span style="padding: 2px 8px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-radius: 4px; font-size: 0.8rem;">${row.category}</span></td>
                <td>${row.featured ? '⭐' : '-'}</td>
            `;
    } else if (id === 'courses-table') {
      tr.innerHTML = `
                <td>${row.title}</td>
                <td>${row.level}</td>
                <td>${row.duration}</td>
      `;
    } else if (id === 'sessions-table') {
      tr.innerHTML = `
                <td>${row.name}</td>
                <td>${row.sessionType}</td>
                <td>${new Date(row.bookedAt).toLocaleString()}</td>
      `;
    } else {
      // Default generic render
      Object.values(row).slice(0, 4).forEach(val => {
        const td = document.createElement('td');
        td.textContent = (val !== null && val !== undefined) ? String(val) : '';
        tr.appendChild(td);
      });
    }

    // Action Column
    const actionTd = document.createElement('td');

    // Edit Button (Only for Projects/Courses)
    if (id === 'projects-table' || id === 'courses-table') {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'btn';
      editBtn.style.marginRight = '0.5rem';
      editBtn.style.fontSize = '0.8rem';
      editBtn.style.padding = '0.4rem 0.8rem';
      editBtn.addEventListener('click', () => {
        if (id === 'projects-table') openDrawer('Edit Project', 'project-form-template', row);
        if (id === 'courses-table') openDrawer('Edit Course', 'course-form-template', row);
      });
      actionTd.appendChild(editBtn);
    }

    // Delete Button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'btn danger';
    delBtn.style.fontSize = '0.8rem';
    delBtn.style.padding = '0.4rem 0.8rem';
    delBtn.addEventListener('click', async () => handleDelete(id, row));

    actionTd.appendChild(delBtn);
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });
}

async function handleDelete(tableId, row) {
  if (!confirm('Delete this entry?')) return;
  try {
    let endpoint = '/api/';
    if (tableId === 'users-table') endpoint += `users / ${row._id} `; // Check ID keys carefully in your DB
    else if (tableId === 'sessions-table') endpoint += `sessions / ${row._id} `;
    else if (tableId === 'hires-table') endpoint += `hires / ${row._id} `;
    else if (tableId === 'bulk-table') endpoint += `bulk - quotes / ${row._id} `;
    else if (tableId === 'logins-table') endpoint += `logins / ${row._id} `;
    else if (tableId === 'projects-table') endpoint += `projects / ${row._id} `;
    else if (tableId === 'courses-table') endpoint += `courses / ${row._id} `;

    // Fallback for different ID keys if necessary
    // In Mongoose it's usually _id

    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'x-admin-password': window.__adminPass || '' }
    });

    if (!res.ok) throw new Error('Delete failed');
    // alert('Deleted');
    await loadAll();
  } catch (e) {
    console.error(e);
    alert('Delete failed');
  }
}

// === EXPORT LOGIC ===
function toCSV(arr) {
  if (!arr || !arr.length) return '';
  const keys = Object.keys(arr[0]);
  const rows = [keys.join(',')];
  arr.forEach(item => {
    rows.push(keys.map(k => `"${String(item[k] ?? '').replace(/"/g, '""')}"`).join(','));
  });
  return rows.join('\n');
}

async function exportData(endpoint, filename) {
  try {
    const res = await fetch(endpoint, { headers: { 'x-admin-password': window.__adminPass || '' } });
    if (!res.ok) throw new Error('Fetch failed');
    const json = await res.json();
    const arr = Object.values(json)[0];
    const csv = toCSV(arr);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e); alert('Export failed: ' + e.message);
  }
}

document.getElementById('export-users').addEventListener('click', () => exportData('/api/users', 'users.csv'));
document.getElementById('export-sessions').addEventListener('click', () => exportData('/api/sessions', 'sessions.csv'));
document.getElementById('export-hires').addEventListener('click', () => exportData('/api/hires', 'hires.csv'));
document.getElementById('export-bulk').addEventListener('click', () => exportData('/api/bulk-quotes', 'bulk_quotes.csv'));
document.getElementById('export-logins').addEventListener('click', () => exportData('/api/logins', 'logins.csv'));

// Simple filter
document.getElementById('users-filter').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('#users-table tbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});
