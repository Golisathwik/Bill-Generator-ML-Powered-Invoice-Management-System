document.addEventListener('DOMContentLoaded', () => {
    const billContainer = document.getElementById('bill-list-container');
    const searchInput = document.getElementById('search-payments');
    const statusFilter = document.getElementById('filter-status');
    const noBillsMessage = document.getElementById('no-bills-message');

    let allBills = [];

    const fetchBills = async () => {
        try {
            const response = await fetch('/api/bills');
            if (!response.ok) throw new Error('Failed to fetch bills');
            allBills = await response.json();
            renderBills();
        } catch (error) {
            console.error(error);
            billContainer.innerHTML = `<p class="text-red-500">Error loading bills.</p>`;
        }
    };

    const renderBills = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = statusFilter.value;

        const filteredBills = allBills.filter(bill => {
            const matchesSearch = bill.bill_number.toLowerCase().includes(searchTerm) ||
                                  String(bill.total_amount).includes(searchTerm);
            const matchesStatus = filterValue === 'all' || bill.payment_status === filterValue;
            return matchesSearch && matchesStatus;
        });

        billContainer.innerHTML = ''; // Clear previous content

        if (filteredBills.length === 0) {
            noBillsMessage.classList.remove('hidden');
        } else {
            noBillsMessage.classList.add('hidden');
            filteredBills.forEach(createBillCard);
        }
    };

    const createBillCard = (bill) => {
        const isPaid = bill.payment_status === 'Paid';

        const card = document.createElement('div');
        card.className = `bg-white p-5 rounded-lg shadow-md border-l-4 transition-all duration-300 ${isPaid ? 'border-green-500' : 'border-orange-500'}`;
        card.dataset.billId = bill.id;

        const statusBadgeClass = isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
        const toggleButtonClass = isPaid ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600';
        const toggleButtonText = isPaid ? 'Mark as Pending' : 'Mark as Paid';
        const toggleButtonIcon = isPaid ? 'fa-history' : 'fa-check';

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-bold text-lg text-gray-800">${bill.bill_number}</h3>
                    <p class="text-sm text-gray-500">${bill.date}</p>
                </div>
                <span class="text-xs font-semibold px-2 py-1 rounded-full ${statusBadgeClass}">
                    ${bill.payment_status}
                </span>
            </div>
            <div class="mt-4">
                <p class="text-2xl font-semibold text-gray-900">₹${bill.total_amount.toFixed(2)}</p>
            </div>
            <div class="mt-5 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button class="toggle-status-btn text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${toggleButtonClass}" data-bill-id="${bill.id}" data-current-status="${bill.payment_status}">
                    <i class="fas ${toggleButtonIcon} mr-1"></i> ${toggleButtonText}
                </button>
                <button class="delete-bill-btn bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors" data-bill-id="${bill.id}">
                    <i class="fas fa-trash-alt mr-1"></i> Delete
                </button>
            </div>
        `;
        billContainer.appendChild(card);
    };

    const handleStatusToggle = async (billId, currentStatus) => {
        const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
        try {
            const response = await fetch(`/api/bills/${billId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error('Failed to update status');
            
            // Update the local data and re-render for consistency
            const billToUpdate = allBills.find(b => b.id === parseInt(billId));
            if (billToUpdate) {
                billToUpdate.payment_status = newStatus;
                renderBills();
            }
        } catch (error) {
            console.error(error);
            alert('Error updating status.');
        }
    };

    const handleDelete = async (billId) => {
        if (!confirm('Are you sure you want to permanently delete this bill?')) return;

        try {
            const response = await fetch(`/api/bills/${billId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete bill');
            
            // Remove from local data and re-render
            allBills = allBills.filter(b => b.id !== parseInt(billId));
            renderBills();
        } catch (error) {
            console.error(error);
            alert('Error deleting bill.');
        }
    };

    // Event Listeners
    searchInput.addEventListener('keyup', renderBills);
    statusFilter.addEventListener('change', renderBills);

    billContainer.addEventListener('click', (event) => {
        const toggleBtn = event.target.closest('.toggle-status-btn');
        const deleteBtn = event.target.closest('.delete-bill-btn');

        if (toggleBtn) {
            handleStatusToggle(toggleBtn.dataset.billId, toggleBtn.dataset.currentStatus);
        }
        if (deleteBtn) {
            handleDelete(deleteBtn.dataset.billId);
        }
    });

    // Initial load
    fetchBills();
});
