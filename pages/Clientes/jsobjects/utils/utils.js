export default {
    // Flag to check if we are in test mode
    isTestMode: true,

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
        if (this.isTestMode) {
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
        } else {
            const result = await getCustomers.run();
            customers = result.map(c => {
                return {
                    ID: this.idConverter(c.id),
                    CustomerID: c.id,
                    Name: `${c.first_name} ${c.last_name}`,
                    Phone: c.phone,
                    Email: c.email,
                    BillingAddress: `${c.address1 || ''}${c.city || ''}${c.country || ''}`,
                    ShippingAddress: `${c.address1 || ''}${c.city || ''}${c.country || ''}`,
                    vat: c.vat
                };
            });
        }
    } catch (error) {
        console.error('Error in getCustomers:', error);
        customers = [];
    }
    return customers;
	},

    // Fetches customer orders based on selected customer
    async getCustomerOrders() {
    console.clear();
    let customerOrders;
    try {
        if (this.isTestMode) {
            customerOrders = [
                {
                    OrderId: 1,
                    OrderDate: new Date().toDateString(),
                    Items: 3,
                    Amount: '150.00',
                    Status: 'DELIVERED'
                },
                {
                    OrderId: 2,
                    OrderDate: new Date().toDateString(),
                    Items: 1,
                    Amount: '50.00',
                    Status: 'SHIPPED'
                }
            ];
        } else {
            if (tbl_customers.selectedRow && tbl_customers.selectedRow.CustomerID) {
                const result = await getCustomerOrders.run();
                customerOrders = result.map(o => {
                    return {
                        OrderId: o.id,
                        OrderDate: new Date(o.created).toDateString(),
                        Items: o.order_line_count,
                        Amount: o.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                        Status: o.label
                    };
                });
            } else {
                console.error('getCustomerOrders: tbl_customers.selectedRow.CustomerID is undefined');
                customerOrders = [];
            }
        }
    } catch (error) {
        console.error('Error in getCustomerOrders:', error);
        customerOrders = [];
    }
    return customerOrders;
	},

    // Returns color based on order status
    statusColor: (status) => {
        switch(status) {
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

    // Adds a new customer
    addCustomer: async function() {
        console.clear();  // Clears the console for clean debugging
        try {
            if (this.isTestMode) {
                showAlert('Customer created (test mode)!', 'success');
                return {
                    ID: this.idConverter(3),
                    CustomerID: 3,
                    Name: 'Test User',
                    Phone: '000-000-0000',
                    Email: 'test.user@example.com',
                    BillingAddress: 'Test Address',
                    ShippingAddress: 'Test Address',
                    vat: '000000000'
                };
            } else {
                const person = await createPerson.run();  // Runs the query to create a person
                await createAccount.run({ personId: person[0].id });  // Runs the query to create an account
                await createLocation.run({ personId: person[0].id });  // Runs the query to create a location
                closeModal('mdl_addCustomer');  // Closes the modal
                await this.getCustomers();  // Refreshes the customers list
                showAlert('Customer created!', 'success');
            }
        } catch (error) {
            console.error('Error in addCustomer:', error);
        }
    }
};



// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------

