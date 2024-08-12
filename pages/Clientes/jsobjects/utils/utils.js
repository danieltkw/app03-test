export default {
    // Converts numeric IDs to a string with leading zeros and 'C' prefix
    idConverter: (num) => {
        if (num === undefined || num === null) {
            console.error('idConverter: num is undefined or null');
            return '';
        }
        let str = num.toString();
        let leadingZeros = "00000".substring(0, 5 - str.length);
        return 'C' + leadingZeros + str;
    },

    // Fetches customers data
    async getCustomers() {
        console.clear();
        let customers;
        try {
            // Attempt to fetch data from the database
            const result = await getCustomers.run();  // Ensure getCustomers is correctly set up in Appsmith
            customers = result.map(c => {
                return {
                    ID: this.idConverter(c.user_id),
                    CustomerID: c.user_id,
                    Name: `${c.first_name} ${c.last_name}`,
                    Phone: c.phone,
                    Email: c.email,
                    BillingAddress: c.billing_address || '',  // Fallback to empty string if undefined
                    ShippingAddress: c.shipping_address || '', // Fallback to empty string if undefined
                    vat: c.vat_number
                };
            });
        } catch (error) {
            // If an error occurs, log it and fall back to Test Mode
            console.error('Error fetching customers from database, falling back to test mode:', error);
            customers = [
                {
                    ID: this.idConverter(1),
                    CustomerID: 1,
                    Name: 'John Doe',
                    Phone: '123-456-7890',
                    Email: 'john.doe@example.com',
                    BillingAddress: '123 Main St',
                    ShippingAddress: '123 Main St',
                    vat: '123456789'
                },
                {
                    ID: this.idConverter(2),
                    CustomerID: 2,
                    Name: 'Jane Smith',
                    Phone: '987-654-3210',
                    Email: 'jane.smith@example.com',
                    BillingAddress: '456 Elm St',
                    ShippingAddress: '456 Elm St',
                    vat: '987654321'
                }
            ];
        }
        return customers;
    },

    // Fetches customer orders based on selected customer
    async getCustomerOrders() {
        console.clear();
        let customerOrders;
        try {
            // Attempt to fetch data from the database
            const selectedRow = tbl_customers.selectedRow;
            if (selectedRow && selectedRow.CustomerID) {
                const result = await getCustomerOrders.run();  // Ensure getCustomerOrders is properly defined
                customerOrders = result.map(o => {
                    return {
                        OrderId: o.order_id,
                        OrderDate: new Date(o.created).toDateString(),
                        Items: o.items_count,
                        Amount: o.total.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }),
                        Status: o.delivery_status
                    };
                });
            } else {
                console.error('getCustomerOrders: tbl_customers.selectedRow.CustomerID is undefined');
                customerOrders = [];
            }
        } catch (error) {
            // If an error occurs, log it and fall back to Test Mode
            console.error('Error fetching customer orders from database, falling back to test mode:', error);
            customerOrders = [
                {
                    OrderId: 1,
                    OrderDate: new Date().toDateString(),
                    Items: 3,
                    Amount: '150.00 €',
                    Status: 'DELIVERED'
                },
                {
                    OrderId: 2,
                    OrderDate: new Date().toDateString(),
                    Items: 1,
                    Amount: '50.00 €',
                    Status: 'SHIPPED'
                }
            ];
        }
        return customerOrders;
    },

    // Returns color based on order status
    statusColor: (status) => {
        switch (status) {
            case 'CANCELLED':
                return 'RGB(255, 0, 0)';
            case 'UNFULFILLED':
            case 'PACKED':
                return 'RGB(255, 165, 0)';
            case 'SHIPPED':
            case 'DELIVERED':
                return 'RGB(0, 128, 0)';
            default:
                return 'RGB(255, 165, 0)';
        }
    },

    // Formats customer data for use in the application
    formatCustomerData: function (customer) {
        if (!customer) {
            console.error('formatCustomerData: customer is undefined');
            return {};
        }
        return {
            ID: this.idConverter(customer.user_id),
            CustomerID: customer.user_id,
            Name: `${customer.first_name} ${customer.last_name}`,
            Phone: customer.phone,
            Email: customer.email,
            BillingAddress: customer.billing_address,
            ShippingAddress: customer.shipping_address,
            vat: customer.vat_number
        };
    }
};


/*
MySQL Schema Alignment:

db_users table columns used:
- user_id: INT AUTO_INCREMENT PRIMARY KEY
- email: VARCHAR(255) NOT NULL UNIQUE
- password_hash: VARCHAR(255) NOT NULL
- first_name: VARCHAR(255) NOT NULL
- last_name: VARCHAR(255) NOT NULL
- phone: VARCHAR(20)
- vat_number: VARCHAR(9)
- role: ENUM('admin', 'client') DEFAULT 'client'
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

db_orders table columns used:
- order_id: INT AUTO_INCREMENT PRIMARY KEY
- user_id: INT NOT NULL
- created: DATETIME DEFAULT CURRENT_TIMESTAMP
- items_count: INT (Assumed to be the number of items in the order)
- total: DECIMAL(10, 2) NOT NULL
- delivery_status: VARCHAR(50)
*/




// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------

