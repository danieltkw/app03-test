export default {
    // Flag to check if we are in test mode
    isTestMode: true,

    // Function to convert ID
    idConverter: (num) => {
        if (num === undefined || num === null) {
            console.error('idConverter: num is undefined or null');
            return '';
        }
        let str = num.toString();
        let leadingZeros = "00000".substring(0, 5 - str.length);
        return 'P' + leadingZeros + str;
    },

    // Function to get products
    getProducts: async function () {
        console.clear();

        // Fetch products using the configured query
        const products = await getProducts.run(); // Ensure `getProducts` query is correctly configured

        // Get selected category filter
        const categoryFilter = sel_category.selectedOptionValue;
        let filteredProducts = products;

        // Apply category filter if selected
        if (categoryFilter) {
            filteredProducts = products.filter(p => p.category === categoryFilter);
        }

        // Map products to the required format
        return filteredProducts.map(p => {
            return {
                ID: this.idConverter(p.id),
                Name: p.name,
                SKU: p.sku,
                Category: p.category,
                UnitPrice: p.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                Stock: p.total_stock,
                ProductID: p.id,
            };
        });
    },

    // Function to get categories
    getCategories: async function () {
        // Fetch products using the configured query
        const products = await getProducts.run(); // Ensure `getProducts` query is correctly configured
        const categories = products.map(p => p.category);
        const sanitisedCategories = categories.filter(category => category !== null && category.trim() !== "");

        // Provide default categories if no products are available
        if (!products || products.length < 1) {
            return [
                { id: 1, name: 'Food' },
                { id: 2, name: 'Gadget' }
            ];
        }

        // Extract unique categories
        const uniqueCategoriesRaw = {};
        sanitisedCategories.forEach(category => {
            uniqueCategoriesRaw[category] = true;
        });

        // Map unique categories to the required format
        const uniqueCategories = Object.keys(uniqueCategoriesRaw);
        return uniqueCategories.map((category, index) => {
            return { id: index, name: category };
        });
    },
};

// // ------------------------------------------------------------

// // ------------------------------------------------------------
// // Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// // ------------------------------------------------------------





