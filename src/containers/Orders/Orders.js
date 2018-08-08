import React, { Component } from 'react';
import axios from '../../axios-orders';

import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import Order from '../../components/Order/Order';

class Orders extends Component {
  state = {
    orders: [],
    loading: true
  }
  componentDidMount() {
    const fetchOrders = [];
    axios.get('orders.json')
      .then(res => {
        for (let key in res.data) {
          fetchOrders.push({
            ...res.data[key],
            id: key
          })
        }
        this.setState({ loading: false, orders: fetchOrders })
      })
      .catch(err => {
        this.setState({ loading: false })
      })
  }
  render() {
    return (
      <div>
        {this.state.orders.map(order => {
          return <Order 
          key={order.id}
          ingredients={order.ingredients}
          price={order.price}/>
        })}
      </div>
    )
  }
}

export default withErrorHandler(Orders, axios);