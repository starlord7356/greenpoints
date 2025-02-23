document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Reset error messages
    document.querySelectorAll('.error-text').forEach(error => error.style.display = 'none');
    
    // Validate passwords match
    if (password !== confirmPassword) {
        const confirmPasswordError = document.getElementById('confirm-password-error');
        confirmPasswordError.textContent = 'Passwords do not match';
        confirmPasswordError.style.display = 'block';
        return;
    }
    
    // Basic validation
    if (!name || !dob || !email || !username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const emailError = document.getElementById('email-error');
        emailError.textContent = 'Please enter a valid email address';
        emailError.style.display = 'block';
        return;
    }
    
    const signupButton = document.querySelector('.signup-button');
    signupButton.disabled = true;
    signupButton.textContent = 'Signing up...';
    
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                dob,
                email,
                username,
                password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Registration successful! Please login.');
            window.location.href = 'index.html';
        } else {
            if (data.error === 'username_exists') {
                const usernameError = document.getElementById('username-error');
                usernameError.textContent = 'Username already exists';
                usernameError.style.display = 'block';
            } else if (data.error === 'email_exists') {
                const emailError = document.getElementById('email-error');
                emailError.textContent = 'Email already registered';
                emailError.style.display = 'block';
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        }
    } catch (error) {
        console.error('Registration failed:', error);
        alert('Registration failed. Please try again.');
    } finally {
        signupButton.disabled = false;
        signupButton.textContent = 'Sign Up';
    }
});

// Real-time password matching validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    const confirmPasswordError = document.getElementById('confirm-password-error');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmPasswordError.textContent = 'Passwords do not match';
        confirmPasswordError.style.display = 'block';
    } else {
        confirmPasswordError.style.display = 'none';
    }
});