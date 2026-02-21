// script.js

document.addEventListener('DOMContentLoaded', function () {
    const pageId = document.body.querySelector('main > div').id;

    // --- Route based on which page is loaded ---
    if (pageId === 'bill-management-page') {
        initializeBillManagementPage();
    } else if (pageId === 'bill-details-page') {
        const urlParams = new URLSearchParams(window.location.search);
        const billId = urlParams.get('id');
        
        if (billId) {
            loadBillDetails(billId);
        } else {
            initializeNewBill();
        }
    }

    // --- Dropdown Logic for Menu Button ---
    const menuBtn = document.getElementById('menu-btn');
    const menuDropdown = document.getElementById('menu-dropdown');

    if (menuBtn) {
        menuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            menuDropdown.classList.toggle('hidden');
        });

        // Close dropdown if clicking anywhere else on the page
        window.addEventListener('click', () => {
            if (!menuDropdown.classList.contains('hidden')) {
                menuDropdown.classList.add('hidden');
            }
        });

        // Prevent dropdown from closing when clicking inside it
        menuDropdown.addEventListener('click', (event) => event.stopPropagation());
    }
});

// =================================================================
// ===           BILL MANAGEMENT PAGE FUNCTIONS                  ===
// =================================================================

let allBills = []; // Cache for all bills
let showAllBills = false; // State for showing all bills

function initializeBillManagementPage() {
    loadAllBills();

    const searchInput = document.getElementById('search-bill-history');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterBillHistory);
    }

    const showAllBtn = document.getElementById('show-all-bills-btn');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            showAllBills = !showAllBills; // Toggle state
            filterBillHistory(); // Re-render and filter
        });
    }
}

async function loadAllBills() {
    try {
        const response = await fetch('/api/bills');
        allBills = await response.json();
        filterBillHistory(); // Initial display
    } catch (error) {
        console.error("Failed to load bills:", error);
    }
}

function displayBills(bills) {
    const billTableBody = document.querySelector('#bill-management-page tbody');
    const showAllBtn = document.getElementById('show-all-bills-btn');
    const billCountDisplay = document.getElementById('bill-count-display');
    
    billTableBody.innerHTML = ''; // Clear existing rows

    const billsToShow = showAllBills ? bills : bills.slice(0, 10);

    if (billsToShow.length === 0) {
        billTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No bills found.</td></tr>';
    } else {
        billsToShow.forEach((bill, index) => {
            const row = `
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="py-3 px-4">${index + 1}</td>
                    <td class="py-3 px-4">
                        <a href="/bill-details?id=${bill.id}" class="bill-link text-blue-600 hover:underline font-medium">${bill.bill_number}</a>
                    </td>
                    <td class="py-3 px-4">${bill.date}</td>
                    <td class="py-3 px-4">${bill.total_items}</td>
                    <td class="py-3 px-4">₹${bill.total_amount.toFixed(2)}</td>
                    <td class="py-3 px-4 text-center">
                        <button onclick="deleteBill(${bill.id})" class="text-red-500 hover:text-red-700">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
            billTableBody.innerHTML += row;
        });
    }
    
    billCountDisplay.textContent = `Showing ${billsToShow.length} of ${bills.length} bills`;
    showAllBtn.textContent = showAllBills ? 'Show Less' : 'Show All';
    showAllBtn.style.display = bills.length > 10 ? 'inline-block' : 'none';
}

function filterBillHistory() {
    const searchTerm = document.getElementById('search-bill-history').value.trim().toLowerCase();
    const filteredBills = allBills.filter(bill => 
        bill.bill_number.toLowerCase().includes(searchTerm) ||
        bill.date.toLowerCase().includes(searchTerm) ||
        String(bill.total_amount).includes(searchTerm)
    );
    displayBills(filteredBills);
}

async function deleteBill(billId) {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    
    await fetch(`/api/bills/${billId}`, { method: 'DELETE' });
    loadAllBills(); // Refresh the table
}

// =================================================================
// ===           BILL DETAILS / NEW BILL FUNCTIONS               ===
// =================================================================

let currentBillId = null;
let debounceTimer;
let editingRow = null; // Variable to keep track of the table row being edited

const modal = document.getElementById("addItemModal");
const openModalBtn = document.getElementById("addItemBtn");
const closeModalBtn = document.querySelector(".close-button");
const itemForm = document.getElementById("itemForm");

if (modal && openModalBtn && closeModalBtn && itemForm) {
    openModalBtn.onclick = () => {
        editingRow = null; // Ensure we are not in edit mode
        document.querySelector('.modal-header h2').textContent = "Add New Item";
        itemForm.reset();
        document.getElementById('unit').value = 'Nos'; // Reset unit to default
        modal.style.display = "flex";
    };
    closeModalBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };
    itemForm.addEventListener('submit', handleAddItemForm);
}

async function initializeNewBill() {
    currentBillId = null;
    try {
        const response = await fetch('/api/bills/next_bill_number');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        document.getElementById('bill-number-text').textContent = data.next_bill_number;
    } catch (error) {
        console.error('Failed to fetch next bill number:', error);
        document.getElementById('bill-number-text').textContent = 'NEW BILL';
    }
    document.getElementById('bill-details-date').textContent = `Date: ${new Date().toLocaleDateString()}`;
    setupCommonBillPageListeners();
}

async function loadBillDetails(billId) {
    currentBillId = billId;
    const response = await fetch(`/api/bills/${billId}`);
    const bill = await response.json();
    document.getElementById('bill-number-text').textContent = bill.bill_number;
    document.getElementById('bill-details-date').textContent = `Last updated: ${bill.date}`;
    bill.items.forEach(item => {
        addItemToTable(item.item_name, item.quantity, item.unit, item.hsn, item.price, item.cgst_percent, item.sgst_percent, false);
    });
    setupCommonBillPageListeners(billId);
}

function setupCommonBillPageListeners(billId = null) {
    // --- Live Search/Filter for Bill Items Table ---
    const searchInput = document.getElementById('search-bill-items');
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            const tableBody = document.getElementById('bill-items-body');
            const rows = tableBody.querySelectorAll('tr.item-row');
            let visibleRowCount = 0;
            const noResultsRow = tableBody.querySelector('.no-results-row');
            if (noResultsRow) noResultsRow.remove();
            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                if (rowText.includes(searchTerm)) {
                    row.style.display = '';
                    visibleRowCount++;
                } else {
                    row.style.display = 'none';
                }
            });
            if (visibleRowCount === 0 && rows.length > 0) {
                const newRow = tableBody.insertRow();
                newRow.className = 'no-results-row';
                const cell = newRow.insertCell();
                cell.colSpan = 14; // Updated colspan
                cell.textContent = 'No matching items found.';
                cell.className = 'text-center text-gray-500 py-4';
            }
        });
    }

    // --- Bill Number Editing ---
    const editBtn = document.getElementById('edit-bill-number-btn');
    const detailsDiv = document.getElementById('bill-details-number');
    const textSpan = document.getElementById('bill-number-text');
    const inputField = document.getElementById('bill-number-input');
    if (editBtn && detailsDiv && textSpan && inputField) {
        editBtn.addEventListener('click', () => {
            detailsDiv.classList.add('hidden');
            inputField.classList.remove('hidden');
            inputField.value = textSpan.textContent;
            inputField.focus();
        });
        const saveBillNumber = () => {
            if (inputField.value.trim()) {
                textSpan.textContent = inputField.value.trim();
            }
            detailsDiv.classList.remove('hidden');
            inputField.classList.add('hidden');
            triggerAutoSave();
        };
        inputField.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveBillNumber(); });
        inputField.addEventListener('blur', saveBillNumber);
    }

    // --- Item Name Autocomplete/Tax Fetching ---
    const itemNameInput = document.getElementById('itemName');
    if (itemNameInput) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        itemNameInput.parentNode.insertBefore(wrapper, itemNameInput);
        wrapper.appendChild(itemNameInput);
        const suggestionBox = document.createElement('div');
        suggestionBox.id = 'suggestion-box';
        wrapper.appendChild(suggestionBox);
        itemNameInput.addEventListener('keyup', async () => {
            const query = itemNameInput.value;
            if (query.length < 2) {
                suggestionBox.style.display = 'none';
                return;
            }
            const response = await fetch(`/api/search?q=${query}`);
            const suggestions = await response.json();
            if (suggestions.length > 0) {
                suggestionBox.innerHTML = `<ul>${suggestions.map(item => `<li>${item}</li>`).join('')}</ul>`;
                suggestionBox.style.display = 'block';
            } else {
                suggestionBox.style.display = 'none';
            }
        });
        suggestionBox.addEventListener('click', async (e) => {
            if (e.target.tagName === 'LI') {
                const selectedItem = e.target.textContent;
                itemNameInput.value = selectedItem;
                suggestionBox.style.display = 'none';
                const response = await fetch(`/api/item/${selectedItem}`);
                const data = await response.json();
                if (data && !data.error) {
                    document.getElementById('cgst').value = data.cgst;
                    document.getElementById('sgst').value = data.sgst;
                    document.getElementById('unit').value = data.unit || 'Nos';
                    document.getElementById('hsn').value = data.hsn || '';
                }
            }
        });
    }

    // --- Checkbox Selection Logic ---
    const selectAllCheckbox = document.getElementById('select-all-items');
    const tableBody = document.getElementById('bill-items-body');
    const selectionActions = document.getElementById('selection-actions');
    const selectionCount = document.getElementById('selection-count');
    function updateSelectionState() {
        if (!tableBody) return;
        const itemCheckboxes = tableBody.querySelectorAll('.item-checkbox');
        const selectedCheckboxes = tableBody.querySelectorAll('.item-checkbox:checked');
        const count = selectedCheckboxes.length;
        if (count > 0) {
            selectionActions.classList.remove('hidden');
            selectionCount.textContent = `${count} item${count > 1 ? 's' : ''} selected`;
        } else {
            selectionActions.classList.add('hidden');
        }
        if (itemCheckboxes.length > 0 && count === itemCheckboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (count > 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        }
    }
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            const itemCheckboxes = tableBody.querySelectorAll('.item-checkbox');
            itemCheckboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
            updateSelectionState();
        });
    }
    if (tableBody) {
        tableBody.addEventListener('change', (event) => {
            if (event.target.classList.contains('item-checkbox')) {
                updateSelectionState();
            }
        });
    }
    updateSelectionState();

    // --- LOGIC FOR SELECTION ACTION BUTTONS ---
    const deleteBtn = document.getElementById('delete-selected-btn');
    const copyBtn = document.getElementById('copy-selected-btn');
    const moveBtn = document.getElementById('move-selected-btn');
    const billDropdown = document.getElementById('bill-selection-dropdown');
    function deleteSelectedItems() {
        if (confirm('Are you sure you want to delete the selected items?')) {
            const selectedCheckboxes = tableBody.querySelectorAll('.item-checkbox:checked');
            selectedCheckboxes.forEach(checkbox => checkbox.closest('tr').remove());
            updateTotalsAndSerialNumbers();
            updateSelectionState();
            triggerAutoSave();
        }
    }
    deleteBtn.addEventListener('click', deleteSelectedItems);
    async function showBillDropdown(action) {
        const response = await fetch('/api/bills');
        const bills = await response.json();
        const currentBillPageId = billId ? parseInt(billId) : null;
        const filteredBills = bills.filter(b => b.id !== currentBillPageId);
        if (filteredBills.length === 0) {
            alert('No other bills to copy or move items to.');
            return;
        }
        billDropdown.innerHTML = `<div class="p-2 text-sm text-gray-500">Select a bill to ${action} items to:</div>
            <ul class="max-h-48 overflow-y-auto">
                ${filteredBills.map(b => `<li data-bill-id="${b.id}" class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">${b.bill_number}</li>`).join('')}
            </ul>`;
        billDropdown.classList.remove('hidden');
        billDropdown.onclick = (event) => {
            if (event.target.tagName === 'LI') {
                const targetBillId = event.target.dataset.billId;
                executeTransfer(targetBillId, action);
                billDropdown.classList.add('hidden');
            }
        };
        setTimeout(() => {
            window.addEventListener('click', () => {
                billDropdown.classList.add('hidden');
            }, { once: true });
        }, 0);
    }
    copyBtn.addEventListener('click', (e) => { e.stopPropagation(); showBillDropdown('copy'); });
    moveBtn.addEventListener('click', (e) => { e.stopPropagation(); showBillDropdown('move'); });
    billDropdown.addEventListener('click', (e) => e.stopPropagation());
    async function executeTransfer(targetBillId, action) {
        const selectedRows = tableBody.querySelectorAll('.item-checkbox:checked');
        const itemsToTransfer = [];
        selectedRows.forEach(checkbox => {
            const row = checkbox.closest('tr');
            let hsnValue = row.querySelector('[data-field="hsn"]').textContent;
            itemsToTransfer.push({
                name: row.querySelector('[data-field="name"]').textContent,
                quantity: parseFloat(row.querySelector('[data-field="quantity"]').textContent),
                unit: row.querySelector('[data-field="unit"]').textContent,
                hsn: hsnValue === '-' ? null : hsnValue,
                price: parseFloat(row.querySelector('[data-field="price"]').textContent),
                cgst: parseFloat(row.querySelector('[data-field="cgst"]').textContent),
                sgst: parseFloat(row.querySelector('[data-field="sgst"]').textContent),
                final_total: parseFloat(row.querySelector('[data-field="final_total"]').textContent)
            });
        });
        if (itemsToTransfer.length > 0) {
            const response = await fetch(`/api/bills/${targetBillId}/add_items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemsToTransfer),
            });
            if (response.ok) {
                alert(`Items successfully ${action === 'copy' ? 'copied' : 'moved'}!`);
                if (action === 'move') {
                    selectedRows.forEach(checkbox => checkbox.closest('tr').remove());
                    updateTotalsAndSerialNumbers();
                    triggerAutoSave();
                }
                selectAllCheckbox.checked = false;
                selectedRows.forEach(checkbox => checkbox.checked = false);
                updateSelectionState();
            } else {
                alert(`Error: Could not ${action} items.`);
            }
        }
    }
}

function handleEditItem(button) {
    editingRow = button.closest('tr');
    
    const name = editingRow.querySelector('[data-field="name"]').textContent;
    const quantity = editingRow.querySelector('[data-field="quantity"]').textContent;
    const unit = editingRow.querySelector('[data-field="unit"]').textContent;
    const hsn = editingRow.querySelector('[data-field="hsn"]').textContent;
    const price = editingRow.querySelector('[data-field="price"]').textContent;
    const cgst = editingRow.querySelector('[data-field="cgst"]').textContent;
    const sgst = editingRow.querySelector('[data-field="sgst"]').textContent;

    document.getElementById('itemName').value = name;
    document.getElementById('quantity').value = quantity;
    document.getElementById('unit').value = unit;
    document.getElementById('hsn').value = hsn === '-' ? '' : hsn;
    document.getElementById('price').value = price;
    document.getElementById('cgst').value = cgst;
    document.getElementById('sgst').value = sgst;

    document.querySelector('.modal-header h2').textContent = "Edit Item";
    modal.style.display = "flex";
}

function handleAddItemForm(event) {
    event.preventDefault();

    const itemName = document.getElementById('itemName').value.trim();
    const quantity = parseFloat(document.getElementById('quantity').value);
    const unit = document.getElementById('unit').value.trim();
    let hsn = document.getElementById('hsn').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const cgst = parseFloat(document.getElementById('cgst').value);
    const sgst = parseFloat(document.getElementById('sgst').value);

    if (!itemName || isNaN(quantity) || !unit || isNaN(price) || isNaN(cgst) || isNaN(sgst)) {
        alert("Please fill out all required fields correctly.");
        return;
    }
    
    if (editingRow) {
        updateItemRow(editingRow, { name: itemName, quantity, unit, hsn, price, cgst, sgst });
        editingRow = null;
    } else {
        const isDuplicate = Array.from(document.querySelectorAll('#bill-items-body tr.item-row'))
            .some(row => row.querySelector('[data-field="name"]').textContent.trim().toLowerCase() === itemName.toLowerCase());

        if (isDuplicate) {
            alert(`"${itemName}" is already present in the bill.`);
            return;
        }
        addItemToTable(itemName, quantity, unit, hsn, price, cgst, sgst, true);
        saveNewItemToDatabase(itemName, unit, hsn, cgst, sgst);
    }
    
    itemForm.reset();
    document.getElementById('unit').value = 'Nos';
    modal.style.display = "none";
}

// Replace the entire old updateItemRow function with this one

function updateItemRow(row, data) {
    const { name, quantity, unit, hsn, price, cgst, sgst } = data;
    
    const displayHsn = (hsn || '').trim() === '' ? '-' : hsn.trim();
    
    const taxableValue = quantity * price;
    const cgstAmount = taxableValue * (cgst / 100);
    const sgstAmount = taxableValue * (sgst / 100);
    const finalTotal = taxableValue + cgstAmount + sgstAmount;

    // Update all fields using their data-field attribute for accuracy
    row.querySelector('[data-field="name"]').textContent = name;
    row.querySelector('[data-field="quantity"]').textContent = quantity;
    row.querySelector('[data-field="unit"]').textContent = unit;
    row.querySelector('[data-field="hsn"]').textContent = displayHsn;
    row.querySelector('[data-field="price"]').textContent = price.toFixed(2);
    row.querySelector('[data-field="cgst"]').textContent = cgst;
    row.querySelector('[data-field="sgst"]').textContent = sgst;
    row.querySelector('[data-field="taxable_value"]').textContent = taxableValue.toFixed(2);
    row.querySelector('[data-field="cgst_amount"]').textContent = cgstAmount.toFixed(2);
    row.querySelector('[data-field="sgst_amount"]').textContent = sgstAmount.toFixed(2);
    row.querySelector('[data-field="final_total"]').textContent = finalTotal.toFixed(2);
    updateMasterItemInDatabase(name, hsn, cgst, sgst);
    updateTotalsAndSerialNumbers();
    triggerAutoSave();
}

function addItemToTable(name, qty, unit, hsn, price, cgst, sgst, shouldTriggerSave = true) {
    const tableBody = document.getElementById('bill-items-body');
    const newRow = document.createElement('tr');
    newRow.className = "border-b border-gray-200 hover:bg-gray-50 item-row";
    
    const displayHsn = (hsn || '').trim() === '' ? '-' : hsn.trim();

    const numQty = parseFloat(qty);
    const numPrice = parseFloat(price);
    const numCgst = parseFloat(cgst);
    const numSgst = parseFloat(sgst);
    
    const taxableValue = numQty * numPrice;
    const cgstAmount = taxableValue * (numCgst / 100);
    const sgstAmount = taxableValue * (numSgst / 100);
    const finalTotal = taxableValue + cgstAmount + sgstAmount;
    
    // In the addItemToTable function in script.js

newRow.innerHTML = `
    <td class="py-3 px-4"><input type="checkbox" class="item-checkbox" /></td>
    <td class="py-3 px-4 s-no"></td>
    <td class="py-3 px-4 font-medium" data-field="name">${name}</td>
    <td class="py-3 px-4" data-field="quantity">${numQty}</td>
    <td class="py-3 px-4" data-field="unit">${unit}</td>
    <td class="py-3 px-4" data-field="hsn">${displayHsn}</td>
    <td class="py-3 px-4" data-field="price">${numPrice.toFixed(2)}</td>
    <td class="py-3 px-4" data-field="taxable_value">${taxableValue.toFixed(2)}</td>
    <td class="py-3 px-4" data-field="cgst">${numCgst}</td>
    <td class="py-3 px-4" data-field="cgst_amount">${cgstAmount.toFixed(2)}</td>
    <td class="py-3 px-4" data-field="sgst">${numSgst}</td>
    <td class="py-3 px-4" data-field="sgst_amount">${sgstAmount.toFixed(2)}</td>
    <td class="py-3 px-4 font-semibold" data-field="final_total">${finalTotal.toFixed(2)}</td>
    <td class="py-3 px-4 text-center space-x-2">
      <button class="text-blue-600 hover:text-blue-800" onclick="handleEditItem(this)">
        <i class="fa-solid fa-pencil"></i>
      </button>
      <button class="text-red-500 hover:text-red-700" onclick="removeRow(this)">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </td>
`;
    tableBody.appendChild(newRow);
    updateTotalsAndSerialNumbers();

    if (shouldTriggerSave) {
        triggerAutoSave();
    }
}
// Add this new function to script.js

async function updateMasterItemInDatabase(name, hsn, cgst, sgst) {
    try {
        const response = await fetch('/api/master-item/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                hsn: hsn,
                cgst: cgst,
                sgst: sgst
            }),
        });
        const result = await response.json();
        console.log(result.message); // Optional: log success message
    } catch (error) {
        console.error('Failed to update master item:', error);
    }
}

async function saveNewItemToDatabase(itemName, unit, hsn, cgstPercent, sgstPercent) {
    const checkResponse = await fetch(`/api/item/${itemName}`);
    if (checkResponse.status === 404) {
        await fetch('/api/item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: itemName,
                unit: unit,
                hsn: hsn,
                cgst: parseFloat(cgstPercent),
                sgst: parseFloat(sgstPercent)
            }),
        });
    }
}

async function saveOrUpdateBill() {
    const billNumber = document.getElementById('bill-number-text').textContent;
    const grandTotal = parseFloat(document.getElementById('grand-total').textContent) || 0;
    
    const items = [];
    document.querySelectorAll('#bill-items-body tr.item-row').forEach(row => {
        let hsnValue = row.querySelector('[data-field="hsn"]').textContent;
        items.push({
            name: row.querySelector('[data-field="name"]').textContent,
            quantity: parseFloat(row.querySelector('[data-field="quantity"]').textContent),
            unit: row.querySelector('[data-field="unit"]').textContent,
            hsn: hsnValue === '-' ? null : hsnValue,
            price: parseFloat(row.querySelector('[data-field="price"]').textContent),
            cgst: parseFloat(row.querySelector('[data-field="cgst"]').textContent),
            sgst: parseFloat(row.querySelector('[data-field="sgst"]').textContent),
            final_total: parseFloat(row.querySelector('[data-field="final_total"]').textContent)
        });
    });

    const billData = { bill_number: billNumber, grand_total: grandTotal, items: items };
    const isNewBill = !currentBillId;
    const url = isNewBill ? '/api/bills' : `/api/bills/${currentBillId}`;
    const method = isNewBill ? 'POST' : 'PUT';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(billData)
        });
        if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
        
        const dateElement = document.getElementById('bill-details-date');
        dateElement.textContent = `Saved: ${new Date().toLocaleTimeString()}`;
        dateElement.classList.remove('text-orange-500');
        dateElement.classList.add('text-green-600');
        
        if (isNewBill) {
            const newBillData = await response.json();
            currentBillId = newBillData.id;
            const newUrl = `/bill-details?id=${currentBillId}`;
            history.pushState({ path: newUrl }, '', newUrl);
        }
    } catch (error) {
        const dateElement = document.getElementById('bill-details-date');
        dateElement.textContent = 'Save failed!';
        dateElement.classList.remove('text-orange-500');
        dateElement.classList.add('text-red-500');
        console.error('Auto-save failed:', error);
    }
}

function removeRow(button) {
    if (confirm("Are you sure you want to delete this item?")) {
        button.closest('tr').remove();
        updateTotalsAndSerialNumbers();
        triggerAutoSave();
    }
}

function updateTotalsAndSerialNumbers() {
    const rows = document.querySelectorAll('#bill-items-body tr.item-row');
    let grandTotal = 0;
    rows.forEach((row, index) => {
        row.querySelector('.s-no').textContent = index + 1;
        const finalTotalCell = row.querySelector('[data-field="final_total"]');
        grandTotal += parseFloat(finalTotalCell.textContent);
    });
    document.getElementById('grand-total').textContent = grandTotal.toFixed(2);
}

function triggerAutoSave() {
    clearTimeout(debounceTimer);
    const dateElement = document.getElementById('bill-details-date');
    dateElement.textContent = 'Saving...';
    dateElement.classList.remove('text-green-600', 'text-red-500');
    dateElement.classList.add('text-orange-500');
    debounceTimer = setTimeout(() => {
        saveOrUpdateBill();
    }, 1500);
}

