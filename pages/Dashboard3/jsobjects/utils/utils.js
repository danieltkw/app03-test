export default {
  defaultTab: 'Sign In',
  testMode: true, // Set this to false to turn off test mode

  setDefaultTab(newTab) {
    this.defaultTab = newTab;
  },

  generateRandomValue() {
    return Math.random().toString(36).substring(2, 15);
  },

  generatePasswordHash() {
    const password = inp_registerPassword?.text || this.generateRandomValue();
    if (!inp_registerPassword?.text) {
      showAlert('No password entered, using random test value: ' + password, 'warning');
    }
    return dcodeIO.bcrypt.hashSync(password, 10);
  },

  async createToken(user) {
    return jsonwebtoken.sign(user, 'secret', { expiresIn: 60 * 60 });
  },

  async signIn() {
    const email = inp_email?.text || 'test@example.com';
    const password = inp_password?.text || 'password123';

    const [user] = await findUserByEmail.run({ email });

    if (user && this.verifyHash(password, user.password_hash)) {
      await storeValue('token', await this.createToken(user));
      await updateLogin.run({ id: user.id });
      showAlert('Login Success', 'success');
    } else {
      showAlert('Invalid email/password combination', 'error');
    }
  },

  async register() {
    const passwordHash = this.generatePasswordHash();
    const firstName = inp_firstName?.text || 'John';
    const lastName = inp_lastName?.text || 'Doe';
    const email = inp_registerEmail?.text || 'test@example.com';

    const [user] = await createUser.run({
      firstName,
      lastName,
      email,
      passwordHash
    });

    if (user) {
      await storeValue('token', await this.createToken(user));
      showAlert('Register Success', 'success');
    } else {
      showAlert('Error creating new user', 'error');
    }
  },

  verifyHash(password, hash) {
    return dcodeIO.bcrypt.compareSync(password, hash);
  },

  async generateInvoice() {
    const doc = new jsPDF();
    doc.text("Hello, World!", 10, 10);
    doc.save("example.pdf");
  },

  async dashboardMetrics() {
    const orders = await getOrders.run();
    const returnsCount = await getReturnsCount.run();

    const allOrders = orders.length;
    const fulfilledOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const unfulfilledOrders = orders.filter(o => o.status === 'UNFULFILLED').length;
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
    const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length;
    const packedOrders = orders.filter(o => o.status === 'PACKED').length;
    const totalOrderValue = orders.reduce((a, b) => a + b.total, 0);
    const formattedOrderValueAmount = totalOrderValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).slice(0, -3);

    return {
      allOrders,
      fulfilledOrders,
      unfulfilledOrders,
      cancelledOrders,
      shippedOrders,
      packedOrders,
      returnsCount: returnsCount[0].count,
      totalOrderValue: formattedOrderValueAmount,
    };
  },

  async topOrderedProductsChart() {
    const orderedProductsCount = await getOrderProductCount.run();

    return orderedProductsCount.map(p => {
      return {
        x: p.name,
        y: p.variant_count
      };
    });
  },

  async revenueChart() {
    try {
      const revenueByMonth = await getRevenueByMonth.run();

      const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
      ];

      return revenueByMonth.map(r => {
        return {
          x: months[parseInt(r.month.substring(5)) - 1] + ' ' + r.month.substring(2, 4),
          y: r.total,
        };
      });
    } catch (error) {
      console.error('Error in revenueChart:', error);
      return [];
    }
  },

  async calculateAvFulfilTime() {
    const data = await getReturns.run();

    const orders = {};

    // Group the orders by their ID
    data.forEach((row) => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          order_id: row.order_id,
          first_created: row.created,
          last_created: row.created,
          count: 1,
        };
      } else {
        const order = orders[row.order_id];
        if (row.created < order.first_created) {
          order.first_created = row.created;
        }
        if (row.created > order.last_created) {
          order.last_created = row.created;
        }
        order.count += 1;
      }
    });

    // Calculate the average time for each order
    const averages = [];
    Object.values(orders).forEach((order) => {
      if (order.count > 1) {
        const firstDate = new Date(order.first_created);
        const lastDate = new Date(order.last_created);
        const diffTime = Math.abs(lastDate - firstDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        averages.push({ order_id: order.order_id, avg_time: diffDays });
      }
    });

    // Calculate the overall average time
    const total = averages.reduce((acc, { avg_time }) => acc + avg_time, 0);
    const overallAvg = total / averages.length;

    return overallAvg ? overallAvg.toFixed(2) : 1.2;
  }
};

// ------------------------------------------------------------
// // Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------



