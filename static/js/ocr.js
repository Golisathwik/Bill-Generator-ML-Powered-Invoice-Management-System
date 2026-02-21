// static/ocr.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const ocrButton = document.getElementById('ocr-btn');
    const modal = document.getElementById("addItemModal");
    const itemForm = document.getElementById("itemForm");
    const closeModalBtn = document.querySelector(".close-button");

    // Modal Footers
    const manualFooter = document.getElementById('manual-item-footer');
    const ocrFooter = document.getElementById('ocr-item-footer');

    // OCR Footer Buttons and Counter
    const ocrPrevBtn = document.getElementById('ocr-prev-btn');
    const ocrNextBtn = document.getElementById('ocr-next-btn');
    const ocrDeleteBtn = document.getElementById('ocr-delete-btn');
    const ocrAddBtn = document.getElementById('ocr-add-btn');
    const ocrCounter = document.getElementById('ocr-item-counter');

    // --- State Management ---
    let ocrItems = [];
    let currentOcrIndex = -1;

    // --- Initial Event Listeners ---
    if (ocrButton) {
        ocrButton.addEventListener('click', handleOcrButtonClick);
    }
    ocrPrevBtn.addEventListener('click', showPreviousOcrItem);
    ocrNextBtn.addEventListener('click', showNextOcrItem);
    ocrDeleteBtn.addEventListener('click', deleteCurrentOcrItem);
    ocrAddBtn.addEventListener('click', validateAndAddAllOcrItems);
    closeModalBtn.addEventListener('click', endOcrSession);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            endOcrSession();
        }
    });

    /**
     * Handles the initial click on the camera icon to start the OCR process.
     */
    function handleOcrButtonClick() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) uploadImageForOcr(file);
        };
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    /**
     * Uploads the image file and starts the OCR session with the returned items.
     * @param {File} file The image file selected by the user.
     */
    async function uploadImageForOcr(file) {
        ocrButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        ocrButton.disabled = true;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/ocr/upload', { method: 'POST', body: formData });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process image.');
            }
            const items = await response.json();
            if (items.length === 0) {
                alert('No items were recognized in the image.');
            } else {
                startOcrSession(items);
            }
        } catch (error) {
            console.error('OCR Error:', error);
            alert(`An error occurred: ${error.message}`);
        } finally {
            ocrButton.innerHTML = '<i class="fa-solid fa-camera text-gray-600"></i>';
            ocrButton.disabled = false;
        }
    }

    /**
     * Initializes the OCR processing state, converting API data into a richer state object.
     * @param {Array} items An array of item objects from the OCR API.
     */
    function startOcrSession(items) {
        ocrItems = items.map(item => ({
            name: item.name,
            quantity: '',
            unit: 'Nos',
            hsn: '',
            price: '',
            cgst: '',
            sgst: '',
            isDataFetched: false // Flag to avoid re-fetching DB data
        }));
        currentOcrIndex = 0;
        displayCurrentOcrItem();
    }

    /**
     * Saves the current data from the form fields into our state array.
     */
    function saveCurrentItemState() {
        if (currentOcrIndex >= 0 && currentOcrIndex < ocrItems.length) {
            const currentItem = ocrItems[currentOcrIndex];
            currentItem.name = document.getElementById('itemName').value;
            currentItem.quantity = document.getElementById('quantity').value;
            currentItem.unit = document.getElementById('unit').value;
            currentItem.hsn = document.getElementById('hsn').value;
            currentItem.price = document.getElementById('price').value;
            currentItem.cgst = document.getElementById('cgst').value;
            currentItem.sgst = document.getElementById('sgst').value;
        }
    }

    /**
     * Displays the modal form, populating it with data from the current item in our state array.
     */
    async function displayCurrentOcrItem() {
        if (currentOcrIndex < 0 || currentOcrIndex >= ocrItems.length) {
            endOcrSession();
            return;
        }

        const item = ocrItems[currentOcrIndex];

        // Configure modal for OCR mode
        manualFooter.classList.add('hidden');
        ocrFooter.classList.remove('hidden');
        document.querySelector('.modal-header h2').textContent = "Confirm Scanned Item";
        ocrAddBtn.innerHTML = '<i class="fa-solid fa-plus mr-2"></i> Add All Items to Bill';

        // Update UI elements
        ocrCounter.textContent = `Item ${currentOcrIndex + 1} of ${ocrItems.length}`;
        ocrPrevBtn.disabled = (currentOcrIndex === 0);
        ocrNextBtn.disabled = (currentOcrIndex === ocrItems.length - 1);

        // Fetch master data only once
        if (!item.isDataFetched) {
            try {
                const response = await fetch(`/api/item/${encodeURIComponent(item.name)}`);
                if (response.ok) {
                    const data = await response.json();
                    item.hsn = data.hsn || '';
                    item.unit = data.unit || 'Nos';
                    item.cgst = data.cgst || '';
                    item.sgst = data.sgst || '';
                }
            } catch (error) {
                console.warn(`Could not fetch details for item "${item.name}":`, error);
            } finally {
                item.isDataFetched = true;
            }
        }
        
        // Populate form from our stored state
        itemForm.reset();
        document.getElementById('itemName').value = item.name;
        document.getElementById('quantity').value = item.quantity;
        document.getElementById('unit').value = item.unit;
        document.getElementById('hsn').value = item.hsn;
        document.getElementById('price').value = item.price;
        document.getElementById('cgst').value = item.cgst;
        document.getElementById('sgst').value = item.sgst;

        modal.style.display = "flex";
        document.getElementById('quantity').focus();
    }
    
    /**
     * Validates all items in the OCR list. If all are valid, adds them to the bill.
     * If an item is invalid, it navigates to it.
     */
    function validateAndAddAllOcrItems() {
        saveCurrentItemState(); // Save the currently open item first

        // Find the first item with missing required details
        const invalidItemIndex = ocrItems.findIndex(item => !item.quantity || !item.price);

        if (invalidItemIndex !== -1) {
            alert('Please fill in the quantity and price for all items.');
            currentOcrIndex = invalidItemIndex;
            displayCurrentOcrItem();
            // Highlight the first invalid field
            const qtyInput = document.getElementById('quantity');
            const priceInput = document.getElementById('price');
            if (!qtyInput.value) {
                qtyInput.focus();
            } else {
                priceInput.focus();
            }
            return;
        }
        
        // If all items are valid, add them to the bill table
        ocrItems.forEach(item => {
            const isDuplicate = Array.from(document.querySelectorAll('#bill-items-body tr.item-row'))
                .some(row => row.querySelector('[data-field="name"]').textContent.trim().toLowerCase() === item.name.toLowerCase());

            if (isDuplicate) {
                 console.warn(`Skipping duplicate item: "${item.name}"`);
                 return; // In a bulk add, we typically skip duplicates automatically.
            }

            addItemToTable(item.name, item.quantity, item.unit, item.hsn, item.price, item.cgst, item.sgst, false); // false to avoid triggering save on each item
            saveNewItemToDatabase(item.name, item.unit, item.hsn, item.cgst, item.sgst);
        });

        // Manually trigger one final auto-save for the whole bill
        triggerAutoSave();
        
        alert(`${ocrItems.length} items added successfully!`);
        endOcrSession();
    }

    /**
     * Deletes the current item from the OCR list and displays the next one.
     */
    function deleteCurrentOcrItem() {
        if (currentOcrIndex >= 0 && currentOcrIndex < ocrItems.length) {
            // Remove the item from the array
            ocrItems.splice(currentOcrIndex, 1);

        // After deleting, check if the index is now out of bounds.
        // This happens if the last item was the one that was deleted.
            if (currentOcrIndex >= ocrItems.length) {
            // If so, move the index to the new last item in the list.
                currentOcrIndex = ocrItems.length - 1;
            }

        // Now, display the item at the (potentially adjusted) index.
        // If the array becomes empty, the index will be -1, and the session will correctly end.
            displayCurrentOcrItem();
        }
    }                                   

    function showNextOcrItem() {
        saveCurrentItemState();
        currentOcrIndex++;
        displayCurrentOcrItem();
    }

    function showPreviousOcrItem() {
        saveCurrentItemState();
        currentOcrIndex--;
        displayCurrentOcrItem();
    }

    /**
     * Ends the OCR session and resets the modal to its default state.
     */
    function endOcrSession() {
        ocrItems = [];
        currentOcrIndex = -1;
        modal.style.display = "none";
        manualFooter.classList.remove('hidden');
        ocrFooter.classList.add('hidden');
        document.querySelector('.modal-header h2').textContent = "Add New Item";
    }
});