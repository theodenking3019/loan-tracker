handleFormSubmit(
    'registrationForm',
    (form) => ({
        email: form.email.value,
        password: form.password.value
    }),
    () => window.location.href = "/account",
    (response) => errorMessage.textContent = response.error
);
