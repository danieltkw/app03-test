export default {
    isTestMode: true, // Flag to check if we are in test mode

    // Function to get or set default client ID
    getClientId: function() {
        if (appsmith.store.clientId) {
            return appsmith.store.clientId;
        } else {
            const defaultClientId = 1; // Set this to the desired default client ID
            storeValue("clientId", defaultClientId);
            return defaultClientId;
        }
    },

    // ID Converter Function
    idConverter: (num) => {
        if (num === undefined || num === null) {
            console.error('idConverter: num is undefined or null');
            return '';
        }
        let str = num.toString();
        let leadingZeros = "00000".substring(0, 5 - str.length);
        return 'R' + leadingZeros + str;
    },

    // Function to get returns
    getReturns: async function() {
        const clientId = this.getClientId();
        console.clear();

        if (this.isTestMode) {
            // Return mock data in test mode
            return [
                {
                    id: 1,
                    order_id: 101,
                    product_variant_id: 201,
                    quantity: 2,
                    product_id: 301,
                    price: 20.5,
                    name: 'Test Product',
                    type: 'Electronics',
                    label: 'Main Warehouse',
                    created: '2023-01-01T00:00:00Z',
                    returned_quantity: 2,
                    returned_date: '2023-01-05T00:00:00Z',
                    reason: 'Defective',
                    status: 'Return Initiated',
                    warehouse: 'Main Warehouse',
                    warehouse_id: 1
                },
                // More mock data if needed...
            ];
        }

        // Replace this with the actual query call to fetch returns
        const returns = await getReturns.run({ clientId: clientId });

        const fromDate = dat_from.formattedDate || null;
        const toDate = dat_to.formattedDate || null;

        let filteredReturns = returns;

        // Filter based on date range if fromDate and toDate are provided
        if (fromDate && toDate) {
            filteredReturns = returns.filter(k => new Date(k.created) >= new Date(fromDate) && new Date(k.created) <= new Date(toDate));
        }

        // Filter based on status if sel_status is provided
        if (sel_status.selectedOptionValue) {
            filteredReturns = filteredReturns.filter(k => k.status === sel_status.selectedOptionValue);
        }

        return filteredReturns.map(r => {
            return {
                Id: r.id,
                ID: this.idConverter(r.id),
                OrderID: r.order_id,
                Product: r.name,
                Description: r.category,
                ShippedQty: r.quantity,
                Quantity: r.returned_quantity,
                Amount: r.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                ReturnOrderID: 1,
                WarehouseName: r.label,
                ReturnedDate: new Date(r.returned_date).toDateString(),
                Reason: r.reason,
                Status: r.status,
                Warehouse: r.warehouse,
                WarehouseId: r.warehouse_id
            };
        }).sort((a, b) => a.id - b.id);
    },

    // Function to get warehouses
    getWarehouses: async function() {
        if (this.isTestMode) {
            // Return mock data in test mode
            return [
                { id: 1, name: 'Test Warehouse 1' },
                { id: 2, name: 'Test Warehouse 2' }
            ];
        }

        const returns = await getReturns.run();
        const warehouses = returns.map(p => {
            return {
                id: p.warehouse_id,
                name: p.warehouse
            }
        });
        const sanitisedWarehouses = warehouses.filter(warehouse => warehouse.name !== null && warehouse.name.trim() !== "");

        if (!returns || returns.length < 1) {
            return [
                { id: 1, name: 'Jamison Yard' },
                { id: 2, name: 'Brit Avenue' }
            ];
        }

        const uniqueWarehousesRaw = {};

        for (let i = 0; i < sanitisedWarehouses.length; i++) {
            uniqueWarehousesRaw[sanitisedWarehouses[i].name] = {
                id: sanitisedWarehouses[i].id
            };
        }

        const uniqueWarehouses = Object.keys(uniqueWarehousesRaw);

        return uniqueWarehouses.map((category) => {
            return {
                id: uniqueWarehousesRaw[category].id,
                name: category,
            };
        });
    },

    // Function to mark received
    markReceived: async function() {
        const selectedRow = tbl_returns.selectedRow;
        if (!selectedRow) {
            console.error('No return selected. Please select a return.');
            showAlert('Please select a return to proceed.', 'warning');
            return;
        }

        if (this.isTestMode) {
            console.log('Test mode: Mark as Received');
            return;
        }

        await markReceived.run();
        await this.getReturns();
        closeModal('mdl_returnsDetail');
        showAlert('Return Order Marked as Received!', 'success');
    },

    // Function to handle refund
    handleRefund: async function() {
        if (!sel_warehouse.selectedOptionValue || !sel_payment.selectedOptionValue) {
            return showAlert('Select warehouse and payment to continue', 'warning');
        }

        const selectedRow = tbl_returns.selectedRow;
        if (!selectedRow) {
            console.error('No return selected. Please select a return.');
            showAlert('Please select a return to proceed.', 'warning');
            return;
        }

        await handleRefund.run();
        await this.getReturns();
        closeModal('mdl_returnsDetail');
        showAlert('Refund Initiated!', 'success');
    },

    // Function to reset filters
    handleResetFilter: async function() {
        resetWidget('sel_status');
        resetWidget('dat_to');
        resetWidget('dat_from');
        await this.getReturns();
    },

    // Function to color status
    statusColor: (status) => {
        if (status === 'Return Initiated' || status === 'Received') {
            return 'RGB(255, 165, 0)';
        }
        if (status === 'Return Processed') {
            return 'RGB(0, 128, 0)';
        }
        return 'RGB(255, 165, 0)';
    },

    // Function to get orders (for future implementation)
    getOrders: async function() {
				const clientId = utils.getClientId();
        //const clientId = this.getClientId();
        return await getOrders.run({ clientId: clientId });
    },

    // Function to get products (for future implementation)
    getProducts: async function() {
  			const clientId = utils.getClientId();
        //const clientId = this.getClientId();
        return await getProducts.run({ clientId: clientId });
    },

    // Function to get invoices (for future implementation)
    getInvoices: async function() {
        const clientId = utils.getClientId();
				//const clientId = this.getClientId();
        return await getInvoices.run({ clientId: clientId });
    }
};




// ------------------------------------------------------------

// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------


