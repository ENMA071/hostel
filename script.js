// Global variables
let currentSlide = 1;
const totalSlides = 4;

// Mock user database (In real application, this would be handled by backend)
const mockUsers = {
    students: {
        'ST001': { password: 'pass123', name: 'ANKIT GURJAR', room: 'A-101' },
        'ST002': { password: 'student123', name: 'RAHUL SHARMA', room: 'A-101' },
        'ST003': { password: 'mypass456', name: 'PRIYA PATEL', room: 'A-102' },
        'ST004': { password: 'pass456', name: 'VIKASH KUMAR', room: 'A-101' },
        'ST005': { password: 'student789', name: 'AMIT SINGH', room: 'A-101' }
    },
    admins: {
        'admin': { password: 'admin123', name: 'Hostel Administrator', role: 'Super Admin' },
        'warden': { password: 'warden456', name: 'Hostel Warden', role: 'Warden' },
        'maintenance': { password: 'maint789', name: 'Maintenance Head', role: 'Maintenance' }
    }
};

// Room occupancy data
const roomData = {
    'A-101': { occupants: ['Ankit Gurjar', 'Rahul Sharma', 'Vikash Kumar', 'Amit Singh'], status: 'occupied' },
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

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    startAutoSlider();
    handleHeaderImage();
    setupFormValidation();
    updateRoomDisplay();
});

// Handle header image/logo loading
function handleHeaderImage() {
    const headerLogo = document.getElementById('headerLogo');
    const placeholder = document.getElementById('logoPlaceholder');
    
    if (headerLogo) {
        headerLogo.onload = function() {
            // Image loaded successfully, hide placeholder
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            headerLogo.style.display = 'block';
        };
        
        headerLogo.onerror = function() {
            // Image failed to load, show placeholder
            if (placeholder) {
                placeholder.style.display = 'flex';
            }
            headerLogo.style.display = 'none';
        };
        
        // Check if image is already loaded (cached)
        if (headerLogo.complete && headerLogo.naturalHeight !== 0) {
            headerLogo.onload();
        } else {
            // If image source is empty or invalid, show placeholder
            if (!headerLogo.src || headerLogo.src.includes('image.jpg')) {
                headerLogo.onerror();
            }
        }
    }
}

// Initialize page functionality
function initializePage() {
    console.log('Hostel Management System Initialized');
    loadStudentData();
    updateDateTime();
    loadRecentComplaints();
}

// Update room display based on data
function updateRoomDisplay() {
    const roomsGrid = document.querySelector('.rooms-grid');
    if (!roomsGrid) return;
    
    roomsGrid.innerHTML = '';
    
    Object.keys(roomData).forEach(roomNumber => {
        const room = roomData[roomNumber];
        const roomCell = document.createElement('div');
        roomCell.className = 'room-cell';
        
        const occupantsHtml = room.occupants.map(occupant => 
            `<div class="occupant${occupant === '' ? ' empty' : ''}">${occupant || '-'}</div>`
        ).join('');
        
        roomCell.innerHTML = `
            <div class="room-header">${roomNumber}</div>
            <div class="room-occupants">
                ${occupantsHtml}
            </div>
            <div class="room-status ${room.status}">${room.status.charAt(0).toUpperCase() + room.status.slice(1)}</div>
        `;
        
        roomsGrid.appendChild(roomCell);
    });
}

// Setup form validation
function setupFormValidation() {
    const studentForm = document.getElementById('studentLoginForm');
    const adminForm = document.getElementById('adminLoginForm');
    
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentLogin);
    }
    
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
}

// Bulletin Board Slider Functions
function showSlide(n) {
    const slides = document.getElementsByClassName('bulletin-slide');
    const dots = document.getElementsByClassName('dot');
    
    if (n > totalSlides) currentSlide = 1;
    if (n < 1) currentSlide = totalSlides;
    
    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
    }
    
    // Remove active from all dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
    }
    
    // Show current slide and activate dot
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
    }, 5000); // Change slide every 5 seconds
}

// Login Modal Functions
function openStudentLogin() {
    const modal = document.getElementById('studentLoginModal');
    
    modal.style.display = 'block';
    clearFormErrors('student');
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input[type="text"]');
        if (firstInput) firstInput.focus();
    }, 100);
}

function closeStudentLogin() {
    const modal = document.getElementById('studentLoginModal');
    modal.style.display = 'none';
    clearForm('studentLoginForm');
    clearFormErrors('student');
}

function openAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    
    modal.style.display = 'block';
    clearFormErrors('admin');
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input[type="text"]');
        if (firstInput) firstInput.focus();
    }, 100);
}

function closeAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    modal.style.display = 'none';
    clearForm('adminLoginForm');
    clearFormErrors('admin');
}

// Success Modal Functions
function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    const messageElement = document.getElementById('successMessage');
    
    messageElement.textContent = message;
    modal.style.display = 'block';
    
    // Auto close after 3 seconds
    setTimeout(() => {
        closeSuccessModal();
    }, 3000);
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
}

// Form handling functions
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

function clearFormErrors(type) {
    const errorDiv = document.getElementById(type + 'LoginError');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    }
}

function showFormError(type, message) {
    const errorDiv = document.getElementById(type + 'LoginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<div class="loading-spinner"></div>Logging in...';
    } else {
        button.disabled = false;
        button.innerHTML = 'Login';
    }
}

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateStudentId(studentId) {
    // Student ID should be alphanumeric and at least 3 characters
    const studentIdRegex = /^[A-Z0-9]{3,}$/i;
    return studentIdRegex.test(studentId);
}

function validatePassword(password) {
    // Password should be at least 6 characters
    return password && password.length >= 6;
}

// Handle login submissions
function handleStudentLogin(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value.trim();
    const password = document.getElementById('studentPassword').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Clear previous errors
    clearFormErrors('student');
    
    // Validate inputs
    if (!studentId) {
        showFormError('student', 'Please enter your Student ID');
        return;
    }
    
    if (!validateStudentId(studentId)) {
        showFormError('student', 'Please enter a valid Student ID (at least 3 characters)');
        return;
    }
    
    if (!password) {
        showFormError('student', 'Please enter your password');
        return;
    }
    
    if (!validatePassword(password)) {
        showFormError('student', 'Password must be at least 6 characters long');
        return;
    }
    
    // Set loading state
    setButtonLoading(submitButton, true);
    
    // Simulate API call delay
    setTimeout(() => {
        // Check credentials
        const user = mockUsers.students[studentId.toUpperCase()];
        
        if (user && user.password === password) {
            // Login successful
            console.log('Student login successful:', { studentId: studentId.toUpperCase(), name: user.name });
            
            // Store login session
            sessionStorage.setItem('loggedInUser', JSON.stringify({
                type: 'student',
                id: studentId.toUpperCase(),
                name: user.name,
                room: user.room
            }));
            
            setButtonLoading(submitButton, false);
            closeStudentLogin();
            showSuccessModal(`Welcome back, ${user.name}! You have been logged in successfully.`);
            
            // Update UI for logged in user
            updateUIForLoggedInUser('student', user);
            
            // Handle any pending actions
            handlePendingAction();
            
        } else {
            // Login failed
            setButtonLoading(submitButton, false);
            showFormError('student', 'Invalid Student ID or password. Please try again.');
        }
    }, 1500); // Simulate network delay
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Clear previous errors
    clearFormErrors('admin');
    
    // Validate inputs
    if (!username) {
        showFormError('admin', 'Please enter your username');
        return;
    }
    
    if (!password) {
        showFormError('admin', 'Please enter your password');
        return;
    }
    
    if (!validatePassword(password)) {
        showFormError('admin', 'Password must be at least 6 characters long');
        return;
    }
    
    // Set loading state
    setButtonLoading(submitButton, true);
    
    // Simulate API call delay
    setTimeout(() => {
        // Check credentials
        const user = mockUsers.admins[username.toLowerCase()];
        
        if (user && user.password === password) {
            // Login successful
            console.log('Admin login successful:', { username: username.toLowerCase(), name: user.name, role: user.role });
            
            // Store login session
            sessionStorage.setItem('loggedInUser', JSON.stringify({
                type: 'admin',
                username: username.toLowerCase(),
                name: user.name,
                role: user.role
            }));
            
            setButtonLoading(submitButton, false);
            closeAdminLogin();
            showSuccessModal(`Welcome, ${user.name}! Admin login successful.`);
            
            // Update UI for logged in admin
            updateUIForLoggedInUser('admin', user);
            
            // Handle any pending actions
            handlePendingAction();
            
        } else {
            // Login failed
            setButtonLoading(submitButton, false);
            showFormError('admin', 'Invalid username or password. Please try again.');
        }
    }, 1500); // Simulate network delay
}

// Update UI for logged in user
function updateUIForLoggedInUser(type, user) {
    if (type === 'student') {
        console.log('Updating UI for logged in student:', user.name);
    } else if (type === 'admin') {
        console.log('Updating UI for logged in admin:', user.name, user.role);
    }
}

// Forgot password functionality
function forgotPassword(type) {
    if (type === 'student') {
        alert('Please contact the hostel administration or IT support to reset your student password.\n\nContact: hostel.support@mitsgwalior.in\nPhone: +91-XXX-XXX-XXXX');
    } else if (type === 'admin') {
        alert('Please contact the system administrator to reset your admin password.\n\nContact: admin@mitsgwalior.in\nPhone: +91-XXX-XXX-XXXX');
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const studentModal = document.getElementById('studentLoginModal');
    const adminModal = document.getElementById('adminLoginModal');
    const successModal = document.getElementById('successModal');
    
    if (event.target === studentModal) {
        closeStudentLogin();
    }
    if (event.target === adminModal) {
        closeAdminLogin();
    }
    if (event.target === successModal) {
        closeSuccessModal();
    }
});

// Load student data
function loadStudentData() {
    // Check if user is already logged in
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        console.log('User already logged in:', user);
    }
    
    console.log('Student data loaded');
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    console.log('Current date and time:', now.toLocaleDateString('en-US', options));
}

// Load recent complaints
function loadRecentComplaints() {
    const complaints = [
        {
            id: 1,
            title: 'AC not working',
            date: 'Jan 25, 2025',
            status: 'Pending'
        },
        {
            id: 2,
            title: 'Water leakage in bathroom',
            date: 'Jan 20, 2025',
            status: 'In Progress'
        }
    ];
    
    console.log('Recent complaints loaded:', complaints);
}

// Quick action handlers with login checks
function handleComplaintClick() {
    console.log('File Complaint clicked...');
    
    // Check if user is logged in
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        // User not logged in, show login prompt
        alert('Please login to file a complaint.');
        openStudentLogin();
        
        // Store the intended action for after login
        sessionStorage.setItem('pendingAction', 'complaint');
    } else {
        // User is logged in, redirect to complaint page
        console.log('Redirecting to complaints page...');
        showSuccessModal('Redirecting to Complaint Filing Page...');
        setTimeout(() => {
            window.location.href = 'complaints.html';
        }, 1500);
    }
}

function handleLeaveClick() {
    console.log('Apply for Leave clicked...');
    
    // Check if user is logged in
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        alert('Please login to apply for leave.');
        openStudentLogin();
        sessionStorage.setItem('pendingAction', 'leave');
    } else {
        console.log('Redirecting to leave application page...');
        showSuccessModal('Redirecting to Leave Application Page...');
        setTimeout(() => {
            window.location.href = 'leave.html';
        }, 1500);
    }
}

function handleProfileClick() {
    console.log('View Profile clicked...');
    
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        alert('Please login to view your profile.');
        openStudentLogin();
        sessionStorage.setItem('pendingAction', 'profile');
    } else {
        console.log('Redirecting to profile page...');
        showSuccessModal('Redirecting to Profile Page...');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    }
}

function handleMaintenanceClick() {
    console.log('Maintenance Request clicked...');
    
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        alert('Please login to request maintenance.');
        openStudentLogin();
        sessionStorage.setItem('pendingAction', 'maintenance');
    } else {
        console.log('Redirecting to maintenance page...');
        showSuccessModal('Redirecting to Maintenance Request Page...');
        setTimeout(() => {
            window.location.href = 'maintenance.html';
        }, 1500);
    }
}

function handleGuestRoomClick() {
    console.log('Book Guest Room clicked...');
    console.log('Redirecting to guest room booking page...');
    showSuccessModal('Redirecting to Guest Room Booking Page...');
    setTimeout(() => {
        window.location.href = 'guestroom.html';
    }, 1500);
}

// Handle pending actions after successful login
function handlePendingAction() {
    const pendingAction = sessionStorage.getItem('pendingAction');
    
    if (pendingAction) {
        // Clear the pending action
        sessionStorage.removeItem('pendingAction');
        
        // Execute the pending action
        setTimeout(() => {
            switch (pendingAction) {
                case 'complaint':
                    window.location.href = 'complaints.html';
                    break;
                case 'leave':
                    window.location.href = 'leave.html';
                    break;
                case 'profile':
                    window.location.href = 'profile.html';
                    break;
                case 'maintenance':
                    window.location.href = 'maintenance.html';
                    break;
                default:
                    console.log('Unknown pending action:', pendingAction);
            }
        }, 2000);
    }
}

// Utility functions
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Logout functionality
function logout() {
    sessionStorage.removeItem('loggedInUser');
    console.log('User logged out');
    // Refresh page or redirect to login
    location.reload();
}

// Export functions for global access
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.currentSlide = currentSlideGoto;
window.openStudentLogin = openStudentLogin;
window.closeStudentLogin = closeStudentLogin;
window.openAdminLogin = openAdminLogin;
window.closeAdminLogin = closeAdminLogin;
window.closeSuccessModal = closeSuccessModal;
window.forgotPassword = forgotPassword;
window.logout = logout;
window.handleComplaintClick = handleComplaintClick;
window.handleLeaveClick = handleLeaveClick;
window.handleProfileClick = handleProfileClick;
window.handleMaintenanceClick = handleMaintenanceClick;
window.handleGuestRoomClick = handleGuestRoomClick;

// Add smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add keyboard navigation for slider
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        previousSlide();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
    }
    
    // ESC key to close modals
    if (e.key === 'Escape') {
        closeStudentLogin();
        closeAdminLogin();
        closeSuccessModal();
    }
});

// Add keyboard support for form submission
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const studentModal = document.getElementById('studentLoginModal');
        const adminModal = document.getElementById('adminLoginModal');
        
        if (studentModal && studentModal.style.display === 'block') {
            const form = document.getElementById('studentLoginForm');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
        
        if (adminModal && adminModal.style.display === 'block') {
            const form = document.getElementById('adminLoginForm');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    }
});

console.log('Hostel Management System JavaScript loaded successfully');
console.log('Demo Login Credentials:');
console.log('Students: ST001/pass123, ST002/student123, ST003/mypass456, ST004/pass456, ST005/student789');
console.log('Admins: admin/admin123, warden/warden456, maintenance/maint789');