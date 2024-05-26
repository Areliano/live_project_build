document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(registerForm);
            const username = formData.get('username');
            const password = formData.get('password');
            const email = formData.get('email');
            const full_name = formData.get('full_name');

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password, email, full_name })
                });

                const responseData = await response.json();
                console.log('Response data:', responseData);

                if (response.ok) {
                    alert('Registration was successful.');
                } else {
                    alert('Registration failed: ' + (responseData.error || response.statusText));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred.');
            }
        });
    } else {
        console.error('Registration form not found!');
    }
});
