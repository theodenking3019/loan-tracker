/**
 * Utility function to make a POST request.
 */
async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

/**
 * Utility function to handle form submissions.
 */
function handleFormSubmit(formId, getFormData, onSuccess, onError) {
    const form = document.getElementById(formId);
    const errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', async event => {
        event.preventDefault();
        try {
            const data = getFormData(form);
            const response = await postData(form.action, data);
            if (response.success) {
                onSuccess(response);
            } else {
                onError(response);
            }
        } catch (error) {
            console.error(error);
            onError({ error: 'Failed to submit form' });
        }
    });
}
