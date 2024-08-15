export default {
    // Flag to check if we are in test mode
    isTestMode: false,

    idConverter: (num) => {
        if (num === undefined || num === null) {
            console.error('idConverter: num is undefined or null');
            return '';
        }
        let str = num.toString();
        let leadingZeros = "00000".substring(0, 5 - str.length);
        return 'R' + leadingZeros + str;
    },

    getReturns: async function() {
        console.clear();

        try {
            const returns = await getReturns.run();
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
                }
            }).sort((a, b) => a.id - b.id);
        } catch (error) {
            console.error('Error fetching returns:', error);
            return [];
        }
    },

    getWarehouses: async function() {
        try {
            const returns = await getReturns.run();
            const warehouses = returns.map(p => {
                return {
                    id: p.warehouse_id,
                    name: p.warehouse
                }
            });
            const sanitisedWarehouses = warehouses.filter(warehouse => warehouse.name !== null && warehouse.name.trim() !== "");

            const uniqueWarehousesRaw = {};
            sanitisedWarehouses.forEach(warehouse => {
                uniqueWarehousesRaw[warehouse.name] = {
                    id: warehouse.id
                };
            });

            const uniqueWarehouses = Object.keys(uniqueWarehousesRaw);

            return uniqueWarehouses.map((name) => {
                return {
                    id: uniqueWarehousesRaw[name].id,
                    name: name,
                };
            });
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            return [
                { id: 1, name: 'Jamison Yard' },
                { id: 2, name: 'Brit Avenue' }
            ];
        }
    },

    markReceived: async function() {
        try {
            await markReceived.run();
            await this.getReturns();
            closeModal('mdl_returnsDetail');
            showAlert('Return Order Marked as Received!', 'success');
        } catch (error) {
            console.error('Error marking as received:', error);
        }
    },

    handleRefund: async function() {
        if (!sel_warehouse.selectedOptionValue || !sel_payment.selectedOptionValue) {
            return showAlert('Select warehouse and payment to continue', 'warning');
        }

        try {
            await handleRefund.run();
            await this.getReturns();
            closeModal('mdl_returnsDetail');
            showAlert('Refund Initiated!', 'success');
        } catch (error) {
            console.error('Error handling refund:', error);
        }
    },

    statusColor: (status) => {
        switch (status) {
            case 'Return Initiated':
            case 'Received':
                return 'RGB(255, 165, 0)';
            case 'Return Processed':
                return 'RGB(0, 128, 0)';
            default:
                return 'RGB(255, 165, 0)';
        }
    },

    handleResetFilter: async function() {
        resetWidget('sel_status');
        resetWidget('dat_to');
        resetWidget('dat_from');
        await this.getReturns();
    },

    // Function to get orders
    getOrders: async () => {
        try {
            const orders = await getOrders.run(); // Ensure getOrders.run() fetches the correct data
            console.log(orders); // Debugging line to check data

            const fromDate = dat_from.formattedDate || null;
            const toDate = dat_to.formattedDate || null;

            let filteredOrders = orders;

            // Filter based on date range if fromDate and toDate are provided
            if (fromDate && toDate) {
                filteredOrders = filteredOrders.filter(k => new Date(k.created) >= new Date(fromDate) && new Date(k.created) <= new Date(toDate));
            }

            // Filter based on status if sel_status is provided
            if (sel_status.selectedOptionValue) {
                filteredOrders = filteredOrders.filter(k => k.status === sel_status.selectedOptionValue);
            }

            return filteredOrders.map(o => ({
                ID: this.idConverter(o.id),
                Order_id: o.id,
                Order_date: o.created,
                Customer: `${o.first_name} ${o.last_name}`,
                Total: o.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                DeliveryFee: o.shipping.toLocaleString('en-US', { style: 'currency', 'currency': 'USD' }),
                ShippingAddress: o.address1,
                Status: o.status,
                Phone: o.phone,
                Email: o.email,
                Carrier: o.carrier,
                ShippingDate: o.shipping_date,
                Eta: o.eta,
                WeightKg: o.weight_kg ? o.weight_kg.toString() : '',
                WeightLbs: o.weight_lbs ? o.weight_lbs.toString() : '',
                Width: o.width ? o.width.toString() : '',
                Length: o.length ? o.length.toString() : '',
                height: o.height ? o.height.toString() : '',
                Tracking: o.tracking_no
            })).sort((a, b) => a.id - b.id);
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    },

    onOrderSelected: async () => {
        try {
            const selectedOrder = tbl_orders.selectedRow;
            if (!selectedOrder) {
                console.error('No order selected');
                return;
            }

            // Log the selected order for debugging
            console.log('Selected Order:', selectedOrder);
            storeValue('order', selectedOrder);

            // Log the stored order for debugging
            console.log('Stored Order:', appsmith.store.order);

            // Fetch order products and order track details
            await this.getOrderProducts();
            await this.getOrderTrack();

            // Reset order products in the store
            storeValue('orderProducts', null);
            resetWidget('lst_orderProducts');

            showModal('mdl_orderDetails');
        } catch (error) {
            console.error('Error on order selection:', error);
        }
    },

    // Function to get order products
    getOrderProducts: async () => {
        try {
            const orderProducts = await getOrderProducts.run();

            return orderProducts.map(p => {
                return {
                    Id: p.id,
                    Name: p.name,
                    SKU: p.sku,
                    Price: p.price,
                    Quantity: p.quantity,
                    Tax: p.taxes,
                    Subtotal: parseInt(p.price) * parseInt(p.quantity),
                    Image: p.image,
                };
            });
        } catch (error) {
            console.error('Error fetching order products:', error);
            return [];
        }
    },

    // Function to get order tracking details
    getOrderTrack: async () => {
        try {
            const orderTrack = await getOrderTrack.run();

            return orderTrack.map((o, index) => {
                return {
                    id: index,
                    Status: o.label,
                    Date: new Date(o.created).toDateString(),
                    Time: new Date(o.created).toLocaleTimeString().slice(0, 5),
                };
            });
        } catch (error) {
            console.error('Error fetching order track:', error);
            return [];
        }
    },

    // Function to update order status
    updateStatus: async (statusId) => {
        try {
            if (!appsmith.store.orderProducts || appsmith.store.orderProducts.length < 1) {
                return showAlert('Pick products to continue', 'warning');
            }

            await updateOrderStatus.run({
                statusId,
            });

            await recordOrderTrack.run({
                orderStatusId: statusId
            });

            const orders = await this.getOrders();
            const order = orders.filter(o => o.Order_id === appsmith.store.order.Order_id);

            storeValue('order', order[0]);
            showAlert('Order Updated!', 'success');
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    },

    // Function to update order shipping details
    updateOrderShipping: async () => {
        try {
            if (!sel_carrier.selectedOptionValue) {
                return showAlert('Add carrier to continue!', 'warning');
            }

            await updateOrderShipping.run();

            await recordOrderTrack.run({
                orderStatusId: 3
            });

            await this.getOrders();

            const orders = await this.getOrders();
            const order = orders.filter(o => o.Order_id === appsmith.store.order.Order_id);

            storeValue('order', order[0]);
            resetWidget('tbl_orders');

            showAlert('Order Updated!', 'success');
        } catch (error) {
            console.error('Error updating order shipping details:', error);
        }
    },

    // Function to reset filters
    resetFilters: async () => {
        resetWidget('sel_status');
        resetWidget('dat_from');
        resetWidget('dat_to');

        await this.getOrders();
    },

    // Function to initialize the page
    init: async () => {
        try {
            const shippingDate = dat_shippingDate.formattedDate || new Date().toISOString();
            storeValue('defaultTab', 'Sales Order');
            storeValue('carrier', {
                id: 1,
                name: 'FedEX',
                shippingRate: 2.5,
                shippingDate: shippingDate,
                Eta: new Date(new Date(shippingDate).getTime() + (4 * 24 * 60 * 60 * 1000)).toDateString(),
            });
        } catch (error) {
            console.error('Error initializing page:', error);
        }
    },

    // Function to generate a random label code
    generateRandomLabelCode: () => {
        let code = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        for (let i = 0; i < 3; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        code += ' ';

        for (let i = 0; i < 3; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return code;
    },

    // Function to generate a label
    generateLabel: async () => {
        const imgUrl = 'https://s3.us-east-2.amazonaws.com/template.appsmith.com/order-fulfillment-tracker-demo-label.jpg';
        let doc = new jspdf.jsPDF();

        let pdfData = await getPdfImage.run({ url: imgUrl });

        //add image, scaled to fit 100% of doc width
        const docSize = _.pick(doc.internal.pageSize, ['width', 'height']);
        const imageSize = _.pick(doc.getImageProperties(pdfData), ['width', 'height']);
        const wRatio = docSize.width / imageSize.width;
        const newImgSize = { w: parseInt(imageSize.width * wRatio), h: parseInt(imageSize.height * wRatio) };
        await doc.addImage(pdfData, 'JPEG', 0, 0, newImgSize.w, newImgSize.h);

        //Set fonts and style
        const font = 'helvetica';
        const fontStyle = 'bold';
        const fontSize = 20;
        const textColor = 'black';
        doc.setFont(font, fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(textColor);

        const inputLength = inp_length.text || '';
        const inputWidth = inp_width.text || '';
        const inputHeight = inp_height.text || '';
        const code = this.generateRandomLabelCode();

        const labelData = [
            {
                data: 'Order ID #' + appsmith.store.order.ID,
                x: 130,
                y: 10,
                fontSize: 20,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: inp_shipFrom.text,
                x: 5,
                y: 90,
                fontSize: 20,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: code,
                x: 5,
                y: 140,
                fontSize: 24,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: appsmith.store.order.ShippingAddress,
                x: 5,
                y: 260,
                fontSize: 20,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: 'CARRIER: ' + 'UPS',
                x: 5,
                y: 45,
                fontSize: 22,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: dat_shippingDate.formattedDate,
                x: 5,
                y: 10,
                fontSize: 20,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: inp_kg.text.length > 0 ? `Weight: ${inp_kg.text}kg` : '',
                x: 80,
                y: 140,
                fontSize: 14,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: inp_lbs.text.length > 0 ? `${inp_lbs.text}lbs` : '',
                x: 120,
                y: 140,
                fontSize: 14,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: `DIMENSIONS: ${inputLength} x ${inputWidth} x ${inputHeight}`,
                x: 80,
                y: 125,
                fontSize: 14,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: inp_trackingId.text.length > 0 ? inp_trackingId.text : '',
                x: 70,
                y: 212,
                fontSize: 16,
                fontStyle: 'bold',
                font: 'helvetica',
            },

        ];

        // Loop through the template data and add the text to the PDF
        labelData.forEach((field) => {
            let fieldValue = field.data;
            fieldValue = typeof fieldValue == 'number' ? JSON.stringify(fieldValue) : fieldValue;
            doc.setFont(field.font, field.fontStyle);
            doc.setFontSize(field.fontSize);
            doc.text(fieldValue, field.x, field.y);
        });

        doc.save('mydocument.pdf');

        // Output to the browser
        const outputPDF = doc.output('dataurlstring');
        storeValue('labelPDF', outputPDF);
        return outputPDF;
    },

    // Function to generate an invoice
    generateInvoice: async () => {
        const imgUrl = 'https://s3.us-east-2.amazonaws.com/template.appsmith.com/order-fulfillment-tracker-demo-invoice.jpg';
        let doc = new jspdf.jsPDF();

        let pdfData = await getPdfImage.run({ url: imgUrl });

        //add image, scaled to fit 100% of doc width
        const docSize = _.pick(doc.internal.pageSize, ['width', 'height']);
        const imageSize = _.pick(doc.getImageProperties(pdfData), ['width', 'height']);
        const wRatio = docSize.width / imageSize.width;
        const newImgSize = { w: parseInt(imageSize.width * wRatio), h: parseInt(imageSize.height * wRatio) };
        await doc.addImage(pdfData, 'JPEG', 0, 0, newImgSize.w, newImgSize.h);

        //Set fonts and style
        const font = 'helvetica';
        const fontStyle = 'bold';
        const fontSize = 20;
        const textColor = 'black';
        doc.setFont(font, fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(textColor);

        const orderProductsName = tbl_orderProducts.tableData.map((p, index) => {
            return {
                data: p.Name,
                x: 20,
                y: 130 + index * 10,
                fontSize: 14,
                fontStyle: 'normal',
                font: 'helvetica',
            };
        });

        const orderProductsQty = tbl_orderProducts.tableData.map((p, index) => {
            return {
                data: p.Quantity,
                x: 110,
                y: 130 + index * 10,
                fontSize: 14,
                fontStyle: 'normal',
                font: 'helvetica',
            };
        });

        const orderProductsCost = tbl_orderProducts.tableData.map((p, index) => {
            return {
                data: p.Subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                x: 175,
                y: 130 + index * 10,
                fontSize: 14,
                fontStyle: 'normal',
                font: 'helvetica',
            };
        });

        const labelData = [
            ...orderProductsName,
            ...orderProductsQty,
            ...orderProductsCost,
            {
                data: tbl_orderProducts.tableData.reduce((a, b) => a + b.Subtotal, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                x: 170,
                y: 205,
                fontSize: 18,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: 'Order ID #' + appsmith.store.order.ID,
                x: 130,
                y: 25,
                fontSize: 18,
                fontStyle: 'bold',
                font: 'helvetica',
            },
            {
                data: inp_shipFrom.text || `1234 Industrial Blvd
Unit 5678
Cityville, State 98765



Phone: 988-989-9877`,
                x: 150,
                y: 60,
                fontSize: 14,
                fontStyle: 'normal',
                font: 'helvetica',
            },
            {
                data: appsmith.store.order.ShippingAddress,
                x: 10,
                y: 60,
                fontSize: 14,
                fontStyle: 'normal',
                font: 'helvetica',
            },
            {
                data: new Date(appsmith.store.order.Order_date).toDateString(),
                x: 10,
                y: 80,
                fontSize: 14,
                fontStyle: 'normal',
                font: 'helvetica',
            },
        ];

        // Loop through the template data and add the text to the PDF
        labelData.forEach((field) => {
            let fieldValue = field.data;
            fieldValue = typeof fieldValue == 'number' ? JSON.stringify(fieldValue) : fieldValue;
            doc.setFont(field.font, field.fontStyle);
            doc.setFontSize(field.fontSize);
            doc.text(fieldValue, field.x, field.y);
        });

        doc.save('mydocument.pdf');

        // Output to the browser
        const outputPDF = doc.output('dataurlstring');
        storeValue('labelPDF', outputPDF);
        return outputPDF;
    },
};


// ------------------------------------------------------------


// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------

