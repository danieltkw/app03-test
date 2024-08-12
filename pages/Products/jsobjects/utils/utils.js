export default {
    // Flag to check if we are in test mode
    isTestMode: true,

    // Function to convert ID to a formatted string with a 'P' prefix
    idConverter: (num) => {
        if (num === undefined || num === null) {
            console.error('idConverter: num is undefined or null');
            return '';
        }
        let str = num.toString();
        let leadingZeros = "00000".substring(0, 5 - str.length);
        return 'P' + leadingZeros + str;
    },

    // Function to fetch and filter products
    getProducts: async function () {
        console.clear();

        try {
            // Fetch products using the configured query
            const products = await getProducts.run(); 

            // Get selected category filter
            const categoryFilter = sel_category.selectedOptionValue;
            let filteredProducts = products;

            // Apply category filter if selected
            if (categoryFilter) {
                filteredProducts = products.filter(p => p.category === categoryFilter);
            }

            // Map products to the required format for display
            return filteredProducts.map(p => {
                return {
                    ID: this.idConverter(p.id),
                    Name: p.name,
                    SKU: p.sku,
                    Category: p.category,
                    UnitPrice: p.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }),
                    Stock: p.total_stock,
                    ProductID: p.id,
                };
            });

        } catch (error) {
            console.error('Error in getProducts:', error);
            return [];
        }
    },

    // Function to fetch unique categories from the products
    getCategories: async function () {
        try {
            const products = await getProducts.run(); 

            // Extract and sanitize categories
            const categories = products.map(p => p.category).filter(c => c !== null && c.trim() !== "");
            const uniqueCategories = [...new Set(categories)];

            // Return the categories with both label and value keys
            return uniqueCategories.map(category => ({
                label: category,
                value: category   
            }));

        } catch (error) {
            console.error('Error in getCategories:', error);
            return [];
        }
    },
};


// // ------------------------------------------------------------

// // ------------------------------------------------------------
// // Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// // ------------------------------------------------------------







