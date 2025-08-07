// Admin Dashboard JavaScript
// Updated to match the student dashboard layout with admin controls

// Sample bulletin data
let bulletinData = [
    {
        id: 1,
        title: 'Hostel Fee Payment Reminder',
        category: 'urgent',
        content: 'Monthly fee payment due by January 31st, 2025. Please ensure timely payment to avoid late fees.',
        date: '2025-01-28',
        author: 'Admin'
    },
    {
        id: 2,
        title: 'Mess Menu Updated',
        category: 'general',
        content: 'New vegetarian options added to the weekly menu. Check out the fresh salad bar and new continental dishes.',
        date: '2025-01-26',
        author: 'Admin'
    },
    {
        id: 3,
        title: 'Water Supply Maintenance',
        category: 'maintenance',
        content: 'Water supply will be temporarily suspended on Sunday (Feb 2nd) from 10 AM to 2 PM for pipeline maintenance.',
        date: '2025-01-30',
        author: 'Maintenance'
    },
    {
        id: 4,
        title: 'WiFi Password Updated',
        category: 'important',
        content: 'WiFi password has been updated for security purposes. Please contact the reception for the new credentials.',
        date: '2025-01-29',
        author: 'Admin'
    }
];

// Sample complaints data
let complaintsData = [
    {
        id: 1,
        title: 'AC not working',
        description: 'The air conditioning unit in room A-101 has stopped working since yesterday.',
        room: 'A-101',
        student: 'Ankit Gurjar',
        status: 'pending',
        date: '2025-01-25',
        priority: 'high'
    },
    {
        id: 2,
        title: 'Water leakage in bathroom',
        description: 'There is water leakage from the bathroom ceiling causing inconvenience.',
        room: 'B-202',
        student: 'Neha Sharma',
        status: 'in-progress',
        date: '2025-01-20',
        priority: 'medium'
    },
    {
        id: 3,
        title: 'WiFi connectivity issues',
        description: 'Internet connection is very slow and frequently disconnects.',
        room: 'A-103',
        student: 'Ravi Mehta',
        status: 'resolved',
        date: '2025-01-18',
        priority: 'low'
    }
];

// Room occupancy data (shared with student view)
const roomData = {
    'A-101': { occupants: ['Ankit Gurjar', 'Shivam Bansal', 'Sahitya Patel', 'Anshul Suryavanshi'], status: 'occupied' },
    'A-102': { occupants: ['Priya Patel', 'Sneha Jain', 'Kavya Reddy', ''], status: 'partial' },
    'A-103': { occupants: ['Ravi Mehta', 'Suresh Yadav', '', ''], status: 'partial' },
    'A-104': { occupants: ['Deepak Joshi', 'Manoj Tiwari', 'Pooja Gupta', 'Arjun Mishra'], status: 'occupied' },
    'A-105': { occupants: ['Rohit Agarwal', '', '', ''], status: 'partial' },
    'B-201': { occupants: ['Manish Patel', 'Sachin Verma', 'Nikhil Jain', 'Rajesh Kumar'], status: 'occupied' },
    'B-202': { occupants: ['Neha Sharma', 'Priyanka Singh', '', ''], status: 'partial' },
    'B-203': { occupants: ['Aditya Rao', 'Karan Mehta', 'Vishal Gupta', 'Shubham Joshi'], status: 'occupied' },
    'B-204': { occupants: ['Ritika Agarwal', '', '', ''], status: 'partial' },
    'B-205': { occupants: ['', '', '', ''], status: 'available' }
};

// Mock user database (shared with student view)
const mockUsers = {
    students: {
        'ST001': { password: 'pass123', name: 'ANKIT GURJAR', room: 'A-101' },
        'ST002': { password: 'student123', name: 'SHIVAM BANSAL', room: 'A-101' },
        'ST003': { password: 'mypass456', name: 'SAHITYA PATEL', room: 'A-101' },
        'ST004': { password: 'pass456', name: 'ANSHUL SURYAVANSHI', room: 'A-101' },
        'ST005': { password: 'student789', name: 'AMIT SINGH', room: 'A-102' }
    },
    admins: {
        'admin': { password: 'admin123', name: 'Hostel Administrator', role: 'Super Admin' },
        'warden': { password: 'warden456', name: 'Hostel Warden', role: 'Warden' },
        'maintenance': { password: 'maint789', name: 'Maintenance Head', role: 'Maintenance' }
    }
};

// Bulletin slider variables
let currentSlide = 1;
let totalSlides = 0;

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in as admin
    checkAdminAuth();
    
    // Load dashboard data
    loadDashboardStats();
    loadBulletinData();
    loadComplaintsData();
    loadRoomData();
    
    // Set up bulletin form handler
    document.getElementById('bulletinForm').addEventListener('submit', handleBulletinSubmit);
    
    // Initialize the bulletin slider
    startAutoSlider();
});

// Check admin authentication
function checkAdminAuth() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const user = JSON.parse(loggedInUser);
        if (user.type !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        
        // Update admin name in header
        document.getElementById('adminName').textContent = user.name || 'Admin';
    } catch (e) {
        console.error('Error parsing user data:', e);
        window.location.href = 'index.html';
    }
}

// Load dashboard statistics
function loadDashboardStats() {
    const totalStudents = Object.keys(mockUsers.students).length;
    const totalRooms = Object.keys(roomData).length;
    const pendingComplaints = complaintsData.filter(c => c.status === 'pending').length;
    
    // Calculate occupancy rate
    let occupiedBeds = 0;
    let totalBeds = totalRooms * 4; // Assuming 4 beds per room
    
    Object.values(roomData).forEach(room => {
        occupiedBeds += room.occupants.filter(occupant => occupant.trim() !== '').length;
    });
    
    const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
    
    // Update dashboard stats
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalRooms').textContent = totalRooms;
    document.getElementById('pendingComplaints').textContent = pendingComplaints;
    document.getElementById('occupancyRate').textContent = occupancyRate + '%';
}

// Load bulletin data for slider
function loadBulletinData() {
    const bulletinSlider = document.querySelector('.bulletin-slider');
    const sliderDots = document.querySelector('.slider-dots');
    
    if (!bulletinSlider || !sliderDots) return;
    
    bulletinSlider.innerHTML = '';
    sliderDots.innerHTML = '';
    
    totalSlides = bulletinData.length;
    
    bulletinData.forEach((bulletin, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = 'bulletin-slide';
        slide.innerHTML = `
            <div class="bulletin-item ${bulletin.category}">
                <div class="bulletin-pin"></div>
                <div class="bulletin-header">
                    <span class="bulletin-category ${bulletin.category}">${bulletin.category.toUpperCase()}</span>
                    <span class="bulletin-date">📅 ${formatDate(bulletin.date)}</span>
                </div>
                <strong>${bulletin.title}</strong>
                <p>${bulletin.content}</p>
                <div class="bulletin-footer">
                    <small>- ${bulletin.author}</small>
                </div>
                <div class="bulletin-actions">
                    <button class="action-btn" onclick="editBulletin(${bulletin.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="deleteBulletin(${bulletin.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        bulletinSlider.appendChild(slide);
        
        // Create dot
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.onclick = () => currentSlideGoto(index + 1);
        sliderDots.appendChild(dot);
    });
    
    // Show first slide
    showSlide(1);
}

// Bulletin slider functions
function showSlide(n) {
    const slides = document.getElementsByClassName('bulletin-slide');
    const dots = document.getElementsByClassName('dot');
    
    if (n > totalSlides) currentSlide = 1;
    if (n < 1) currentSlide = totalSlides;
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
    }
    
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
    }
    
    if (slides[currentSlide - 1]) {
        slides[currentSlide - 1].classList.add('active');
    }
    if (dots[currentSlide - 1]) {
        dots[currentSlide - 1].classList.add('active');
    }
}

function nextSlide() {
    currentSlide++;
    showSlide(currentSlide);
}

function previousSlide() {
    currentSlide--;
    showSlide(currentSlide);
}

function currentSlideGoto(n) {
    currentSlide = n;
    showSlide(currentSlide);
}

// Auto slider functionality
function startAutoSlider() {
    setInterval(function() {
        nextSlide();
    }, 5000);
}

// Load complaints data
function loadComplaintsData() {
    const complaintsContainer = document.getElementById('complaintsContainer') || 
                              document.querySelector('.recent-complaints-card > div');
    
    if (!complaintsContainer) return;
    
    complaintsContainer.innerHTML = '';
    
    complaintsData.forEach(complaint => {
        const complaintElement = document.createElement('div');
        complaintElement.className = 'complaint-item';
        complaintElement.setAttribute('data-status', complaint.status);
        
        complaintElement.innerHTML = `
            <div class="complaint-header">
                <strong>${complaint.title}</strong>
                <span class="status-${complaint.status.replace('-', '')}">${complaint.status.replace('-', ' ')}</span>
            </div>
            <div class="complaint-details">
                <small>📅 ${formatDate(complaint.date)}</small>
                <small>🏠 Room ${complaint.room}</small>
            </div>
            <div class="complaint-footer">
                ${complaint.status === 'pending' ? `
                <button class="btn btn-success" onclick="updateComplaintStatus(${complaint.id}, 'in-progress')">
                    <i class="fas fa-play"></i> Start
                </button>
                ` : ''}
                ${complaint.status !== 'resolved' ? `
                <button class="btn btn-primary" onclick="updateComplaintStatus(${complaint.id}, 'resolved')">
                    <i class="fas fa-check"></i> Resolve
                </button>
                ` : ''}
                <button class="btn btn-danger" onclick="deleteComplaint(${complaint.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        complaintsContainer.appendChild(complaintElement);
    });
}

// Load room data
function loadRoomData() {
    const roomsGrid = document.getElementById('roomsGrid') || document.querySelector('.rooms-grid');
    if (!roomsGrid) return;
    
    roomsGrid.innerHTML = '';
    
    Object.entries(roomData).forEach(([roomNumber, room]) => {
        const roomElement = document.createElement('div');
        roomElement.className = 'room-cell';
        
        const occupantsHtml = room.occupants.map(occupant => 
            `<div class="occupant ${occupant.trim() === '' ? 'empty' : ''}">${occupant || '—'}</div>`
        ).join('');
        
        roomElement.innerHTML = `
            <div class="room-header">${roomNumber}</div>
            <div class="room-occupants">${occupantsHtml}</div>
            <div class="room-status ${room.status}">${room.status.charAt(0).toUpperCase() + room.status.slice(1)}</div>
        `;
        
        roomsGrid.appendChild(roomElement);
    });
}

// Load student data
function loadStudentData() {
    const tableBody = document.getElementById('studentsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    Object.entries(mockUsers.students).forEach(([studentId, student]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${studentId}</td>
            <td>${student.name}</td>
            <td>${student.room}</td>
            <td>+91 XXXXXXXXXX</td>
            <td><span class="student-status status-active">Active</span></td>
            <td>
                <button class="action-btn" onclick="viewStudent('${studentId}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="action-btn" onclick="editStudent('${studentId}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Section navigation
function showSection(sectionName) {
    // Hide all admin sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show main content sections
    document.querySelector('.top-row').style.display = 'grid';
    document.querySelector('.room-info-section').style.display = 'block';
    
    // If showing an admin section, hide main content
    if (sectionName !== 'main') {
        document.querySelector('.top-row').style.display = 'none';
        document.querySelector('.room-info-section').style.display = 'none';
        document.getElementById(`${sectionName}-section`).style.display = 'block';
    }
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load section data if needed
    switch(sectionName) {
        case 'students':
            loadStudentData();
            break;
        case 'complaints':
            loadComplaintsData();
            break;
        case 'rooms':
            loadRoomData();
            break;
    }
}

function showMainView() {
    showSection('main');
}

// Bulletin management functions
function showAddBulletinModal() {
    document.getElementById('modalTitle').textContent = 'Add New Notice';
    document.getElementById('bulletinForm').reset();
    document.getElementById('bulletinDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('bulletinModal').style.display = 'block';
}

function closeBulletinModal() {
    document.getElementById('bulletinModal').style.display = 'none';
    // Reset form handler
    document.getElementById('bulletinForm').onsubmit = handleBulletinSubmit;
}

function handleBulletinSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newBulletin = {
        id: Date.now(),
        title: document.getElementById('bulletinTitle').value,
        category: document.getElementById('bulletinCategory').value,
        content: document.getElementById('bulletinContent').value,
        date: document.getElementById('bulletinDate').value,
        author: 'Admin'
    };
    
    // Add to bulletin data
    bulletinData.unshift(newBulletin);
    
    // Reload bulletin data
    loadBulletinData();
    
    // Close modal
    closeBulletinModal();
    
    // Show success message
    alert('Notice added successfully!');
}

function editBulletin(bulletinId) {
    const bulletin = bulletinData.find(b => b.id === bulletinId);
    if (bulletin) {
        document.getElementById('modalTitle').textContent = 'Edit Notice';
        document.getElementById('bulletinTitle').value = bulletin.title;
        document.getElementById('bulletinCategory').value = bulletin.category;
        document.getElementById('bulletinContent').value = bulletin.content;
        document.getElementById('bulletinDate').value = bulletin.date;
        document.getElementById('bulletinModal').style.display = 'block';
        
        // Update form to handle edit
        document.getElementById('bulletinForm').onsubmit = function(e) {
            e.preventDefault();
            
            // Update bulletin data
            const index = bulletinData.findIndex(b => b.id === bulletinId);
            if (index !== -1) {
                bulletinData[index] = {
                    ...bulletin,
                    title: document.getElementById('bulletinTitle').value,
                    category: document.getElementById('bulletinCategory').value,
                    content: document.getElementById('bulletinContent').value,
                    date: document.getElementById('bulletinDate').value
                };
                
                loadBulletinData();
                closeBulletinModal();
                alert('Notice updated successfully!');
            }
            
            // Reset form handler
            document.getElementById('bulletinForm').onsubmit = handleBulletinSubmit;
        };
    }
}

function deleteBulletin(bulletinId) {
    if (confirm('Are you sure you want to delete this notice?')) {
        bulletinData = bulletinData.filter(b => b.id !== bulletinId);
        loadBulletinData();
        alert('Notice deleted successfully!');
    }
}

// Student management functions
function searchStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#studentsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function viewStudent(studentId) {
    const student = mockUsers.students[studentId];
    if (student) {
        document.getElementById('studentDetails').innerHTML = `
            <div class="student-profile">
                <h3>${student.name}</h3>
                <p><strong>Student ID:</strong> ${studentId}</p>
                <p><strong>Room:</strong> ${student.room}</p>
                <p><strong>Contact:</strong> +91 XXXXXXXXXX</p>
                <p><strong>Status:</strong> Active</p>
                <p><strong>Join Date:</strong> August 2024</p>
                <p><strong>Guardian Contact:</strong> +91 XXXXXXXXXX</p>
            </div>
        `;
        document.getElementById('studentModal').style.display = 'block';
    }
}

function closeStudentModal() {
    document.getElementById('studentModal').style.display = 'none';
}

function editStudent(studentId) {
    alert('Edit student functionality would open a form to modify student details.');
    // In a real application, this would open a form to edit student details
}

// Complaint management functions
function filterComplaints(status) {
    const complaints = document.querySelectorAll('.complaint-item');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter complaints
    complaints.forEach(complaint => {
        if (status === 'all' || complaint.getAttribute('data-status') === status) {
            complaint.style.display = 'block';
        } else {
            complaint.style.display = 'none';
        }
    });
}

function updateComplaintStatus(complaintId, newStatus) {
    const complaint = complaintsData.find(c => c.id === complaintId);
    if (complaint) {
        complaint.status = newStatus;
        loadComplaintsData();
        loadDashboardStats(); // Update pending complaints count
        alert(`Complaint status updated to ${newStatus}!`);
    }
}

function deleteComplaint(complaintId) {
    if (confirm('Are you sure you want to delete this complaint?')) {
        complaintsData = complaintsData.filter(c => c.id !== complaintId);
        loadComplaintsData();
        loadDashboardStats();
        alert('Complaint deleted successfully!');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showProfile() {
    alert('Profile management functionality would be implemented here.');
}

function logout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    }
}


// Close modals when clicking outside
window.onclick = function(event) {
    const bulletinModal = document.getElementById('bulletinModal');
    const studentModal = document.getElementById('studentModal');
    
    if (event.target === bulletinModal) {
        closeBulletinModal();
    }
    if (event.target === studentModal) {
        closeStudentModal();
    }
};

// Export functions for global access
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.currentSlideGoto = currentSlideGoto;
window.showAddBulletinModal = showAddBulletinModal;
window.closeBulletinModal = closeBulletinModal;
window.editBulletin = editBulletin;
window.deleteBulletin = deleteBulletin;
window.viewStudent = viewStudent;
window.closeStudentModal = closeStudentModal;
window.editStudent = editStudent;
window.filterComplaints = filterComplaints;
window.updateComplaintStatus = updateComplaintStatus;
window.deleteComplaint = deleteComplaint;
window.showProfile = showProfile;
window.logout = logout;
window.showSection = showSection;
window.showMainView = showMainView;
window.searchStudents = searchStudents;