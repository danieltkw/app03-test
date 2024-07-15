export default {

    // Flag to check if we are in test mode
    isTestMode: true,

    idConverter: (num) => {
        if (num === undefined || num === null) {
            console.error('idConverter: num is undefined or null');
            return '';
        }
        let str = num.toString();
        let leadingZeros = "00000".substring(0, 5 - str.length);
        return 'C' + leadingZeros + str;
    },

    getCustomers: async function() {
        console.clear();
        if (this.isTestMode) {
            // Return mock data in test mode
            return [
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
            const customers = await getCustomers.run();
            return customers.map(c => {
                return {
                    ID: this.idConverter(c.id),
                    CustomerID: c.id,
                    Name: c.first_name + ' ' + c.last_name,
                    Phone: c.phone,
                    Email: c.email,
                    BillingAddress: `${c.address1}${ c.city || ''}${ c.country || ''}`,
                    ShippingAddress: `${c.address1}${ c.city || ''}${ c.country || ''}`,
                    vat: c.vat
                };
            });
        }
    },

    getCustomerOrders: async function() {
        console.clear();
        if (this.isTestMode) {
            // Return mock data in test mode
            return [
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
            const customerOrders = await getCustomerOrders.run();
            return customerOrders.map(o => {
                return {
                    OrderId: o.id,
                    OrderDate: new Date(o.created).toDateString(),
                    Items: o.order_line_count,
                    Amount: o.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                    Status: o.label
                };
            });
        }
    },

    statusColor: (status) => {
        if (status === 'CANCELLED') {
            return 'RGB(255, 0, 0)';
        }
        if (status === 'UNFULFILLED' || status === 'PACKED') {
            return 'RGB(255, 165, 0)';
        }
        if (status === 'SHIPPED' || status === 'DELIVERED') {
            return 'RGB(0, 128, 0)';
        }
        return 'RGB(255, 165, 0)';
    },

    addCustomer: async function() {
        console.clear();
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
            const person = await createPerson.run();
            await createAccount.run({
                personId: person[0].id
            });
            await createLocation.run({
                personId: person[0].id
            });
            closeModal('mdl_addCustomer');
            await this.getCustomers();
            showAlert('Customer created!', 'success');
        }
    }
};

// ------------------------------------------------------------

// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------

