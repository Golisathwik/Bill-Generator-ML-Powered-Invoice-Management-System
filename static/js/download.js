document.addEventListener('DOMContentLoaded', () => {
    // Find the download button in the dropdown menu
    const downloadBtn = document.getElementById('download-bill-btn');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default link behavior

            // Get the current bill's ID from the URL
            const urlParams = new URLSearchParams(window.location.search);
            const billId = urlParams.get('id');

            // Check if we are on a valid bill page (not a new, unsaved bill)
            if (billId) {
                // Trigger the download by navigating to the special API endpoint
                window.location.href = `/api/bill/${billId}/download`;
            } else {
                alert("You must be on a saved bill's page to download. This new bill has not been saved yet.");
            }
        });
    }
});
