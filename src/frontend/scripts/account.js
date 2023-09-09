
        // Load username, wallet address, and loan information
        window.onload = async function() {
            try {
                const response = await fetch('/account-data');
                if (!response.ok) throw new Error('Failed to fetch user data');
                
                const data = await response.json();
                const principal = data.totalLoanAmount;
                const outstanding = data.outstandingBalance;
    
                document.getElementById('userEmail').textContent = data.userEmail;
                document.getElementById('userEthAddress').textContent = data.userEthereumAddress;

                if (outstanding && outstanding > 0) {
                    document.getElementById('borrowFormContainer').style.display = 'none';   // Hide the borrow form
                    document.getElementById('repaymentFormContainer').style.display = 'block';  // Show the repayment form
                    document.getElementById('outstandingBalance').textContent = principal; // Display the outstanding balance
                    document.getElementById('totalLoanAmount').textContent = outstanding; // Display the outstanding balance
                }
                else {
                    document.getElementById('borrowFormContainer').style.display = 'block';   // Hide the borrow form
                    document.getElementById('repaymentFormContainer').style.display = 'none';  // Show the repayment form
                }
            } catch (error) {
                console.error(error);
                // Potentially redirect to login page or show error
                window.location.href = '/login';
            }
        }

        handleFormSubmit(
            'borrowForm',
            (form) => ({ amount: form.amount.value }),
            () => window.location.reload(),
            (response) => errorMessage.textContent = response.error
        );
        
        handleFormSubmit(
            'repaymentForm',
            (form) => ({ amount: form.repaymentAmount.value }),
            () => window.location.reload(),
            (response) => errorMessage.textContent = response.error
        );