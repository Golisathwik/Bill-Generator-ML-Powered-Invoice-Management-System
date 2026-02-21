document.addEventListener('DOMContentLoaded', () => {
    const itemTableBody = document.getElementById('item-database-body');
    const searchInput = document.getElementById('search-items-db');
    const showAllBtn = document.getElementById('show-all-btn');
    const itemCountDisplay = document.getElementById('item-count-display');
    
    let allItems = [];
    let showAll = false;

    // --- Modal Elements ---\
    const modal = document.getElementById('item-modal');
    const openModalBtn = document.getElementById('add-new-item-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalForm = document.getElementById('item-modal-form');
    const modalTitle = document.getElementById('modal-title');
    const itemIdInput = document.getElementById('item-id-input');
    const itemNameInput = document.getElementById('item-name-input');
    const itemUnitInput = document.getElementById('item-unit-input'); // NEW
    const itemHsnInput = document.getElementById('item-hsn-input');   // NEW
    const itemCgstInput = document.getElementById('item-cgst-input');
    const itemSgstInput = document.getElementById('item-sgst-input');

    // --- Main Function to Fetch and Display Items ---
    const loadItems = async () => {
        try {
            const response = await fetch('/api/items');
            if (!response.ok) throw new Error('Network response was not ok');
            
            allItems = await response.json();
            filterAndDisplayItems(); 
        } catch (error) {
            console.error('Failed to load items:', error);
        }
    };

    const displayItems = (items) => {
        itemTableBody.innerHTML = '';
        const itemsToShow = showAll ? items : items.slice(0, 10);

        if (itemsToShow.length === 0) {
            itemTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No items found.</td></tr>`;
        } else {
            itemsToShow.forEach((item, index) => {
                const row = `
                    <tr class="border-b border-gray-200 hover:bg-gray-50">
                        <td class="py-3 px-4">${index + 1}</td>
                        <td class="py-3 px-4 font-medium">${item.item_name}</td>
                        <td class="py-3 px-4">${item.unit || 'Nos'}</td>
                        <td class="py-3 px-4">${item.hsn || '-'}</td>
                        <td class="py-3 px-4">${item.cgst}</td>
                        <td class="py-3 px-4">${item.sgst}</td>
                        <td class="py-3 px-4 text-center space-x-2">
                            <button class="text-blue-600 hover:text-blue-800 edit-btn" 
                                data-id="${item.id}" data-name="${item.item_name}" 
                                data-unit="${item.unit || ''}" data-hsn="${item.hsn || ''}"
                                data-cgst="${item.cgst}" data-sgst="${item.sgst}">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                            <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${item.id}">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                `;
                itemTableBody.innerHTML += row;
            });
        }
        itemCountDisplay.textContent = `Showing ${itemsToShow.length} of ${items.length} items`;
        showAllBtn.textContent = showAll ? 'Show Less' : 'Show All';
        showAllBtn.style.display = items.length > 10 ? 'inline-block' : 'none';
    };

    const filterAndDisplayItems = () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filtered = allItems.filter(item => 
            item.item_name.toLowerCase().includes(searchTerm)
        );
        displayItems(filtered);
    };

    // --- Event Listeners ---
    searchInput.addEventListener('keyup', filterAndDisplayItems);
    showAllBtn.addEventListener('click', () => {
        showAll = !showAll;
        filterAndDisplayItems();
    });

    // --- Modal Logic ---
    const openModalForNew = () => {
        modalForm.reset();
        modalTitle.textContent = 'Add New Item';
        itemIdInput.value = '';
        itemUnitInput.value = 'Nos'; // Default value
        modal.style.display = 'flex';
    };

    const openModalForEdit = (item) => {
        modalForm.reset();
        modalTitle.textContent = 'Edit Item';
        itemIdInput.value = item.id;
        itemNameInput.value = item.name;
        itemUnitInput.value = item.unit;
        itemHsnInput.value = item.hsn;
        itemCgstInput.value = item.cgst;
        itemSgstInput.value = item.sgst;
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    openModalBtn.addEventListener('click', openModalForNew);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    modalForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const id = itemIdInput.value;
        const itemData = {
            name: itemNameInput.value,
            unit: itemUnitInput.value,
            hsn: itemHsnInput.value,
            cgst: parseFloat(itemCgstInput.value),
            sgst: parseFloat(itemSgstInput.value)
        };

        const isUpdating = !!id;
        const url = isUpdating ? `/api/items/${id}` : '/api/item';
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save item.');
            }

            closeModal();
            loadItems();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // --- Event Delegation for Edit and Delete Buttons ---
    itemTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const id = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            const item = {
                id: id,
                name: target.dataset.name,
                unit: target.dataset.unit,
                hsn: target.dataset.hsn,
                cgst: target.dataset.cgst,
                sgst: target.dataset.sgst
            };
            openModalForEdit(item);
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                try {
                    const response = await fetch(`/api/items/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Failed to delete item.');
                    loadItems();
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            }
        }
    });

    loadItems(); // Initial load
});

