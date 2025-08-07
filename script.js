// Global variables
let currentSlide = 1;
const totalSlides = 4;

// Mock user database (In real application, this would be handled by backend)
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

// Room occupancy data
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

// Signup and OTP related variables
const pendingSignups = {};
const otpStore = {};

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    startAutoSlider();
    handleHeaderImage();
    setupFormValidation();
    updateRoomDisplay();
    
    // Add signup form handler
    const signupForm = document.getElementById('studentSignupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleStudentSignup);
    }
    
    // Add OTP form handler
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', handleOtpVerification);
    }
});

// Handle header image/logo loading
function handleHeaderImage() {
    const headerLogo = document.getElementById('headerLogo');
    const placeholder = document.getElementById('logoPlaceholder');
    
    if (headerLogo) {
        headerLogo.onload = function() {
            if (placeholder) placeholder.style.display = 'none';
            headerLogo.style.display = 'block';
        };
        
        headerLogo.onerror = function() {
            if (placeholder) placeholder.style.display = 'flex';
            headerLogo.style.display = 'none';
        };
        
        if (headerLogo.complete && headerLogo.naturalHeight !== 0) {
            headerLogo.onload();
        } else if (!headerLogo.src || headerLogo.src.includes('image.jpg')) {
            headerLogo.onerror();
        }
    }
}

// Initialize page functionality
function initializePage() {
    console.log('Hostel Management System Initialized');
    loadStudentData();
    updateDateTime();
    loadRecentComplaints();
    updateLoginSection(); // Update login UI based on current state
}

// Update login section based on authentication state
function updateLoginSection() {
    const loginSection = document.querySelector('.login-section');
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    
    if (!loginSection) return;
    
    if (loggedInUser) {
        try {
            const user = JSON.parse(loggedInUser);
            loginSection.innerHTML = `
                <button class="login-btn profile-btn" onclick="handleProfileClick()">
                    <span class="login-icon">👤</span>
                    ${user.name.split(' ')[0]}
                </button>
                <button class="login-btn logout-btn" onclick="logout()">
                    <span class="login-icon">🚪</span>
                    Logout
                </button>
            `;
        } catch (e) {
            console.error('Error parsing user data:', e);
            showLoginButtons();
        }
    } else {
        showLoginButtons();
    }
}

function showLoginButtons() {
    const loginSection = document.querySelector('.login-section');
    if (loginSection) {
        loginSection.innerHTML = `
            <button class="login-btn student-login" onclick="openStudentLogin()">
                <span class="login-icon">👨‍🎓</span>
                Student Login
            </button>
            <button class="login-btn admin-login" onclick="openAdminLogin()">
                <span class="login-icon">👨‍💼</span>
                Admin Login
            </button>
        `;
    }
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

// Login Modal Functions
function openStudentLogin() {
    const modal = document.getElementById('studentLoginModal');
    if (modal) {
        modal.style.display = 'block';
        clearFormErrors('student');
        switchTab('login'); // Always show login form first
        
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeStudentLogin() {
    const modal = document.getElementById('studentLoginModal');
    if (modal) {
        modal.style.display = 'none';
        clearForm('studentLoginForm');
        clearFormErrors('student');
    }
}

function openAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.style.display = 'block';
        clearFormErrors('admin');
        
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.style.display = 'none';
        clearForm('adminLoginForm');
        clearFormErrors('admin');
    }
}

function openOtpModal() {
    const modal = document.getElementById('otpModal');
    if (modal) {
        modal.style.display = 'block';
        clearFormErrors('otp');
        
        setTimeout(() => {
            const otpInput = document.getElementById('otpCode');
            if (otpInput) otpInput.focus();
        }, 100);
    }
}

function closeOtpModal() {
    const modal = document.getElementById('otpModal');
    if (modal) {
        modal.style.display = 'none';
        clearForm('otpForm');
        clearFormErrors('otp');
    }
}

// Tab switching for login/signup
function switchTab(tab) {
    const loginForm = document.getElementById('loginFormContainer');
    const signupForm = document.getElementById('signupFormContainer');
    const loginTab = document.getElementById('loginTabBtn');
    const signupTab = document.getElementById('signupTabBtn');
    
    if (loginForm && signupForm && loginTab && signupTab) {
        if (tab === 'login') {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            loginTab.classList.remove('active');
            signupTab.classList.add('active');
        }
    }
}

// Success Modal Functions
function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    const messageElement = document.getElementById('successMessage');
    
    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.style.display = 'block';
        
        setTimeout(() => {
            closeSuccessModal();
        }, 3000);
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.style.display = 'none';
}

// Form handling functions
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
}

function clearFormErrors(type) {
    const errorDiv = document.getElementById(type + 'LoginError') || 
                     document.getElementById(type + 'SignupError') || 
                     document.getElementById(type + 'Error');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    }
}

function showFormError(type, message) {
    const errorDiv = document.getElementById(type + 'LoginError') || 
                     document.getElementById(type + 'SignupError') || 
                     document.getElementById(type + 'Error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }
}

function setButtonLoading(button, isLoading) {
    if (button) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<div class="loading-spinner"></div>Processing...';
        } else {
            button.disabled = false;
            button.textContent = button.textContent.replace('Processing...', '').trim();
            const originalText = button.getAttribute('data-original-text') || 'Submit';
            button.textContent = originalText;
        }
    }
}

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateStudentId(studentId) {
    const studentIdRegex = /^[A-Z0-9]{3,}$/i;
    return studentIdRegex.test(studentId);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// Handle login submissions
function handleStudentLogin(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value.trim();
    const password = document.getElementById('studentPassword').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    clearFormErrors('student');
    
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
    
    setButtonLoading(submitButton, true);
    
    setTimeout(() => {
        const user = mockUsers.students[studentId.toUpperCase()];
        
        if (user && user.password === password) {
            sessionStorage.setItem('loggedInUser', JSON.stringify({
                type: 'student',
                id: studentId.toUpperCase(),
                name: user.name,
                room: user.room
            }));
            
            setButtonLoading(submitButton, false);
            updateLoginSection(); // Update UI immediately
            closeStudentLogin();
            showSuccessModal(`Welcome back, ${user.name}! You have been logged in successfully.`);
            
            handlePendingAction();
        } else {
            setButtonLoading(submitButton, false);
            showFormError('student', 'Invalid Student ID or password. Please try again.');
        }
    }, 1500);
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    clearFormErrors('admin');
    
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
    
    setButtonLoading(submitButton, true);
    
    setTimeout(() => {
        const user = mockUsers.admins[username.toLowerCase()];
        
        if (user && user.password === password) {
            sessionStorage.setItem('loggedInUser', JSON.stringify({
                type: 'admin',
                username: username.toLowerCase(),
                name: user.name,
                role: user.role
            }));
            
            setButtonLoading(submitButton, false);
            updateLoginSection(); // Update UI immediately
            closeAdminLogin();
            // Redirect to admin dashboard after login
            window.location.href = 'admin-index.html';
        } else {
            setButtonLoading(submitButton, false);
            showFormError('admin', 'Invalid username or password. Please try again.');
        }
    }, 1500);
}

// Signup and OTP functions
function handleStudentSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const studentId = document.getElementById('signupStudentId').value.trim().toUpperCase();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    clearFormErrors('studentSignup');
    
    if (!name) {
        showFormError('studentSignup', 'Please enter your full name');
        return;
    }
    
    if (!email || !validateEmail(email)) {
        showFormError('studentSignup', 'Please enter a valid email address');
        return;
    }
    
    if (!studentId || !validateStudentId(studentId)) {
        showFormError('studentSignup', 'Student ID must be at least 3 alphanumeric characters');
        return;
    }
    
    if (mockUsers.students[studentId]) {
        showFormError('studentSignup', 'This Student ID is already taken');
        return;
    }
    
    if (!password || !validatePassword(password)) {
        showFormError('studentSignup', 'Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showFormError('studentSignup', 'Passwords do not match');
        return;
    }
    
    setButtonLoading(submitButton, true);
    
    setTimeout(() => {
        const otp = generateOTP();
        otpStore[email] = otp;
        pendingSignups[email] = { name, studentId, password };
        
        console.log(`OTP sent to ${email}: ${otp}`);
        
        setButtonLoading(submitButton, false);
        closeStudentLogin();
        openOtpModal();
        
        document.getElementById('otpError').textContent = `Demo OTP: ${otp}`;
        document.getElementById('otpError').classList.add('show');
    }, 1500);
}

function handleOtpVerification(e) {
    e.preventDefault();
    
    const otp = document.getElementById('otpCode').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    clearFormErrors('otp');
    
    if (!otp || otp.length !== 6) {
        showFormError('otp', 'Please enter a valid 6-digit OTP');
        return;
    }
    
    setButtonLoading(submitButton, true);
    
    setTimeout(() => {
        if (otpStore[email] && otpStore[email] === otp) {
            const userData = pendingSignups[email];
            
            mockUsers.students[userData.studentId] = {
                password: userData.password,
                name: userData.name,
                room: 'Not Assigned'
            };
            
            delete otpStore[email];
            delete pendingSignups[email];
            
            setButtonLoading(submitButton, false);
            closeOtpModal();
            showSuccessModal(`Welcome ${userData.name}! Your account has been created successfully.`);
            
            sessionStorage.setItem('loggedInUser', JSON.stringify({
                type: 'student',
                id: userData.studentId,
                name: userData.name,
                room: 'Not Assigned'
            }));
            
            updateLoginSection();
        } else {
            setButtonLoading(submitButton, false);
            showFormError('otp', 'Invalid OTP. Please try again.');
        }
    }, 1000);
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function resendOTP() {
    const email = document.getElementById('signupEmail').value.trim();
    if (email && pendingSignups[email]) {
        const otp = generateOTP();
        otpStore[email] = otp;
        
        console.log(`New OTP sent to ${email}: ${otp}`);
        
        document.getElementById('otpError').textContent = `New OTP sent. Demo OTP: ${otp}`;
        document.getElementById('otpError').classList.add('show');
    }
}

// Logout functionality
function logout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    }
}

// Quick action handlers
function handleComplaintClick() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        alert('Please login to file a complaint.');
        openStudentLogin();
        sessionStorage.setItem('pendingAction', 'complaint');
    } else {
        showSuccessModal('Redirecting to Complaint Filing Page...');
        setTimeout(() => {
            window.location.href = 'complaints.html';
        }, 1500);
    }
}

function handleLeaveClick() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        alert('Please login to apply for leave.');
        openStudentLogin();
        sessionStorage.setItem('pendingAction', 'leave');
    } else {
        showSuccessModal('Redirecting to Leave Application Page...');
        setTimeout(() => {
            window.location.href = 'leave.html';
        }, 1500);
    }
}

function handleProfileClick() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        alert('Please login to view your profile.');
        openStudentLogin();
        sessionStorage.setItem('pendingAction', 'profile');
    } else {
        showSuccessModal('Redirecting to Profile Page...');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    }
}

function handleMaintenanceClick() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        alert('Please login to request maintenance.');
        openStudentLogin();
        sessionStorage.setItem('pendingAction', 'maintenance');
    } else {
        showSuccessModal('Redirecting to Maintenance Request Page...');
        setTimeout(() => {
            window.location.href = 'maintenance.html';
        }, 1500);
    }
}

function handleGuestRoomClick() {
    showSuccessModal('Redirecting to Guest Room Booking Page...');
    setTimeout(() => {
        window.location.href = 'guestroom.html';
    }, 1500);
}

function handlePendingAction() {
    const pendingAction = sessionStorage.getItem('pendingAction');
    
    if (pendingAction) {
        sessionStorage.removeItem('pendingAction');
        
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

// Load student data
function loadStudentData() {
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

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const studentModal = document.getElementById('studentLoginModal');
    const adminModal = document.getElementById('adminLoginModal');
    const successModal = document.getElementById('successModal');
    const otpModal = document.getElementById('otpModal');
    
    if (event.target === studentModal) closeStudentLogin();
    if (event.target === adminModal) closeAdminLogin();
    if (event.target === successModal) closeSuccessModal();
    if (event.target === otpModal) closeOtpModal();
});

// Add keyboard navigation for slider
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') previousSlide();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'Escape') {
        closeStudentLogin();
        closeAdminLogin();
        closeSuccessModal();
        closeOtpModal();
    }
});

// Add keyboard support for form submission
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const activeModals = [
            { id: 'studentLoginModal', form: 'studentLoginForm' },
            { id: 'adminLoginModal', form: 'adminLoginForm' },
            { id: 'otpModal', form: 'otpForm' }
        ];
        
        activeModals.forEach(modal => {
            const modalElement = document.getElementById(modal.id);
            if (modalElement && modalElement.style.display === 'block') {
                const form = document.getElementById(modal.form);
                if (form) form.dispatchEvent(new Event('submit'));
            }
        });
    }
});

// Sync login state across tabs
window.addEventListener('storage', function(event) {
    if (event.key === 'loggedInUser') {
        updateLoginSection();
    }
});
// Add to the mock data at the top of script.js
const mockComplaints = [
  {
    id: 1,
    title: 'AC not working',
    date: 'Jan 25, 2025',
    status: 'Pending',
    room: 'A-101',
    likes: 4,
    likedBy: []
  },
  {
    id: 2,
    title: 'Water leakage in bathroom',
    date: 'Jan 20, 2025',
    status: 'In Progress',
    room: 'B-202',
    likes: 4,
    likedBy: []
  }
];

// Add this function to handle likes
function likeComplaint(complaintId) {
  const loggedInUser = sessionStorage.getItem('loggedInUser');
  if (!loggedInUser) {
    alert('Please login to like a complaint.');
    openStudentLogin();
    return;
  }

  const user = JSON.parse(loggedInUser);
  const complaint = mockComplaints.find(c => c.id === complaintId);
  
  if (complaint) {
    const userIndex = complaint.likedBy.indexOf(user.id || user.username);
    const likeBtn = document.querySelector(`.like-btn[onclick="likeComplaint(${complaintId})"]`);
    
    if (userIndex === -1) {
      // Like the complaint
      complaint.likes++;
      complaint.likedBy.push(user.id || user.username);
      if (likeBtn) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('.like-count').textContent = complaint.likes;
      }
    } else {
      // Unlike the complaint
      complaint.likes--;
      complaint.likedBy.splice(userIndex, 1);
      if (likeBtn) {
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('.like-count').textContent = complaint.likes;
      }
    }
    
    // Re-render complaints sorted by likes
    renderComplaints();
  }
}

        // Add this function to render complaints
        function renderComplaints() {
        const complaintsContainer = document.querySelector('.recent-complaints-card');
        if (!complaintsContainer) return;

        // Sort complaints by likes (descending)
        const sortedComplaints = [...mockComplaints].sort((a, b) => b.likes - a.likes);
        
        let complaintsHTML = '<h3>📋 Recent Complaints</h3>';
        
        sortedComplaints.forEach(complaint => {
            const loggedInUser = sessionStorage.getItem('loggedInUser');
            const user = loggedInUser ? JSON.parse(loggedInUser) : null;
            const isLiked = user && complaint.likedBy.includes(user.id || user.username);
            
            complaintsHTML += `
            <div class="complaint-item">
                <div class="complaint-header">
                <strong>${complaint.title}</strong>
                <span class="status-${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
                </div>
                <div class="complaint-details">
                <small>📅 ${complaint.date}</small>
                <small>🏠 Room ${complaint.room}</small>
                </div>
                <div class="complaint-footer">
                <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="likeComplaint(${complaint.id})">
                    <span class="like-icon">👍</span>
                    <span class="like-count">${complaint.likes}</span>
                </button>
                </div>
            </div>
            `;
        });
        
        complaintsContainer.innerHTML = complaintsHTML;
        }

// Update the loadRecentComplaints function
function loadRecentComplaints() {
  console.log('Recent complaints loaded:', mockComplaints);
  renderComplaints();
}

// Add to the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  renderComplaints(); // Add this line
});

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
window.switchTab = switchTab;
window.resendOTP = resendOTP;
window.closeOtpModal = closeOtpModal;

console.log('Hostel Management System JavaScript loaded successfully');
console.log('Demo Login Credentials:');
console.log('Students: ST001/pass123, ST002/student123, ST003/mypass456, ST004/pass456, ST005/student789');
console.log('Admins: admin/admin123, warden/warden456, maintenance/maint789');
// Add this to your existing handleLogin function
function handleLogin(userType) {
    const userId = document.getElementById(`${userType}Id`).value;
    const password = document.getElementById(`${userType}Password`).value;
    const errorElement = document.getElementById(`${userType}Error`);

    if (!userId || !password) {
        showError(errorElement, 'Please fill in all fields');
        return;
    }

    const users = userType === 'student' ? mockUsers.students : mockUsers.admins;
    const user = users[userId];

    if (user && user.password === password) {
        // Store user session
        const userSession = {
            id: userId,
            name: user.name,
            type: userType,
            room: user.room || null,
            role: user.role || null
        };
        
        sessionStorage.setItem('loggedInUser', JSON.stringify(userSession));
        
        // Redirect based on user type
        if (userType === 'admin') {
            window.location.href = 'admin-index.html';
        } else {
            // Redirect to student dashboard (you can create this later)
            alert('Student login successful! Student dashboard coming soon...');
            closeModal();
            updateLoginSection();
        }
    } else {
        showError(errorElement, 'Invalid credentials');
    }
}
